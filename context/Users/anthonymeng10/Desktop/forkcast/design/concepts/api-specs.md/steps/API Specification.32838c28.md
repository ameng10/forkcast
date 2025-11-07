---
timestamp: 'Fri Nov 07 2025 01:26:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_012614.34b8893b.md]]'
content_id: 32838c2874de0e95fc60b35f35ee9f1ca40bf482b9b2e6edd027d5a97fcf6e05
---

# API Specification: PersonalQA Concept

**Purpose:** To allow a user to store personal question-answer pairs for later retrieval and reflection.

***

## API Endpoints

### POST /api/PersonalQA/createQA

**Description:** Creates a new question and answer entry for a given user.

**Requirements:**

* The specified `user` must exist.
* The `question` field must not be empty.

**Effects:**

* A new QA entity is created and associated with the user, question, and answer.
* The ID of the newly created QA entity is returned.

**Request Body:**

```json
{
  "user": "ID",
  "question": "string",
  "answer": "string"
}
```

**Success Response Body (Action):**

```json
{
  "qa": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/deleteQA

**Description:** Deletes a specific question and answer entry.

**Requirements:**

* The QA entity specified by `qa` must exist.

**Effects:**

* The specified QA entity is permanently removed from the system.

**Request Body:**

```json
{
  "qa": "ID"
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

### POST /api/PersonalQA/\_getQAsForUser

**Description:** Retrieves all question and answer entries for a specific user.

**Requirements:**

* The specified `user` must exist.

**Effects:**

* Returns a list of all QA entities associated with the user, including their content.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "qa": "ID",
    "question": "string",
    "answer": "string",
    "createdAt": "Date"
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
