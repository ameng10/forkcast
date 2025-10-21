---
timestamp: 'Tue Oct 21 2025 15:52:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155220.f3ceaf8a.md]]'
content_id: 4f1462866c6cfa90b07d3ac2b86241d332c12429de326f8ef3ce21f18ab808ba
---

# API Specification: PersonalQA Concept

**Purpose:** To enable users to store personal facts, ask questions, and retrieve information based on those facts.

***

## API Endpoints

### POST /api/PersonalQA/ingestFact

**Description:** Stores a new fact for a specific user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "ID",
  "factText": "String"
}
```

**Success Response Body (Action):**

```json
{
  "factId": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/forgetFact

**Description:** Removes a previously stored fact for a user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "ID",
  "factId": "ID"
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

### POST /api/PersonalQA/ask

**Description:** Queries the system with a question based on a user's facts.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "ID",
  "questionText": "String"
}
```

**Success Response Body (Action):**

```json
{
  "answerText": "String"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/\_getUserFacts

**Description:** Retrieves all facts stored for a given user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "factId": "ID",
    "factText": "String"
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

### POST /api/PersonalQA/\_getUserQAs

**Description:** Retrieves a history of questions asked and their answers for a given user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "qaId": "ID",
    "questionText": "String",
    "answerText": "String"
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
