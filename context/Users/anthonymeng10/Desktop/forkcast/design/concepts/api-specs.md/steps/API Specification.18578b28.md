---
timestamp: 'Fri Nov 07 2025 01:54:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015440.a61afa39.md]]'
content_id: 18578b28174b0484fd331118b97698c60040cde876fe9436667c496ba7b31d91
---

# API Specification: MealLog Concept

**Purpose:** To allow users to log meals they've eaten, including a description and ingredients.

***

## API Endpoints

### POST /api/MealLog/logMeal

**Description:** Logs a meal with its description and a list of ingredients for a user.

**Requirements:**

* The `user` must exist.
* The `description` must not be empty.

**Effects:**

* Creates a new `Meal` record associated with the user, storing the description, ingredients, and the current timestamp.
* Returns the new meal's ID.

**Request Body:**

```json
{
  "user": "string (UserID)",
  "description": "string",
  "ingredients": ["string"]
}
```

**Success Response Body (Action):**

```json
{
  "meal": "string (MealID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/\_getMealsForUser

**Description:** Retrieves all meals logged by a specific user.

**Requirements:**

* The `user` must exist.

**Effects:**

* Returns a list of all `Meal` documents for the given `user`.

**Request Body:**

```json
{
  "user": "string (UserID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (MealID)",
    "description": "string",
    "ingredients": ["string"],
    "timestamp": "string (ISO Date)"
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

### POST /api/MealLog/\_getMealById

**Description:** Retrieves the details of a single meal by its ID.

**Requirements:**

* A `Meal` with the given ID `meal` must exist.

**Effects:**

* Returns the full `Meal` document corresponding to the given ID.

**Request Body:**

```json
{
  "meal": "string (MealID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (MealID)",
    "user": "string (UserID)",
    "description": "string",
    "ingredients": ["string"],
    "timestamp": "string (ISO Date)"
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
