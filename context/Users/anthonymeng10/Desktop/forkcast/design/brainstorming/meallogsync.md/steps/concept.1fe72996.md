---
timestamp: 'Fri Nov 07 2025 16:08:53 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_160853.e8729cb5.md]]'
content_id: 1fe72996f44e5e5c83ca659cd37711cdf5f609932811099a5165664d41cce9bc
---

# concept: MealLog

**concept** MealLog \[User]

**purpose** Enable users to track their food consumption by quickly logging meals.

**principle** A user records a meal with a time and a set of food items. They can later edit the meal's items or notes, or delete the meal entirely. Access to a meal log is restricted to its owner.

**state**

```
a set of Meals with
  an owner User
  an at Date
  an items set of FoodItem
  an optional notes String
  a status of ACTIVE or DELETED

a set of FoodItems with
  an id String
  a name String
```

*Note: `FoodItem` represents a value object passed into the concept's actions; it is not an entity managed by this concept.*

**actions**

`submit (owner: User, at: Date, items: set of FoodItem, notes: optional String): (meal: Meal) | (error: String)`
**requires** `items` is not an empty set.
**effects** Creates a new `Meal` `m`. Sets the owner of `m` to `owner`, `at` timestamp to `at`, `items` to `items`, and `notes` to `notes`. Sets the status of `m` to `ACTIVE`. Returns the new `Meal` `m` as `meal`. If the requires clause is not met, returns an error.

`edit (caller: User, meal: Meal, at: optional Date, items: optional set of FoodItem, notes: optional String): () | (error: String)`
**requires** A `Meal` with id `meal` exists. The `caller` is the owner of `meal`. The status of `meal` is `ACTIVE`. If `items` is provided, it is not an empty set.
**effects** Updates the `at`, `items`, and/or `notes` fields of `meal` with the provided values. If any requires clause is not met, returns an error.

`delete (caller: User, meal: Meal): () | (error: String)`
**requires** A `Meal` with id `meal` exists. The `caller` is the owner of `meal`. The status of `meal` is `ACTIVE`.
**effects** Sets the status of `meal` to `DELETED`. If any requires clause is not met, returns an error.

**queries**

`_getMealById (meal: Meal): (meal: Meal)`
**requires** A `Meal` with id `meal` exists.
**effects** Returns the `Meal` document corresponding to `meal`.

`_getMealsByOwner (owner: User, includeDeleted: optional Flag): (meal: Meal)`
**requires** true
**effects** Returns a set of all `Meal`s whose owner is `owner`. If `includeDeleted` is false or not provided, only returns `Meal`s with status `ACTIVE`.

`_getMealOwner (meal: Meal): (owner: User)`
**requires** A `Meal` with id `meal` exists.
**effects** Returns the `owner` of the `Meal` with id `meal`.

import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { Empty, ID } from "@utils/types.ts";

// Define generic types for the concept
type User = ID;
type Session = ID;

// Define the shape of the document in the 'sessions' collection
/\*\*

* a set of `Session`s with
* a `user` User
  \*/
  interface SessionDoc {
  \_id: Session;
  user: User;
  }

const PREFIX = "Sessioning" + ".";

/\*\*

* @concept Sessioning
* @purpose To maintain a user's logged-in state across multiple requests without re-sending credentials.
  \*/
  export default class SessioningConcept {
  public readonly sessions: Collection<SessionDoc>;

constructor(private readonly db: Db) {
this.sessions = this.db.collection<SessionDoc>(PREFIX + "sessions");
}

/\*\*

* create (user: User): (session: Session)
*
* **requires**: true.
*
* **effects**: creates a new Session `s`; associates it with the given `user`; returns `s` as `session`.
  \*/
  async create({ user }: { user: User }): Promise<{ session: Session }> {
  const newSessionId = freshID() as Session;
  const doc: SessionDoc = {
  \_id: newSessionId,
  user: user,
  };
  await this.sessions.insertOne(doc);
  return { session: newSessionId };
  }

/\*\*

* delete (session: Session): ()
*
* **requires**: the given `session` exists.
*
* **effects**: removes the session `s`.
  \*/
  async delete(
  { session }: { session: Session },
  ): Promise\<Empty | { error: string }> {
  const result = await this.sessions.deleteOne({ \_id: session });

```
if (result.deletedCount === 0) {
```

```
  return { error: `Session with id ${session} not found` };
}

return {};
```

}

/\*\*

* \_getUser (session: Session): (user: User)
*
* **requires**: the given `session` exists.
*
* **effects**: returns the user associated with the session.
  \*/
  async \_getUser(
  { session }: { session: Session },
  ): Promise\<Array<{ user: User }> | \[{ error: string }]> {
  const sessionDoc = await this.sessions.findOne({ \_id: session });

```
if (!sessionDoc) {
```

```
  return [{ error: `Session with id ${session} not found` }];
}

return [{ user: sessionDoc.user }];
```

}
}
