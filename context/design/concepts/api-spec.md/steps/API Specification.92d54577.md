---
timestamp: 'Tue Oct 21 2025 15:56:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155651.87aacf4b.md]]'
content_id: 92d5457792d231a206ddf7d66287db34722156860fcf43b5acb22e958da8458d
---

# API Specification: PersonalQA Concept

**Purpose:** To enable users to store personal facts, ask questions, and retrieve information based on those facts.

***

## API Endpoints

### POST /api/PersonalQA/ingestFact

**Description:** Stores a new fact, associating it with a specific user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "string",
  "factText": "string"
}
```

**Success Response Body (Action):**

```json
{
  "factId": "string"
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

**Description:** Removes a specific fact previously stored for a user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "string",
  "factId": "string"
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

**Description:** Submits a question from a user and receives an answer based on their stored facts.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "string",
  "questionText": "string"
}
```

**Success Response Body (Action):**

```json
{
  "answerText": "string"
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

**Description:** Retrieves a list of all facts currently stored for a given user.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "factId": "string",
    "factText": "string"
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

**Description:** Retrieves a historical list of questions asked by a user and their corresponding answers.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "userId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "qaId": "string",
    "questionText": "string",
    "answerText": "string"
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
