---
timestamp: 'Tue Oct 21 2025 16:02:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_160246.00795e07.md]]'
content_id: b7381b49419b5bd93559d0a9742cee82365b11806f2d882104ef3598d7843bac
---

# API Specification: MealLog Concept

**Purpose:** Support the submission, editing, deletion, and retrieval of user-logged meal information, allowing for collection-based organization.

***

## API Endpoints

### POST /api/MealLog/connect

**Description:** Connects a meal to a specific collection.

**Requirements:**

* `mealId` must correspond to an existing meal.
* `collectionId` must correspond to an existing collection.
* The meal must not already be part of the collection.

**Effects:**

* The meal identified by `mealId` is associated with the collection identified by `collectionId`.

**Request Body:**

```json
{
  "mealId": "ID",
  "collectionId": "ID"
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

### POST /api/MealLog/disconnect

**Description:** Disconnects a meal from a specific collection.

**Requirements:**

* `mealId` must correspond to an existing meal.
* `collectionId` must correspond to an existing collection.
* The meal must currently be part of the collection.

**Effects:**

* The meal identified by `mealId` is dissociated from the collection identified by `collectionId`.

**Request Body:**

```json
{
  "mealId": "ID",
  "collectionId": "ID"
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

**Description:** Retrieves a collection of meal documents. (Note: This action name suggests a query, but it's listed as an action. Assuming it creates/retrieves with side-effects or returns a transient collection object).

**Requirements:**

* `collectionId` must correspond to an existing collection.

**Effects:**

* Returns the details of the collection identified by `collectionId`, including its name and the list of associated meal IDs.

**Request Body:**

```json
{
  "collectionId": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "name": "String",
  "mealIds": ["ID"]
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

**Description:** Retrieves a raw meal document by its unique identifier.

**Requirements:**

* `mealDocumentId` must correspond to an existing meal document.

**Effects:**

* Returns the complete meal document associated with `mealDocumentId`. (Assuming a JSON object structure for the document).

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
    "document": {
      "anyKey": "anyValue"
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

### POST /api/MealLog/\_getMealObjectById

**Description:** Retrieves a structured meal object by its unique identifier.

**Requirements:**

* `mealObjectId` must correspond to an existing meal object.

**Effects:**

* Returns the structured meal object associated with `mealObjectId`. (Assuming a specific structured format like {owner, date, items, totalCalories}).

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
    "owner": "ID",
    "date": "Number",
    "items": ["String"],
    "totalCalories": "Number"
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

### POST /api/MealLog/submit

**Description:** Submits a new meal log entry, creating a meal document and object.

**Requirements:**

* `owner` must correspond to an existing user.
* `mealData` (a document object) must be provided.

**Effects:**

* A new meal document is stored.
* A new structured meal object is created and associated with the `owner` and the document.
* Returns the unique identifier (`mealId`) of the new meal.

**Request Body:**

```json
{
  "owner": "ID",
  "mealData": {
    "anyKey": "anyValue"
  }
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

**Description:** Edits an existing meal log entry's details.

**Requirements:**

* `mealId` must correspond to an existing meal owned by `owner`.
* `newMealData` (a document object) must be provided.

**Effects:**

* The meal document associated with `mealId` is updated with `newMealData`.
* The structured meal object associated with `mealId` is updated based on `newMealData`.

**Request Body:**

```json
{
  "owner": "ID",
  "mealId": "ID",
  "newMealData": {
    "anyKey": "anyValue"
  }
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

**Description:** Deletes a meal log entry and its associated document and object.

**Requirements:**

* `mealId` must correspond to an existing meal owned by `owner`.

**Effects:**

* The meal document and structured meal object identified by `mealId` are permanently removed.
* Any connections to collections are also removed.

**Request Body:**

```json
{
  "owner": "ID",
  "mealId": "ID"
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

**Description:** Retrieves all meal IDs for a specific owner within an optional date range.

**Requirements:**

* `owner` must correspond to an existing user.
* `startDate` and `endDate` are optional valid timestamps if provided.

**Effects:**

* Returns a list of unique identifiers (`mealIds`) for all meals logged by the `owner`, optionally filtered by date.

**Request Body:**

```json
{
  "owner": "ID",
  "startDate": "Number",
  "endDate": "Number"
}
```

**Success Response Body (Action):**

```json
{
  "mealIds": ["ID"]
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

**Description:** Retrieves a structured meal object by its unique identifier. (This is a duplicate of `_getMealObjectById` but without the underscore, indicating it might be an action that could have side-effects or be used differently).

**Requirements:**

* `mealId` must correspond to an existing meal object.

**Effects:**

* Returns the structured meal object associated with `mealId`. (Assuming a specific structured format like {owner, date, items, totalCalories}).

**Request Body:**

```json
{
  "mealId": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "owner": "ID",
  "date": "Number",
  "items": ["String"],
  "totalCalories": "Number"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***
