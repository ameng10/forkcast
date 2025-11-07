---
timestamp: 'Fri Nov 07 2025 02:01:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_020152.944dd54f.md]]'
content_id: 7e31834f1416ef8782f3c3e702f2c6e309169f9267b07ae7a54f14a5d2d22c35
---

# API Specification: MealLog Concept

**Purpose:** To enable users to log and manage their meals.

***

## API Endpoints

### POST /api/MealLog/submit

**Description:** Submits a new meal entry for a user.

**Requirements:**

* The `owner` ID must be a valid and existing user.

**Effects:**

* Creates a new meal log record.
* Returns the ID of the new meal.

**Request Body:**

```json
{
  "owner": "UserID",
  "description": "string",
  "calories": "number"
}
```

**Success Response Body (Action):**

```json
{
  "meal": "MealID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/edit

**Description:** Edits the details of an existing meal log.

**Requirements:**

* The `meal` ID must be a valid and existing meal.

**Effects:**

* Updates the specified meal record with the new description and calories.

**Request Body:**

```json
{
  "meal": "MealID",
  "description": "string",
  "calories": "number"
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

### POST /api/MealLog/delete

**Description:** Deletes a meal log entry.

**Requirements:**

* The `meal` ID must be a valid and existing meal.

**Effects:**

* Removes the specified meal record.

**Request Body:**

```json
{
  "meal": "MealID"
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

### POST /api/MealLog/\_getMealById

**Description:** Retrieves a single meal log by its ID.

**Requirements:**

* The `meal` ID must be a valid and existing meal.

**Effects:**

* Returns the specified meal record.

**Request Body:**

```json
{
  "meal": "MealID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "MealID",
    "description": "string",
    "calories": "number",
    "owner": "UserID",
    "timestamp": "date"
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

### POST /api/MealLog/\_getMealsByOwner

**Description:** Retrieves all meal logs for a specific user.

**Requirements:**

* The `owner` ID must be a valid and existing user.

**Effects:**

* Returns a list of all meal records for the user.

**Request Body:**

```json
{
  "owner": "UserID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "MealID",
    "description": "string",
    "calories": "number",
    "owner": "UserID",
    "timestamp": "date"
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

### POST /api/MealLog/\_getMealOwner

**Description:** Retrieves the owner of a specific meal log.

**Requirements:**

* The `meal` ID must be a valid and existing meal.

**Effects:**

* Returns the user ID of the meal's owner.

**Request Body:**

```json
{
  "meal": "MealID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "owner": "UserID"
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
