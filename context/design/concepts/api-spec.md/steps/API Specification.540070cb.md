---
timestamp: 'Tue Oct 21 2025 15:29:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152929.4780128b.md]]'
content_id: 540070cbb65e6c26cfeb19313c32ccac65f6308eab6786c6c149830550a14779
---

# API Specification: MealLog Concept

**Purpose:** enable users to log their meals and track nutritional intake.

***

## API Endpoints

### POST /api/MealLog/logMeal

**Description:** Logs a new meal entry for a user with details including ingredients and calories.

**Requirements:**

* `userId` exists, `mealName` is not empty, `calories` is non-negative

**Effects:**

* creates a new `MealEntry` for `userId` with the provided details, returns its `entryId`

**Request Body:**

```json
{
  "userId": "string",
  "mealName": "string",
  "ingredients": [
    "string"
  ],
  "calories": "number"
}
```

**Success Response Body (Action):**

```json
{
  "entryId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/editMealEntry

**Description:** Updates the name and/or calorie count of an existing meal entry.

**Requirements:**

* `entryId` exists and belongs to `userId`, `newMealName` is not empty, `newCalories` is non-negative

**Effects:**

* updates the `mealName` and `calories` of the specified `MealEntry`

**Request Body:**

```json
{
  "userId": "string",
  "entryId": "string",
  "newMealName": "string",
  "newCalories": "number"
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

### POST /api/MealLog/deleteMealEntry

**Description:** Deletes a specific meal entry for a user.

**Requirements:**

* `entryId` exists and belongs to `userId`

**Effects:**

* deletes the specified `MealEntry`

**Request Body:**

```json
{
  "userId": "string",
  "entryId": "string"
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

### POST /api/MealLog/\_getMealLog

**Description:** Retrieves all meal entries for a specific user on a given date.

**Requirements:**

* `userId` exists, `date` is a valid date string (e.g., "YYYY-MM-DD")

**Effects:**

* returns all `MealEntry` records for `userId` on the given `date`

**Request Body:**

```json
{
  "userId": "string",
  "date": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "mealName": "string",
    "ingredients": [
      "string"
    ],
    "calories": "number",
    "timestamp": "number"
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

### POST /api/MealLog/\_getDailyTotalCalories

**Description:** Calculates and returns the total calories consumed by a user on a specific date.

**Requirements:**

* `userId` exists, `date` is a valid date string

**Effects:**

* returns the sum of `calories` from all `MealEntry` records for `userId` on the given `date`

**Request Body:**

```json
{
  "userId": "string",
  "date": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "totalCalories": "number"
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
