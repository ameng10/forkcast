---
timestamp: 'Tue Oct 21 2025 15:26:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152619.1e08653e.md]]'
content_id: 90a64afcb706d7034e54cebd53a37a312f86953d9d0a239b043361f7fafc59a3
---

# API Specification: QuickCheckIns Concept

**Purpose:** enable users to quickly check in on their emotional or mental state using predefined prompts

***

## API Endpoints

### POST /api/QuickCheckIns/createPrompt

**Description:** Creates a new prompt with specified text, type, and suggested responses.

**Requirements:**

* text is not empty; type is valid

**Effects:**

* creates a new Prompt with the given details; returns the new prompt's ID

**Request Body:**

```json
{
  "text": "string",
  "type": "string",
  "suggestedResponses": [
    "string"
  ]
}
```

**Success Response Body (Action):**

```json
{
  "prompt": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/respondToCheckIn

**Description:** Creates a new check-in entry for a user in response to a prompt.

**Requirements:**

* user exists; prompt exists; response is not empty

**Effects:**

* creates a new CheckInEntry for the user with the given prompt and response; returns the new check-in's ID

**Request Body:**

```json
{
  "user": "string",
  "prompt": "string",
  "response": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkIn": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/updateCheckInResponse

**Description:** Updates the response for a specified check-in entry.

**Requirements:**

* checkIn exists and belongs to the user; newResponse is not empty

**Effects:**

* updates the response for the specified check-in entry

**Request Body:**

```json
{
  "checkIn": "string",
  "newResponse": "string"
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

### POST /api/QuickCheckIns/\_getCheckInsForPrompt

**Description:** Retrieves all check-in entries for a user associated with a specific prompt.

**Requirements:**

* user exists; prompt exists

**Effects:**

* returns all check-in entries for the user associated with the specified prompt

**Request Body:**

```json
{
  "user": "string",
  "prompt": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "response": "string",
    "timestamp": "number"
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

### POST /api/QuickCheckIns/\_getRecentCheckIns

**Description:** Retrieves the most recent check-in entries for a user up to a specified limit.

**Requirements:**

* user exists; limit is positive

**Effects:**

* returns the most recent check-in entries for the user up to the specified limit

**Request Body:**

```json
{
  "user": "string",
  "limit": "number"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "promptText": "string",
    "response": "string",
    "timestamp": "number"
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
