---
timestamp: 'Fri Nov 07 2025 01:42:59 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014259.aca5f87a.md]]'
content_id: e4844efc82beae3280b7110b066fb95ed6820f4fb600fbee751c6c76b675b582
---

# API Specification: PersonalQA Concept

**Purpose:** To allow a user to build a personal knowledge base of questions and answers.

***

## API Endpoints

### POST /api/PersonalQA/addQA

**Description:** Adds a new question and answer pair for a user.

**Requirements:**

* The `owner` user must exist.
* The `question` string must not be empty.

**Effects:**

* A new `QA` entity is created.
* The new `QA` is associated with the `owner`.
* The `question` and `answer` properties are set.
* The ID of the new `QA` entity is returned.

**Request Body:**

```json
{
  "owner": "User",
  "question": "string",
  "answer": "string"
}
```

**Success Response Body (Action):**

```json
{
  "qa": "QA"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/updateQA

**Description:** Updates the text of an existing question or answer.

**Requirements:**

* The `qa` entity must exist.

**Effects:**

* The `question` and/or `answer` properties of the specified `qa` entity are updated.

**Request Body:**

```json
{
  "qa": "QA",
  "question": "string",
  "answer": "string"
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

### POST /api/PersonalQA/deleteQA

**Description:** Deletes a question and answer pair.

**Requirements:**

* The `qa` entity must exist.

**Effects:**

* The specified `qa` entity is removed from the system.

**Request Body:**

```json
{
  "qa": "QA"
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

### POST /api/PersonalQA/\_getQAs

**Description:** Retrieves all question and answer pairs for a specific user.

**Requirements:**

* The `owner` user must exist.

**Effects:**

* Returns a list of all `QA` entities associated with the given `owner`.

**Request Body:**

```json
{
  "owner": "User"
}
```

**Success Response Body (Query):**

```json
[
  {
    "qa": "QA",
    "question": "string",
    "answer": "string"
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
