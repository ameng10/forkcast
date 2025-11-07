---
timestamp: 'Fri Nov 07 2025 01:53:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015314.8219baf1.md]]'
content_id: d3a8ed911ae632f7a12596c6afa5d15de441012defc113e3e115a347c4bbde0e
---

# API Specification: MealLog Concept

**Purpose:** To enable users to log their meals for tracking dietary habits, calories, or other nutritional information.

***

## API Endpoints

### POST /api/MealLog/logMeal

**Description:** Logs a single meal, including its name, type (e.g., breakfast, lunch), and a list of food items.

**Requirements:**

* `mealName` and `mealType` must not be empty.
* `items` array must not be empty.

**Effects:**

* A new meal record is created with a server-generated timestamp.
* Returns the unique ID of the new meal log.

**Request Body:**

```json
{
  "mealName": "string",
  "mealType": "string",
  "items": [
    {
      "name": "string",
      "calories": "number"
    }
  ]
}
```

**Success Response Body (Action):**

```json
{
  "mealId": "string"
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

**Description:** Deletes a previously logged meal record.

**Requirements:**

* A meal with the given `mealId` must exist.

**Effects:**

* The specified meal record is permanently removed from the database.
* Returns an empty object on success.

**Request Body:**

```json
{
  "mealId": "string"
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

**Description:** Retrieves all meals that were logged on a specific date.

**Requirements:**

* The `date` must be a string in a valid format (e.g., YYYY-MM-DD).

**Effects:**

* Fetches all meal records matching the specified date.
* Returns an array of meal objects.

**Request Body:**

```json
{
  "date": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealId": "string",
    "mealName": "string",
    "mealType": "string",
    "timestamp": "string",
    "items": [
      {
        "name": "string",
        "calories": "number"
      }
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
