---
timestamp: 'Fri Nov 07 2025 00:43:35 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_004335.2603216d.md]]'
content_id: 81a9ca803c6bffebf4f31fca4c41ab2a573bdc493df46ca862b1dc4389d630cb
---

# file: src/MealLog/MealLogConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "MealLog";

// --- Generic Type Definitions & State ---

/**
 * Generic parameter for the user who owns the meal log.
 * Treated as an opaque ID.
 */
type User = ID;

/**
 * Generic parameter for a single meal entry.
 */
type Meal = ID;

/**
 * Represents a food item within a meal. This is treated as a value object,
 * not a generic entity reference, so it's defined as a structured type.
 */
interface FoodItem {
  id: string;
  name: string;
  // Other properties like calories, quantity, etc., could be included.
}

/**
 * Enumeration for the status of a meal entry.
 */
enum MealStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
}

/**
 * MongoDB document structure for a Meal.
 * Mapped from the SSF:
 * a set of Meals with
 *   an owner User
 *   an at Date
 *   an items set of FoodItem
 *   an optional notes String
 *   a status of ACTIVE or DELETED
 */
interface MealDocument {
  _id: Meal;
  owner: User;
  at: Date;
  items: FoodItem[];
  notes?: string;
  status: MealStatus;
}

/**
 * @concept MealLog [User]
 * @purpose Capture meals quickly with minimal friction.
 * @principle A user records a meal with a time and a set of food items. They can later edit the meal's items or notes, or delete the meal entirely. Access to a meal log is restricted to its owner.
 */
export default class MealLogConcept {
  public readonly meals: Collection<MealDocument>;

  constructor(db: Db) {
    this.meals = db.collection<MealDocument>(PREFIX);
  }

  //
  // ACTIONS
  //

  /**
   * submit (owner: User, at: Date, items: set of FoodItem, notes: optional String): (meal: Meal)
   *
   * **requires** `items` array is not empty.
   *
   * **effects** Creates a new Meal document with status ACTIVE, owned by `owner`, and returns its ID.
   */
  async submit(
    { owner, at, items, notes }: { owner: User; at: Date; items: FoodItem[]; notes?: string },
  ): Promise<{ meal: Meal } | { error: string }> {
    if (!items || items.length === 0) {
      return { error: "A meal must contain at least one food item." };
    }

    const mealId = freshID() as Meal;
    const mealDoc: MealDocument = {
      _id: mealId,
      owner,
      at,
      items,
      notes,
      status: MealStatus.ACTIVE,
    };

    await this.meals.insertOne(mealDoc);
    return { meal: mealId };
  }

  /**
   * edit (caller: User, meal: Meal, at: optional Date, items: optional set of FoodItem, notes: optional String): () | (error: String)
   *
   * **requires**
   * - A Meal with the given `meal` ID exists.
   * - The `caller` is the owner of the meal.
   * - The meal's status is ACTIVE.
   * - If `items` is provided, it must not be empty.
   *
   * **effects** Updates the `at`, `items`, and/or `notes` fields of the specified Meal document.
   */
  async edit(
    { caller, meal, at, items, notes }: { caller: User; meal: Meal; at?: Date; items?: FoodItem[]; notes?: string },
  ): Promise<Empty | { error: string }> {
    const mealDoc = await this.meals.findOne({ _id: meal });

    if (!mealDoc) {
      return { error: `Meal with ID '${meal}' does not exist.` };
    }
    if (mealDoc.owner !== caller) {
      return { error: "Caller is not the owner of this meal." };
    }
    if (mealDoc.status !== MealStatus.ACTIVE) {
      return { error: `Cannot edit a meal that is not active. Current status: ${mealDoc.status}` };
    }
    if (items !== undefined && items.length === 0) {
      return { error: "Items array cannot be empty when updating." };
    }

    const updateFields: Partial<Pick<MealDocument, "at" | "items" | "notes">> = {};
    if (at !== undefined) {
      updateFields.at = at;
    }
    if (items !== undefined) {
      updateFields.items = items;
    }
    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    if (Object.keys(updateFields).length > 0) {
      await this.meals.updateOne({ _id: meal }, { $set: updateFields });
    }

    return {};
  }

  /**
   * delete (caller: User, meal: Meal): () | (error: String)
   *
   * **requires**
   * - A Meal with the given `meal` ID exists.
   * - The `caller` is the owner of the meal.
   * - The meal's status is ACTIVE.
   *
   * **effects** Sets the status of the specified Meal document to DELETED.
   */
  async delete(
    { caller, meal }: { caller: User; meal: Meal },
  ): Promise<Empty | { error: string }> {
    const mealDoc = await this.meals.findOne({ _id: meal });

    if (!mealDoc) {
      return { error: `Meal with ID '${meal}' does not exist.` };
    }
    if (mealDoc.owner !== caller) {
      return { error: "Caller is not the owner of this meal." };
    }
    if (mealDoc.status !== MealStatus.ACTIVE) {
      return { error: `Cannot delete a meal that is not active. Current status: ${mealDoc.status}` };
    }

    await this.meals.updateOne({ _id: meal }, { $set: { status: MealStatus.DELETED } });

    return {};
  }

  //
  // QUERIES
  //

  /**
   * _getMealById (meal: Meal): (meal: MealDocument)
   *
   * **requires** A meal with the given ID exists.
   * **effects** Returns the full Meal document.
   */
  async _getMealById({ meal }: { meal: Meal }): Promise<{ meal: MealDocument }[]> {
    const doc = await this.meals.findOne({ _id: meal });
    return doc ? [{ meal: doc }] : [];
  }

  /**
   * _getMealsByOwner (owner: User, includeDeleted: optional Flag): (meal: MealDocument)
   *
   * **requires** true
   * **effects** Returns all Meal documents owned by the specified user.
   */
  async _getMealsByOwner(
    { owner, includeDeleted = false }: { owner: User; includeDeleted?: boolean },
  ): Promise<{ meal: MealDocument }[]> {
    const query: { owner: User; status?: MealStatus } = { owner };
    if (!includeDeleted) {
      query.status = MealStatus.ACTIVE;
    }
    const docs = await this.meals.find(query).toArray();
    return docs.map((doc) => ({ meal: doc }));
  }

  /**
   * _getMealOwner (meal: Meal): (owner: User)
   *
   * **requires** A meal with the given ID exists.
   * **effects** Returns the owner of the specified meal. Useful for authorization syncs.
   */
  async _getMealOwner({ meal }: { meal: Meal }): Promise<{ owner: User }[]> {
    const doc = await this.meals.findOne({ _id: meal }, { projection: { owner: 1 } });
    return doc ? [{ owner: doc.owner }] : [];
  }
}
```
