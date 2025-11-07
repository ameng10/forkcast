---
timestamp: 'Fri Nov 07 2025 01:54:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015440.a61afa39.md]]'
content_id: 0c969dc96df5920489fad4ccc891828b48effb3d1d5eda5da09c707060f95b41
---

# API Specification: PersonalQA Concept

**Purpose:** To allow users to ask personal questions and receive AI-generated answers, creating a repository of personal knowledge.

***

## API Endpoints

### POST /api/PersonalQA/askQuestion

**Description:** Submits a new personal question for a user, generates an AI answer, and stores it.

**Requirements:**

* The `user` must exist.
* The `questionText` must not be empty.

**Effects:**

* Creates a new `Question` associated with the `user`.
* Generates an `Answer` for the question using an AI service.
* Returns the ID of the newly created `Question`.

**Request Body:**

```json
{
  "user": "string (UserID)",
  "questionText": "string"
}
```

**Success Response Body (Action):**

```json
{
  "question": "string (QuestionID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/\_getQuestions

**Description:** Retrieves all questions and their corresponding answers for a specific user.

**Requirements:**

* The `user` must exist.

**Effects:**

* Returns a list of all questions associated with the user, including the question text and the answer text.

**Request Body:**

```json
{
  "user": "string (UserID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (QuestionID)",
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
