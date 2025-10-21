---
timestamp: 'Tue Oct 21 2025 15:52:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155220.f3ceaf8a.md]]'
content_id: ef6e93abdd88e55b2e25d70d0b97fa96bbca7c352b1155cfe1ad48ede196f817
---

# API Specification: MealLog Concept

**Purpose:** To allow users to log their meals, associate them with collections, and retrieve meal information.

***

## API Endpoints

### POST /api/MealLog/connect

**Description:** Establishes a connection between a meal log and an external entity or collection.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
  "externalEntityId": "ID",
  "connectionType": "String"
}
```

**Success Response Body (Action):**

```json
{
  "connectionId": "ID"
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

**Description:** Removes an existing connection for a meal log.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "connectionId": "ID"
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

**Description:** Retrieves a specific meal collection by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "collectionId": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "collectionDetails": "Object"
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

**Description:** Submits a new meal entry for an owner.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
  "mealDetails": "Object",
  "timestamp": "Number"
}
```

**Success Response Body (Action):**

```json
{
  "mealId": "ID"
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

**Description:** Edits an existing meal entry.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealId": "ID",
  "ownerId": "ID",
  "newMealDetails": "Object"
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

**Description:** Deletes a meal entry.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealId": "ID",
  "ownerId": "ID"
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

**Description:** Retrieves all meal entries for a specific owner.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
  "startDate": "Number",
  "endDate": "Number"
}
```

**Success Response Body (Action):**

```json
{
  "meals": "Array<Object>"
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

**Description:** Retrieves a specific meal entry by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealId": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "mealDetails": "Object"
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

**Description:** Retrieves a meal document (raw data) by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealDocumentId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealDocument": "Object"
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

**Description:** Retrieves a processed meal object by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "mealObjectId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "mealObject": "Object"
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
