---
timestamp: 'Fri Nov 07 2025 01:26:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_012614.34b8893b.md]]'
content_id: 59fadfe049744504bf8c639cd81589edda7b73f84ac6b962846f672c7b477022
---

# API Specification: MealLog Concept

**Purpose:** To enable users to log the meals they eat, including individual food items and quantities.

***

## API Endpoints

### POST /api/MealLog/logMeal

**Description:** Creates a new meal log for a user, associating it with a list of food items.

**Requirements:**

* The specified `user` must exist.
* All `foodItem` IDs in the `items` array must correspond to existing food items.

**Effects:**

* A new MealLog entity is created for the user with the current timestamp and a meal type (e.g., "Breakfast").
* The specified food items and their quantities are associated with the new meal log.
* Returns the ID of the newly created meal log.

**Request Body:**

```json
{
  "user": "ID",
  "mealType": "string",
  "items": [
    { "foodItem": "ID", "quantity": "number" }
  ]
}
```

**Success Response Body (Action):**

```json
{
  "mealLog": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/\_getLogsForDate

**Description:** Retrieves all meal logs for a user on a specific date.

**Requirements:**

* The specified `user` must exist.

**Effects:**

* Returns a list of all MealLog entities created by the user on the given `date`.

**Request Body:**

```json
{
  "user": "ID",
  "date": "Date"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealLog": "ID",
    "mealType": "string",
    "timestamp": "Date",
    "items": [
      { "foodItem": "ID", "name": "string", "quantity": "number" }
    ]
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
