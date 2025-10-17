---
timestamp: 'Thu Oct 16 2025 18:31:24 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_183124.c1d2bdb9.md]]'
content_id: 76d02013a16195832704825ac02c4838f1ca6fbe66af4a039ed596bce70d9f98
---

# implement: MealLog using the following framework. Fix any formatting and modularity issues and make sure the specification matches code made. Write the code in typescript. Edit the following so that you use MongoDB when a database is needed and use asyncs when needed. Remember that this is an app that many users will use at the same time, but only the user will be able to access their own meal logs.

### Concept: MealLog \[User, FoodItem]

**purpose** Capture meals quickly with minimal friction.

**principle** A user records a meal with time, items, and an optional note; meals can be edited or deleted. This concept stores facts only.

**state**

* A set of Meals with:
  * owner: User
  * at: Time
  * items: Set(FoodItem)
  * notes: String (optional)
  * status: {active, deleted}

**actions**

* `submit(owner: User, at: Time, items: Set(FoodItem), notes?: String): (meal: Meal)`
  * **requires:** owner exists and items is nonempty
  * **effects:** create an active meal and return it
* `edit(meal: Meal, items?: Set(FoodItem), notes?: String)`
  * **requires:** meal exists and caller is the owner and status is active
  * **effects:** update provided fields
* `delete(meal: Meal)`
  * **requires:** meal exists and caller is the owner and status is active
  * **effects:** set status = deleted

Here's the concept design for `MealLog` and its corresponding implementation in TypeScript, addressing formatting, modularity, and ensuring the specification aligns with the code.

***

## Concept: MealLog \[User, FoodItem]

**purpose** Capture meals quickly with minimal friction.

**principle** A user records a meal with time, items, and an optional note; meals can be edited or deleted. This concept stores facts only.

**state**

* A set of Meals with:
  * owner: User
  * at: Date
  * items: Set(FoodItem)
  * notes: String (optional)
  * status: {active, deleted}

**actions**

* `submit(owner: User, at: Date, items: Set(FoodItem), notes?: String): Meal`
  * **requires:** owner exists (is not null/undefined) and items is nonempty
  * **effects:** create an active meal and return it
* `edit(caller: User, meal: Meal, items?: Set(FoodItem), notes?: String)`
  * **requires:** meal exists in this log, caller is the owner of the meal (by ID), and meal status is active. If `items` is provided, it must be nonempty.
  * **effects:** update provided fields of the meal.
* `delete(caller: User, meal: Meal)`
  * **requires:** meal exists in this log, caller is the owner of the meal (by ID), and meal status is active
  * **effects:** set meal status = deleted

***

## Code Implementation

```typescript
// --- Generic Type Definitions ---
// These interfaces define the minimal structure required for generic User and FoodItem types.
// In a real application, these would be richer interfaces or classes.
// We assume User has a unique 'id' for comparison purposes.
type UserId = string;

interface User {
    id: UserId;
    // Add other relevant user properties here, e.g., name: string;
}

interface FoodItem {
    id: string;
    // Add other relevant food item properties here, e.g., name: string;
}

// --- State Modeling Language ---

enum MealStatus {
    ACTIVE = "active",
    DELETED = "deleted",
}

/**
 * Custom Error class for permission-related failures.
 */
class PermissionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "PermissionError";
    }
}

/**
 * Represents a single meal entry within the MealLog concept.
 * It is generic over the User and FoodItem types.
 */
class Meal<U extends User, F extends FoodItem> {
    public readonly meal_id: string; // Unique identifier for the meal
    public readonly owner: U;
    public at: Date;
    public items: Set<F>;
    public notes?: string;
    public status: MealStatus;

    /**
     * Initializes a new active meal.
     * @param owner The user who owns this meal.
     * @param at The date and time the meal was consumed.
     * @param items A set of food items included in the meal.
     * @param notes Optional notes for the meal.
     * @throws Error if owner is null/undefined or items is empty.
     */
    constructor(owner: U, at: Date, items: Set<F>, notes?: string) {
        if (!owner) {
            throw new Error("Meal owner cannot be undefined or null.");
        }
        if (!items || items.size === 0) {
            throw new Error("A meal must contain at least one food item.");
        }

        // Generate a unique ID for the meal.
        // crypto.randomUUID() is available in Node.js (v14+) and modern browsers.
        // For older environments, a polyfill or alternative UUID library (e.g., 'uuid' npm package) might be needed.
        this.meal_id = crypto.randomUUID();
        this.owner = owner;
        this.at = at;
        // Create a new Set to ensure internal state is not directly mutable by external references
        this.items = new Set(items);
        this.notes = notes;
        this.status = MealStatus.ACTIVE;
    }

    /**
     * Provides a string representation for debugging and logging.
     */
    public toString(): string {
        return (
            `Meal(ID=${this.meal_id.substring(0, 8)}..., OwnerID=${this.owner.id}, ` +
            `Time=${this.at.toISOString()}, Status=${this.status})`
        );
    }
}

/**
 * Concept: MealLog [User, FoodItem]
 *
 * Purpose: Capture meals quickly with minimal friction.
 *
 * Principle: A user records a meal with time, items, and an optional note;
 *            meals can be edited or deleted. This concept stores facts only.
 *
 * This class implements the MealLog concept, managing a collection of Meal objects.
 * It ensures that actions adhere to the defined requirements and effects.
 */
class MealLog<U extends User, F extends FoodItem> {
    // Internal storage for meals, keyed by their unique meal_id.
    private _meals: Map<string, Meal<U, F>>;

    /**
     * Initializes an empty MealLog.
     */
    constructor() {
        this._meals = new Map();
    }

    /**
     * Helper method to retrieve a meal from the internal storage by its ID.
     * @param mealId The unique ID of the meal.
     * @returns The Meal object if found, otherwise undefined.
     */
    private _getMealById(mealId: string): Meal<U, F> | undefined {
        return this._meals.get(mealId);
    }

    // --- Actions ---

    /**
     * Action: submit
     * Purpose: Records a new meal entry.
     *
     * @param owner The user submitting the meal.
     * @param at The time the meal was consumed.
     * @param items A set of food items in the meal.
     * @param notes Optional notes for the meal.
     * @returns The newly created `Meal` object.
     *
     * Requires:
     * - `owner` exists (is not undefined/null).
     * - `items` is nonempty.
     *
     * Effects:
     * - Creates a new `Meal` instance with status `ACTIVE`.
     * - Adds the new meal to the log.
     *
     * Throws:
     * - Error: If `owner` is null/undefined or `items` is empty.
     */
    public submit(owner: U, at: Date, items: Set<F>, notes?: string): Meal<U, F> {
        // Requirements check (partially handled by Meal constructor, but explicit here for clarity)
        if (!owner) {
            throw new Error("Owner cannot be undefined or null.");
        }
        if (!items || items.size === 0) {
            throw new Error("Items set cannot be empty.");
        }

        // Effects
        const newMeal = new Meal(owner, at, items, notes);
        this._meals.set(newMeal.meal_id, newMeal);
        return newMeal;
    }

    /**
     * Action: edit
     * Purpose: Modifies an existing meal entry.
     *
     * @param caller The user attempting to edit the meal.
     * @param meal The meal object to be edited (its meal_id is used for lookup).
     * @param items Optional new set of food items.
     * @param notes Optional new notes string.
     *
     * Requires:
     * - `meal` exists in this log (identified by its ID).
     * - `caller` is the owner of the `meal` (compared by `id`).
     * - `meal` status is `ACTIVE`.
     * - If `items` is provided, it must be nonempty.
     *
     * Effects:
     * - Updates the `items` and/or `notes` fields of the `meal` if provided.
     *
     * Throws:
     * - Error: If the meal does not exist, is not active, or updated items are empty.
     * - PermissionError: If `caller` is not the owner of the meal.
     */
    public edit(caller: U, meal: Meal<U, F>, items?: Set<F>, notes?: string): void {
        // Requirements check
        const trackedMeal = this._getMealById(meal.meal_id);
        if (!trackedMeal) {
            throw new Error(`Meal with ID '${meal.meal_id}' does not exist in this log.`);
        }
        // Compare users by their unique ID
        if (trackedMeal.owner.id !== caller.id) {
            throw new PermissionError("Caller is not the owner of this meal.");
        }
        if (trackedMeal.status !== MealStatus.ACTIVE) {
            throw new Error(`Cannot edit a meal that is not active. Current status: ${trackedMeal.status}`);
        }

        // Effects
        if (items !== undefined) {
            if (items.size === 0) {
                throw new Error("Items set cannot be empty when updating.");
            }
            // Replace with a new Set to maintain immutability principles for sets
            trackedMeal.items = new Set(items);
        }
        if (notes !== undefined) {
            trackedMeal.notes = notes;
        }
    }

    /**
     * Action: delete
     * Purpose: Marks a meal entry as deleted.
     *
     * @param caller The user attempting to delete the meal.
     * @param meal The meal object to be deleted (its meal_id is used for lookup).
     *
     * Requires:
     * - `meal` exists in this log (identified by its ID).
     * - `caller` is the owner of the `meal` (compared by `id`).
     * - `meal` status is `ACTIVE`.
     *
     * Effects:
     * - Sets the `status` of the `meal` to `DELETED`.
     *
     * Throws:
     * - Error: If the meal does not exist or is not active.
     * - PermissionError: If `caller` is not the owner of the meal.
     */
    public delete(caller: U, meal: Meal<U, F>): void {
        // Requirements check
        const trackedMeal = this._getMealById(meal.meal_id);
        if (!trackedMeal) {
            throw new Error(`Meal with ID '${meal.meal_id}' does not exist in this log.`);
        }
        // Compare users by their unique ID
        if (trackedMeal.owner.id !== caller.id) {
            throw new PermissionError("Caller is not the owner of this meal.");
        }
        if (trackedMeal.status !== MealStatus.ACTIVE) {
            throw new Error(`Cannot delete a meal that is not active. Current status: ${trackedMeal.status}`);
        }

        // Effects
        trackedMeal.status = MealStatus.DELETED;
    }

    // --- Utility Methods (not formal actions, but helpful for concept interaction) ---

    /**
     * Retrieves meals associated with a specific owner.
     * @param ownerId The ID of the user whose meals are to be retrieved.
     * @param includeDeleted If true, includes meals marked as deleted; otherwise, only active meals.
     * @returns An array of Meal objects owned by the specified user.
     */
    public getMealsForOwner(ownerId: UserId, includeDeleted: boolean = false): Meal<U, F>[] {
        const results: Meal<U, F>[] = [];
        for (const meal of this._meals.values()) {
            if (meal.owner.id === ownerId && (includeDeleted || meal.status === MealStatus.ACTIVE)) {
                results.push(meal);
            }
        }
        return results;
    }

    /**
     * Retrieves a meal by its unique ID.
     * @param mealId The unique ID of the meal to retrieve.
     * @returns The Meal object if found, otherwise undefined.
     */
    public getMealById(mealId: string): Meal<U, F> | undefined {
        return this._getMealById(mealId);
    }
}
```
