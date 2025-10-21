---
timestamp: 'Tue Oct 21 2025 13:33:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_133353.bae1eddb.md]]'
content_id: 6667dbc1ad2284d453c6f4a75d97b85a667fdbfc3aeb1c7e6948ca6a44f1501f
---

# API Specification: PersonalQA Concept

**Purpose:** allow users to ask and answer personal questions about their health, habits, and progress, fostering self-reflection

***

## API Endpoints

### POST /api/PersonalQA/askQuestion

**Description:** Allows a user to ask a new personal question.

**Requirements:**

* user exists

**Effects:**

* creates a new Question `q`
* sets `q`'s `user` to `user`, `text` to `text`, and `timestamp` to current time
* adds `q` to `user`'s `questions`
* returns `q` as `question`

**Request Body:**

```json
{
  "user": "{ID}",
  "text": "string"
}
```

**Success Response Body (Action):**

```json
{
  "question": "{ID}"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/answerQuestion

**Description:** Provides an answer to an existing personal question.

**Requirements:**

* question exists and has no answer yet

**Effects:**

* sets `question`'s `answer` to `answer` and `answerTimestamp` to current time

**Request Body:**

```json
{
  "question": "{ID}",
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

### POST /api/PersonalQA/\_getQuestionsForUser

**Description:** Retrieves all personal questions asked by a user, along with their answers and timestamps if available.

**Requirements:**

* user exists

**Effects:**

* returns all questions asked by the `user`, each with its text, timestamps, and answer if available

**Request Body:**

```json
{
  "user": "{ID}"
}
```

**Success Response Body (Query):**

```json
[
  {
    "question": {
      "text": "string",
      "timestamp": "string",
      "answer": "string | null",
      "answerTimestamp": "string | null"
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
