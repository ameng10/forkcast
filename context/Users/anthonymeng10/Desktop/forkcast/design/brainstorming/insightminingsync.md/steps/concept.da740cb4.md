---
timestamp: 'Fri Nov 07 2025 13:31:20 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_133120.e9d9a6b0.md]]'
content_id: da740cb48319e6e57602161d8fe9b48d9a4c2ca2efa3a51a8731693b6113f4f1
---

# concept: PersonalQA

**concept** PersonalQA \[User]

**purpose** enable a user to get synthesized answers to questions based on a personal knowledge base of ingested facts

**principle** after a user ingests several facts about their activities, they can ask a question related to those facts and receive a synthesized answer that cites the relevant information

**state**

```
a set of Facts with
  an owner User
  an at Date
  a content String
  a source of MEAL or CHECK_IN or INSIGHT or BEHAVIOR

a set of QAs with
  an owner User
  a question String
  an answer String
  a citedFacts set of Fact
  an optional confidence Number
  an at Date

a set of Drafts with
  an owner User
  a question String
  a raw String
  a validated Flag
  an at Date

a Templates set of Users with
  a name String
  a text String
```

**actions**

ingestFact (owner: User, at: Date, content: String, source: String): (fact: Fact)
**requires** true
**effects** creates a new Fact with the given properties, owned by `owner`; returns the new Fact's ID as `fact`

forgetFact (requester: User, owner: User, factId: Fact): (ok: Flag) or (error: String)
**requires** `requester` is the same as `owner`
**effects** if the fact `factId` exists and its owner is `owner`, deletes the fact and returns `ok`; otherwise returns an error

ask (requester: User, question: String): (qa: QA)
**requires** true
**effects** analyzes the `requester`'s existing facts to find those relevant to the `question`; creates a conservative summary as an answer; creates a new QA entry with the question, answer, and cited facts; returns the new QA's ID as `qa`

askLLM (requester: User, question: String, optional k: Number): (qa: QA)
**requires** true
**effects** selects the `k` most recent facts for the `requester`; uses a user-specific or default template to generate a prompt for an external LLM; if an LLM is available, sends the prompt and records the response as the answer; creates a `Draft` to log the LLM interaction; if no LLM is available, generates a conservative summary as the answer; creates a new QA entry with the question, answer, and cited facts; returns the new QA's ID as `qa`

setTemplate (requester: User, name: String, template: String): (ok: Flag)
**requires** true
**effects** creates or updates the LLM prompt template associated with the `requester`, setting its name and text; returns `ok`

**queries**

\_getUserFacts (owner: User): (facts: set of FactDoc)
**requires** `owner` exists
**effects** returns all facts for the given `owner`

\_getUserQAs (owner: User): (qas: set of QADoc)
**requires** `owner` exists
**effects** returns all QAs for the given `owner`

\_getUserDrafts (owner: User): (drafts: set of DraftDoc)
**requires** `owner` exists
**effects** returns all drafts for the given `owner`

import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "MealLog";

// --- Generic Type Definitions & State ---

/\*\*

* Generic parameter for the user who owns the meal log.
* Treated as an opaque ID.
  \*/
  type User = ID;

/\*\*

* Generic parameter for a single meal entry.
  \*/
  type Meal = ID;

/\*\*

* Represents a food item within a meal. This is treated as a value object,
* not a generic entity reference, so it's defined as a structured type.
  \*/
  interface FoodItem {
  id: string;
  name: string;
  // Other properties like calories, quantity, etc., could be included.
  }

/\*\*

* Enumeration for the status of a meal entry.
  \*/
  enum MealStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
  }

/\*\*

* MongoDB document structure for a Meal.
* Mapped from the SSF:
* a set of Meals with
* an owner User
* an at Date
* an items set of FoodItem
* an optional notes String
* a status of ACTIVE or DELETED
  \*/
  interface MealDocument {
  \_id: Meal;
  owner: User;
  at: Date;
  items: FoodItem\[];
  notes?: string;
  status: MealStatus;
  }

/\*\*

* @concept MealLog \[User]
* @purpose Capture meals quickly with minimal friction.
* @principle A user records a meal with a time and a set of food items. They can later edit the meal's items or notes, or delete the meal entirely. Access to a meal log is restricted to its owner.
  \*/
  export default class MealLogConcept {
  public readonly meals: Collection<MealDocument>;

constructor(db: Db) {
this.meals = db.collection<MealDocument>(PREFIX);
}

//
// ACTIONS
//

/\*\*

* submit (owner: User, at: Date, items: set of FoodItem, notes: optional String): (meal: Meal)
*
* **requires** `items` array is not empty.
*
* **effects** Creates a new Meal document with status ACTIVE, owned by `owner`, and returns its ID.
  \*/
  async submit(
  { owner, at, items, notes }: {
  owner: User;
  at: Date;
  items: FoodItem\[];
  notes?: string;
  },
  ): Promise<{ meal: Meal } | { error: string }> {
  if (!items || items.length === 0) {
  return { error: "A meal must contain at least one food item." };
  }

```
const mealId = freshID() as Meal;
```

```
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
```

}

/\*\*

* edit (caller: User, meal: Meal, at: optional Date, items: optional set of FoodItem, notes: optional String): () | (error: String)
*
* **requires**
* * A Meal with the given `meal` ID exists.
* * The `caller` is the owner of the meal.
* * The meal's status is ACTIVE.
* * If `items` is provided, it must not be empty.
*
* **effects** Updates the `at`, `items`, and/or `notes` fields of the specified Meal document.
  \*/
  async edit(
  { caller, meal, at, items, notes }: {
  caller: User;
  meal: Meal;
  at?: Date;
  items?: FoodItem\[];
  notes?: string;
  },
  ): Promise\<Empty | { error: string }> {
  const mealDoc = await this.meals.findOne({ \_id: meal });

```
if (!mealDoc) {
```

```
  return { error: `Meal with ID '${meal}' does not exist.` };
}
if (mealDoc.owner !== caller) {
  return { error: "Caller is not the owner of this meal." };
}
if (mealDoc.status !== MealStatus.ACTIVE) {
  return {
    error:
      `Cannot edit a meal that is not active. Current status: ${mealDoc.status}`,
  };
}
if (items !== undefined && items.length === 0) {
  return { error: "Items array cannot be empty when updating." };
}

const updateFields: Partial<Pick<MealDocument, "at" | "items" | "notes">> =
  {};
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
```

}

/\*\*

* delete (caller: User, meal: Meal): () | (error: String)
*
* **requires**
* * A Meal with the given `meal` ID exists.
* * The `caller` is the owner of the meal.
* * The meal's status is ACTIVE.
*
* **effects** Sets the status of the specified Meal document to DELETED.
  \*/
  async delete(
  { caller, meal }: { caller: User; meal: Meal },
  ): Promise\<Empty | { error: string }> {
  const mealDoc = await this.meals.findOne({ \_id: meal });

```
if (!mealDoc) {
```

```
  return { error: `Meal with ID '${meal}' does not exist.` };
}
if (mealDoc.owner !== caller) {
  return { error: "Caller is not the owner of this meal." };
}
if (mealDoc.status !== MealStatus.ACTIVE) {
  return {
    error:
      `Cannot delete a meal that is not active. Current status: ${mealDoc.status}`,
  };
}

await this.meals.updateOne({ _id: meal }, {
  $set: { status: MealStatus.DELETED },
});

return {};
```

}

//
// QUERIES
//

/\*\*

* \_getMealById (meal: Meal): (meal: MealDocument)
*
* **requires** A meal with the given ID exists.
* **effects** Returns the full Meal document.
  \*/
  async \_getMealById(
  { meal }: { meal: Meal },
  ): Promise<{ meal: MealDocument }\[]> {
  const doc = await this.meals.findOne({ \_id: meal });
  return doc ? \[{ meal: doc }] : \[];
  }

/\*\*

* \_getMealsByOwner (owner: User, includeDeleted: optional Flag): (meal: MealDocument)
*
* **requires** true
* **effects** Returns all Meal documents owned by the specified user.
  \*/
  async \_getMealsByOwner(
  { owner, includeDeleted = false }: {
  owner: User;
  includeDeleted?: boolean;
  },
  ): Promise<{ meal: MealDocument }\[]> {
  const query: { owner: User; status?: MealStatus } = { owner };
  if (!includeDeleted) {
  query.status = MealStatus.ACTIVE;
  }
  const docs = await this.meals.find(query).toArray();
  return docs.map((doc) => ({ meal: doc }));
  }

/\*\*

* \_getMealOwner (meal: Meal): (owner: User)
*
* **requires** A meal with the given ID exists.
* **effects** Returns the owner of the specified meal. Useful for authorization syncs.
  \*/
  async \_getMealOwner({ meal }: { meal: Meal }): Promise<{ owner: User }\[]> {
  const doc = await this.meals.findOne({ \_id: meal }, {
  projection: { owner: 1 },
  });
  return doc ? \[{ owner: doc.owner }] : \[];
  }
  }
