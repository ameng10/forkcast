---
timestamp: 'Tue Oct 21 2025 15:56:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155651.87aacf4b.md]]'
content_id: ddfe5f72eb93e8ab9f964ae8679a50659ed3929e509fdc54e3644f89bad53c8d
---

# API Specification: MealLog Concept

**Purpose:** To allow users to log their meals, associate them with collections, and retrieve meal information.

***

## API Endpoints

### POST /api/MealLog/connect

**Description:** Establishes a connection between a meal log entity and an external artifact or collection.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "externalEntityId": "string",
  "connectionType": "string"
}
```

**Success Response Body (Action):**

```json
{
  "connectionId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/disconnect

**Description:** Removes an existing connection identified by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "connectionId": "string"
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

### POST /api/MealLog/getCollection

**Description:** Retrieves details for a specific meal collection by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "collectionId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "collectionDetails": "object"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/submit

**Description:** Submits a new meal entry for a specific owner with its details and timestamp.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "mealDetails": "object",
  "timestamp": "number"
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

### POST /api/MealLog/edit

**Description:** Modifies the details of an existing meal entry identified by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealId": "string",
  "ownerId": "string",
  "newMealDetails": "object"
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

**Description:** Deletes a specific meal entry by its ID for a given owner.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealId": "string",
  "ownerId": "string"
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

### POST /api/MealLog/getMealsForOwner

**Description:** Retrieves a list of meal entries for a specific owner, optionally filtered by a date range.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "startDate": "number",
  "endDate": "number"
}
```

**Success Response Body (Action):**

```json
{
  "meals": "Array<object>"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/getMealById

**Description:** Retrieves the detailed information for a specific meal entry by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "mealDetails": "object"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/MealLog/\_getMealDocumentById

**Description:** Retrieves the raw document representation of a meal by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealDocumentId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealDocument": "object"
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

### POST /api/MealLog/\_getMealObjectById

**Description:** Retrieves the processed object representation of a meal by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealObjectId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealObject": "object"
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
