---
timestamp: 'Fri Nov 07 2025 01:42:59 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014259.aca5f87a.md]]'
content_id: a6f4a6065b7f00ba8b006fd88786a88fd9883e9ecfc32debf0ccb360e0520075
---

# API Specification: MealLog Concept

**Purpose:** To allow users to log their meals for tracking diet and nutrition.

***

## API Endpoints

### POST /api/MealLog/logMeal

**Description:** Logs a new meal for a user, including a description and calorie count.

**Requirements:**

* The `logger` user must exist.
* `name` cannot be empty.
* `calories` must be a non-negative number.

**Effects:**

* A new `Meal` entity is created with the given details.
* The `Meal` is associated with the `logger` user and a timestamp.
* The ID of the new `Meal` is returned.

**Request Body:**

```json
{
  "logger": "User",
  "name": "string",
  "calories": "number",
  "notes": "string"
}
```

**Success Response Body (Action):**

```json
{
  "meal": "Meal"
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

* The `meal` entity must exist.

**Effects:**

* The specified `meal` entity is removed from the system.

**Request Body:**

```json
{
  "meal": "Meal"
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

### POST /api/MealLog/\_getMealsByUser

**Description:** Retrieves the meal history for a specific user.

**Requirements:**

* The `logger` user must exist.

**Effects:**

* Returns a list of all `Meal` entities logged by the specified user.

**Request Body:**

```json
{
  "logger": "User"
}
```

**Success Response Body (Query):**

```json
[
  {
    "meal": "Meal",
    "name": "string",
    "timestamp": "Date",
    "calories": "number",
    "notes": "string"
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
