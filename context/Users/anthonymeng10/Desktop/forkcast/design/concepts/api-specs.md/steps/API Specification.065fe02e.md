---
timestamp: 'Fri Nov 07 2025 01:46:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014649.24e98b00.md]]'
content_id: 065fe02ed223bc81aab29f79da056c2ed632f708b55f315d9ae1a57005102646
---

# API Specification: MealLog Concept

**Purpose:** To allow users to log the meals they eat for tracking calories, macros, or other nutritional information.

***

## API Endpoints

### POST /api/MealLog/logMeal

**Description:** Logs a new meal with its constituent items for a user.

**Requirements:**

* The `user` must exist.
* `mealName` must not be empty.
* `items` must be an array of objects, each with a `name` and `calories`.

**Effects:**

* A new `Meal` record is created and associated with the user.
* The ID of the new meal log is returned.

**Request Body:**

```json
{
  "user": "ID",
  "mealName": "string",
  "timestamp": "Date",
  "items": [
    { "name": "string", "calories": "number" }
  ]
}
```

**Success Response Body (Action):**

```json
{
  "meal": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/deleteMeal

**Description:** Deletes a previously logged meal.

**Requirements:**

* The `meal` ID must correspond to an existing meal log.

**Effects:**

* The specified `Meal` record is removed from the system.

**Request Body:**

```json
{
  "meal": "ID"
}
```

**Success Response Body (Action):**

```json
{}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/\_getMealsForDay

**Description:** Retrieves all meals logged by a user for a specific date.

**Requirements:**

* The `user` must exist.
* `date` must be a valid date string.

**Effects:**

* Returns a list of meal objects that were logged on the specified day.

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
    "_id": "ID",
    "mealName": "string",
    "timestamp": "Date",
    "totalCalories": "number",
    "items": [
      { "name": "string", "calories": "number" }
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
