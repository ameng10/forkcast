---
timestamp: 'Tue Oct 21 2025 13:33:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_133353.bae1eddb.md]]'
content_id: 2aaf25d8508866937f6bb893d1c4399772a49031c55273b231ee02fe308dde21
---

# API Specification: MealLog Concept

**Purpose:** allow users to record their daily food intake for tracking and analysis

***

## API Endpoints

### POST /api/MealLog/recordMeal

**Description:** Records a new meal for a user with its date, type, and associated food items.

**Requirements:**

* user exists

**Effects:**

* creates a new MealLog `ml`
* sets its properties to the input values
* adds `ml` to `user`'s `mealLogs`
* returns `ml` as `mealLog`

**Request Body:**

```json
{
  "user": "{ID}",
  "date": "string",
  "mealType": "string",
  "foodItems": [
    {
      "name": "string",
      "calories": "number",
      "macronutrients": {
        "carbs": "number",
        "protein": "number",
        "fat": "number"
      }
    }
  ]
}
```

**Success Response Body (Action):**

```json
{
  "mealLog": "{ID}"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/updateMeal

**Description:** Updates the details of an existing meal log.

**Requirements:**

* mealLog exists and belongs to a user

**Effects:**

* updates the properties of `mealLog` with the input values

**Request Body:**

```json
{
  "mealLog": "{ID}",
  "date": "string",
  "mealType": "string",
  "foodItems": [
    {
      "name": "string",
      "calories": "number",
      "macronutrients": {
        "carbs": "number",
        "protein": "number",
        "fat": "number"
      }
    }
  ]
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

### POST /api/MealLog/deleteMeal

**Description:** Deletes an existing meal log from the system and the user's record.

**Requirements:**

* mealLog exists

**Effects:**

* removes `mealLog` from the system and from the associated user's `mealLogs`

**Request Body:**

```json
{
  "mealLog": "{ID}"
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

### POST /api/MealLog/\_getMealLogsForUser

**Description:** Retrieves all meal logs for a specified user within a given date range.

**Requirements:**

* user exists

**Effects:**

* returns all meal logs for the given user within the specified date range, each with its date, meal type, and food items

**Request Body:**

```json
{
  "user": "{ID}",
  "startDate": "string",
  "endDate": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealLog": {
      "date": "string",
      "mealType": "string",
      "foodItems": [
        {
          "name": "string",
          "calories": "number",
          "macronutrients": {
            "carbs": "number",
            "protein": "number",
            "fat": "number"
          }
        }
      ]
    }
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
