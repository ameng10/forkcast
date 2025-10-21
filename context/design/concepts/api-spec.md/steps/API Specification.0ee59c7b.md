---
timestamp: 'Tue Oct 21 2025 15:29:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152929.4780128b.md]]'
content_id: 0ee59c7bda6d2d76feab94b9dd697f409c174a37e02629ff7cc55c95b1d1e93c
---

# API Specification: PersonalQA Concept

**Purpose:** allow users to record and answer personal questions for self-reflection and progress tracking.

***

## API Endpoints

### POST /api/PersonalQA/createQuestion

**Description:** Creates a new personal question for a user.

**Requirements:**

* `userId` exists, `questionText` is not empty

**Effects:**

* creates a new `Question` for `userId`, returns its `questionId`

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
  "questionId": "string"
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

**Description:** Records an answer to a specific personal question by the user.

**Requirements:**

* `userId` exists, `questionId` exists and belongs to `userId`, `answerText` is not empty

**Effects:**

* creates a new `Answer` for the specified `questionId` by `userId`, returns its `answerId`

**Request Body:**

```json
{
  "userId": "string",
  "questionId": "string",
  "answerText": "string"
}
```

**Success Response Body (Action):**

```json
{
  "answerId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/editAnswer

**Description:** Updates the text of an existing answer.

**Requirements:**

* `userId` exists, `answerId` exists and belongs to `userId`, `newAnswerText` is not empty

**Effects:**

* updates the `answerText` of the specified `Answer`

**Request Body:**

```json
{
  "userId": "string",
  "answerId": "string",
  "newAnswerText": "string"
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

**Description:** Retrieves all personal questions created by a specific user.

**Requirements:**

* `userId` exists

**Effects:**

* returns all `Question` records created by `userId`

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
    "id": "string",
    "text": "string",
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

### POST /api/PersonalQA/\_getAnswersForQuestion

**Description:** Retrieves all answers provided by a user for a specific question.

**Requirements:**

* `userId` exists, `questionId` exists and belongs to `userId`

**Effects:**

* returns all `Answer` records for the specified `questionId` by `userId`

**Request Body:**

```json
{
  "userId": "string",
  "questionId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "text": "string",
    "answeredAt": "number"
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

### POST /api/PersonalQA/\_getAllAnswers

**Description:** Retrieves all questions and their corresponding answers for a specific user.

**Requirements:**

* `userId` exists

**Effects:**

* returns all `Question` and `Answer` pairings for `userId`

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
    "questionId": "string",
    "questionText": "string",
    "answerId": "string",
    "answerText": "string",
    "answeredAt": "number"
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
