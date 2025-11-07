---
timestamp: 'Fri Nov 07 2025 02:01:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_020152.944dd54f.md]]'
content_id: 0a45d81371f1f7b6875f18321740cd8bf4c77e04f8b94afc6e1a73f3faa16f16
---

# API Specification: PersonalQA Concept

**Purpose:** To provide a personalized question-answering system based on user-provided facts.

***

## API Endpoints

### POST /api/PersonalQA/ingestFact

**Description:** Ingests a new piece of information as a fact for a user.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Creates a new Fact record associated with the user, containing the provided content.
* Returns the ID of the newly created fact.

**Request Body:**

```json
{
  "user": "UserID",
  "content": "string"
}
```

**Success Response Body (Action):**

```json
{
  "fact": "FactID"
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

**Description:** Deletes a previously ingested fact.

**Requirements:**

* The `fact` ID must be a valid and existing fact.

**Effects:**

* Removes the specified Fact record from the system.

**Request Body:**

```json
{
  "fact": "FactID"
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

**Description:** Asks a question against the user's fact base and returns a draft answer.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Searches the user's facts for relevant information.
* Creates a new Question/Answer (QA) record in a 'draft' state.
* Returns the ID of the new QA record.

**Request Body:**

```json
{
  "user": "UserID",
  "query": "string"
}
```

**Success Response Body (Action):**

```json
{
  "answer": "QA_ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/askLLM

**Description:** Asks a question using an external LLM, using the user's facts as context.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Creates a new Question/Answer (QA) record in a 'draft' state using an LLM-generated response.
* Returns the ID of the new QA record.

**Request Body:**

```json
{
  "user": "UserID",
  "query": "string"
}
```

**Success Response Body (Action):**

```json
{
  "answer": "QA_ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/setTemplate

**Description:** Sets a custom prompt template for the user's LLM queries.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Updates the user's stored LLM prompt template with the new value.

**Request Body:**

```json
{
  "user": "UserID",
  "template": "string"
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

### POST /api/PersonalQA/\_getUserFacts

**Description:** Retrieves all facts associated with a user.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Returns a list of all facts for the specified user.

**Request Body:**

```json
{
  "user": "UserID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "FactID",
    "content": "string",
    "owner": "UserID"
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

**Description:** Retrieves all question-answer pairs for a user.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Returns a list of all QAs for the specified user.

**Request Body:**

```json
{
  "user": "UserID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "QA_ID",
    "query": "string",
    "answer": "string",
    "owner": "UserID"
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

### POST /api/PersonalQA/\_getUserDrafts

**Description:** Retrieves all draft question-answer pairs for a user.

**Requirements:**

* The `user` ID must be a valid and existing user.

**Effects:**

* Returns a list of all draft QAs for the specified user.

**Request Body:**

```json
{
  "user": "UserID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "QA_ID",
    "query": "string",
    "answer": "string",
    "owner": "UserID",
    "isDraft": "boolean"
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
