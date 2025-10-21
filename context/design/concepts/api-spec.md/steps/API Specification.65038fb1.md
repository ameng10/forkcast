---
timestamp: 'Tue Oct 21 2025 15:26:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152619.1e08653e.md]]'
content_id: 65038fb1bdbf81f5d5fbc273980b04fb2e280e64b25e89e98d7026a58b530013
---

# API Specification: PersonalQA Concept

**Purpose:** allow users to store and retrieve personal questions and answers for self-reflection or knowledge retention

***

## API Endpoints

### POST /api/PersonalQA/addQAEntry

**Description:** Creates a new question and answer entry for a user with associated tags.

**Requirements:**

* user exists; question and answer are not empty

**Effects:**

* creates a new QAEntry for the user with the given details; returns the new entry's ID

**Request Body:**

```json
{
  "user": "string",
  "question": "string",
  "answer": "string",
  "tags": [
    "string"
  ]
}
```

**Success Response Body (Action):**

```json
{
  "entry": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/updateQAEntry

**Description:** Updates the question, answer, and tags of a specified QA entry.

**Requirements:**

* entry exists and belongs to the user

**Effects:**

* updates the question, answer, and tags of the specified entry

**Request Body:**

```json
{
  "entry": "string",
  "question": "string",
  "answer": "string",
  "tags": [
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

### POST /api/PersonalQA/deleteQAEntry

**Description:** Removes a specified QA entry for a user.

**Requirements:**

* entry exists and belongs to the user

**Effects:**

* removes the specified QAEntry

**Request Body:**

```json
{
  "entry": "string"
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

### POST /api/PersonalQA/\_getQAEntriesByTag

**Description:** Retrieves all QA entries for a user that have a specific tag.

**Requirements:**

* user exists; tag is not empty

**Effects:**

* returns all QA entries for the user that have the specified tag

**Request Body:**

```json
{
  "user": "string",
  "tag": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "question": "string",
    "answer": "string",
    "tags": [
      "string"
    ],
    "createdAt": "number"
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

### POST /api/PersonalQA/\_searchQAEntries

**Description:** Searches and returns all QA entries for a user where question or answer contains a specified keyword.

**Requirements:**

* user exists; keyword is not empty

**Effects:**

* returns all QA entries for the user where question or answer contains the keyword

**Request Body:**

```json
{
  "user": "string",
  "keyword": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "question": "string",
    "answer": "string",
    "tags": [
      "string"
    ],
    "createdAt": "number"
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
