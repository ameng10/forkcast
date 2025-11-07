---
timestamp: 'Fri Nov 07 2025 00:43:35 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_004335.2603216d.md]]'
content_id: 931c3461046a74693ec1172bfed78de6d99aa1aaedf06ed9628d63674a9bd2fe
---

# concept: MealLog

```
concept MealLog [User]

purpose Capture meals quickly with minimal friction.

principle A user records a meal with a time and a set of food items. They can later edit the meal's items or notes, or delete the meal entirely. Access to a meal log is restricted to its owner.

state
  a set of Meals with
    an owner User
    an at Date
    an items set of FoodItem
    an optional notes String
    a status of ACTIVE or DELETED

actions
  submit (owner: User, at: Date, items: set of FoodItem, notes: optional String): (meal: Meal)
  edit (caller: User, meal: Meal, at: optional Date, items: optional set of FoodItem, notes: optional String): ()
  edit (caller: User, meal: Meal, at: optional Date, items: optional set of FoodItem, notes: optional String): (error: String)
  delete (caller: User, meal: Meal): ()
  delete (caller: User, meal: Meal): (error: String)

queries
  _getMealById (meal: Meal): (meal: Meal)
  _getMealsByOwner (owner: User, includeDeleted: optional Flag): (meal: Meal)
  _getMealOwner (meal: Meal): (owner: User)
```
