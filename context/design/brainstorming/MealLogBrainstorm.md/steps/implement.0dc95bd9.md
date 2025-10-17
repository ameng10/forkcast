---
timestamp: 'Thu Oct 16 2025 17:57:55 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_175755.88d27707.md]]'
content_id: 0dc95bd97155aabd2e348e5a319926ca298bcb0aa4b92061c1ed6101506e74db
---

# implement: MealLog using the following framework. Fix any formatting and modularity issues and make sure the specification matches code made.

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
