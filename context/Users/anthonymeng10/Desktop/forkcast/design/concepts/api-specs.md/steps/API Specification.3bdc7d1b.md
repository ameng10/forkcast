---
timestamp: 'Fri Nov 07 2025 01:53:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015314.8219baf1.md]]'
content_id: 3bdc7d1b3187495785033c5d823bbe059540b2bf3236b32c4eb540ab46ee1bb0
---

# API Specification: PersonalQA Concept

**Purpose:** To store and retrieve personal information in a question-and-answer format, acting as a personal knowledge base.

***

## API Endpoints

### POST /api/PersonalQA/addFact

**Description:** Adds a piece of information or a "fact" to the user's personal knowledge base.

**Requirements:**

* The `fact` string must not be empty.

**Effects:**

* A new fact record is created and stored in the database.
* The unique ID of the new fact is returned.

**Request Body:**

```json
{
  "fact": "string"
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

### POST /api/PersonalQA/askQuestion

**Description:** Poses a question against the stored facts and returns a synthesized answer.

**Requirements:**

* The `question` string must not be empty.

**Effects:**

* The system analyzes the stored facts to generate the most relevant answer.
* Returns the generated answer as a string.

**Request Body:**

```json
{
  "question": "string"
}
```

**Success Response Body (Action):**

```json
{
  "answer": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/\_getFacts

**Description:** Retrieves all facts currently stored in the user's knowledge base.

**Requirements:**

* None.

**Effects:**

* Fetches all fact records from the database.
* Returns an array of fact objects.

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "factId": "string",
    "fact": "string"
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
