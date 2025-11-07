---
timestamp: 'Fri Nov 07 2025 01:46:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014649.24e98b00.md]]'
content_id: f3de2ec0055eb25b82e51562ddc5c685a933e95cc699f0e656d00692ba8e9bd2
---

# API Specification: PersonalQA Concept

**Purpose:** To allow a user to ask questions and record personal answers for later reflection.

***

## API Endpoints

### POST /api/PersonalQA/addQuestion

**Description:** Creates a new personal question for a user.

**Requirements:**

* The `user` must exist.
* `questionText` must not be empty.

**Effects:**

* A new `Question` object is created and associated with the user.
* The ID of the new question is returned.

**Request Body:**

```json
{
  "user": "ID",
  "questionText": "string"
}
```

**Success Response Body (Action):**

```json
{
  "question": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/addAnswer

**Description:** Records an answer for a specific question.

**Requirements:**

* The `question` must exist.
* The question must not already have an answer.
* `answerText` must not be empty.

**Effects:**

* A new `Answer` object is created and linked to the specified `question`.

**Request Body:**

```json
{
  "question": "ID",
  "answerText": "string"
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

### POST /api/PersonalQA/deleteQuestion

**Description:** Deletes a question and its associated answer.

**Requirements:**

* The `question` must exist.

**Effects:**

* The specified `question` and its answer are removed from the system.

**Request Body:**

```json
{
  "question": "ID"
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

### POST /api/PersonalQA/\_getQuestions

**Description:** Retrieves all questions and their answers for a given user.

**Requirements:**

* The `user` must exist.

**Effects:**

* Returns a list of all questions associated with the user, including their text and corresponding answer text.

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
    "questionId": "ID",
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
