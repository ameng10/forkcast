---
timestamp: 'Thu Oct 16 2025 18:19:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_181922.6abc8d75.md]]'
content_id: d236483d4bbec58f7a23b10ac4c6d191fc0573ea4dc3b21ab5bd37cf271108c0
---

# implement: MealLog using the following framework. Fix any formatting and modularity issues and make sure the specification matches code made. Write the code in typescript

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
