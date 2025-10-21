---
timestamp: 'Tue Oct 21 2025 15:26:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152619.1e08653e.md]]'
content_id: 682717d845c6f2a97a835959b5c3e2341f1b02eba6ccde8bb20fbec07142a6eb
---

# API Specification: MealLog Concept

**Purpose:** track user meal consumption and nutritional intake

***

## API Endpoints

### POST /api/MealLog/addFoodItem

**Description:** Creates a new food item with specified nutritional details.

**Requirements:**

* name is not empty

**Effects:**

* creates a new FoodItem with the given details and returns its ID

**Request Body:**

```json
{
  "name": "string",
  "calories": "number",
  "protein": "number",
  "carbs": "number",
  "fat": "number"
}
```

**Success Response Body (Action):**

```json
{
  "food": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/logMeal

**Description:** Creates a new meal entry for a user, associating it with food items and calculating total calories.

**Requirements:**

* user exists; all food items exist

**Effects:**

* creates a new MealEntry for the user at the given timestamp with the specified foods; calculates total calories; returns the new meal's ID

**Request Body:**

```json
{
  "user": "string",
  "timestamp": "number",
  "foods": [
    "string"
  ]
}
```

**Success Response Body (Action):**

```json
{
  "meal": "string"
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

**Description:** Updates the food items and recalculates total calories for an existing meal entry.

**Requirements:**

* meal exists and belongs to the user; all food items exist

**Effects:**

* updates the foods in the meal entry; recalculates total calories

**Request Body:**

```json
{
  "meal": "string",
  "foods": [
    "string"
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

**Description:** Removes a specified meal entry.

**Requirements:**

* meal exists

**Effects:**

* removes the meal entry

**Request Body:**

```json
{
  "meal": "string"
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

**Description:** Retrieves all meal entries for a specific user on a given day.

**Requirements:**

* user exists; day is in YYYY-MM-DD format

**Effects:**

* returns all meal entries for the user on the specified day, with full details

**Request Body:**

```json
{
  "user": "string",
  "day": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "timestamp": "number",
    "foods": [
      "string"
    ],
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

### POST /api/MealLog/\_getNutritionalSummary

**Description:** Returns aggregated nutritional data for a user within a specified date range.

**Requirements:**

* user exists; startDate is before or equal to endDate

**Effects:**

* returns aggregated nutritional data for the user within the date range

**Request Body:**

```json
{
  "user": "string",
  "startDate": "number",
  "endDate": "number"
}
```

**Success Response Body (Query):**

```json
[
  {
    "totalCalories": "number",
    "totalProtein": "number",
    "totalCarbs": "number",
    "totalFat": "number"
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
