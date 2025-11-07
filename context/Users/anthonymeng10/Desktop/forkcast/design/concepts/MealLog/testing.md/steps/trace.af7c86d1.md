---
timestamp: 'Fri Nov 07 2025 00:51:23 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_005123.e5378f63.md]]'
content_id: af7c86d144a721c2334a595bf08d0c4e48855afe5afd246baef9ff82da18518f
---

# trace:

The following trace demonstrates how the **principle** of the `MealLog` concept is fulfilled by a sequence of actions.

1. **Given**: A user `userAlice`.
2. **Action**: Alice records a meal she just ate.
   ```
   MealLog.submit({ owner: "userAlice", at: "2023-10-27T10:00:00Z", items: [{id: "food:apple", name: "Apple"}], notes: "Quick snack" })
   ```
3. **Result**: A new meal is created, and its ID is returned.
   ```
   { meal: "meal123" }
   ```
4. **Action**: Alice later realizes she forgot an item and wants to edit the meal.
   ```
   MealLog.edit({ caller: "userAlice", meal: "meal123", items: [{id: "food:apple", name: "Apple"}, {id: "food:banana", name: "Banana"}], notes: "Healthy snack" })
   ```
5. **Result**: The meal is successfully updated.
   ```
   {}
   ```
6. **Action**: Alice queries her meal log to see her entries for the day.
   ```
   MealLog._getMealsByOwner({ owner: "userAlice" })
   ```
7. **Result**: The state reflects her updated meal.
   ```
   [
     {
       meal: {
         _id: "meal123",
         owner: "userAlice",
         at: "2023-10-27T10:00:00Z",
         items: [
           {id: "food:apple", name: "Apple"},
           {id: "food:banana", name: "Banana"}
         ],
         notes: "Healthy snack",
         status: "ACTIVE"
       }
     }
   ]
   ```
8. **Action**: Alice decides to delete the entry entirely.
   ```
   MealLog.delete({ caller: "userAlice", meal: "meal123" })
   ```
9. **Result**: The meal is marked as deleted.
   ```
   {}
   ```
10. **Action**: Alice queries her active meals again.
    ```
    MealLog._getMealsByOwner({ owner: "userAlice" })
    ```
11. **Result**: The query for active meals returns an empty list, fulfilling the concept's principle of allowing users to manage their meal logs.
    ```
    []
    ```
