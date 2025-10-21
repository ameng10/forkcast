---
timestamp: 'Tue Oct 21 2025 13:33:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_133353.bae1eddb.md]]'
content_id: ee996790bcfdeaa69260d4a61d13b6024cb82f7518dc8b6199fad99b574d6bda
---

# API Specification: SwapSuggestions Concept

**Purpose:** suggest healthier or more suitable food swaps for individual meal items, considering dietary preferences and goals

***

## API Endpoints

### POST /api/SwapSuggestions/addFoodToSystem

**Description:** Adds a new food item with its nutritional information, health score, and compatible swaps to the system.

**Requirements:**

* no Food with the given `name` already exists

**Effects:**

* creates a new Food `f`
* sets its properties to the input values
* returns `f` as `food`

**Request Body:**

```json
{
  "name": "string",
  "calories": "number",
  "macronutrients": {
    "carbs": "number",
    "protein": "number",
    "fat": "number"
  },
  "healthScore": "number",
  "compatibleSwaps": ["{ID}"]
}
```

**Success Response Body (Action):**

```json
{
  "food": "{ID}"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/updateFoodInSystem

**Description:** Updates the properties of an existing food item in the system.

**Requirements:**

* food exists

**Effects:**

* updates the properties of `food` with the input values

**Request Body:**

```json
{
  "food": "{ID}",
  "name": "string",
  "calories": "number",
  "macronutrients": {
    "carbs": "number",
    "protein": "number",
    "fat": "number"
  },
  "healthScore": "number",
  "compatibleSwaps": ["{ID}"]
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

### POST /api/SwapSuggestions/\_getSuggestedSwaps

**Description:** Retrieves a list of suggested food swaps for a given meal item, based on the user's preferences and dietary goals.

**Requirements:**

* mealItem's food exists and user exists

**Effects:**

* returns a set of `Food` items that are suitable swaps for the `mealItem`'s `food`, considering `user`'s preferences and `dietaryGoals`

**Request Body:**

```json
{
  "user": "{ID}",
  "mealItem": "{ID}"
}
```

**Success Response Body (Query):**

```json
[
  {
    "swap": "{ID}"
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
