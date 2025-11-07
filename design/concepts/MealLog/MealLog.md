[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-state](../../background/detailed/concept-state.md)

[@MealLogImplementation](MealLogImplementation.md)

[@sync-background](../../tools/sync-background.md)

# implement: The MealLog concept specification based on the implementation and concept specification overview.

# response:

# response:

# concept: MealLog

**concept** MealLog [User]

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