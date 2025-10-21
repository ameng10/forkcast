---
timestamp: 'Tue Oct 21 2025 15:26:19 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152619.1e08653e.md]]'
content_id: afa7ce9750b1e6911c222c87c469b9ef5e774b6e6a394f2a5ba7fa82c5dd0db7
---

# API Specification: SwapSuggestions Concept

**Purpose:** suggest potential item swaps between users to facilitate exchanges

***

## API Endpoints

### POST /api/SwapSuggestions/offerItem

**Description:** Adds an item to a user's offered items and generates new swap suggestions.

**Requirements:**

* user exists and item is valid

**Effects:**

* adds item to the user's offered items; generates new swap suggestions based on this offer

**Request Body:**

```json
{
  "user": "string",
  "item": "string"
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

### POST /api/SwapSuggestions/wantItem

**Description:** Adds an item to a user's wanted items and generates new swap suggestions.

**Requirements:**

* user exists and item is valid

**Effects:**

* adds item to the user's wanted items; generates new swap suggestions based on this want

**Request Body:**

```json
{
  "user": "string",
  "item": "string"
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

### POST /api/SwapSuggestions/acceptSuggestion

**Description:** Changes the status of a pending swap suggestion to "accepted".

**Requirements:**

* suggestion exists and has status "pending"

**Effects:**

* changes suggestion status to "accepted"; facilitates the actual item swap (implies external actions)

**Request Body:**

```json
{
  "suggestion": "string"
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

### POST /api/SwapSuggestions/rejectSuggestion

**Description:** Changes the status of a pending swap suggestion to "rejected".

**Requirements:**

* suggestion exists and has status "pending"

**Effects:**

* changes suggestion status to "rejected"

**Request Body:**

```json
{
  "suggestion": "string"
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

### POST /api/SwapSuggestions/\_getSuggestionsForUser

**Description:** Retrieves all swap suggestions involving a specific user, with full details.

**Requirements:**

* user exists

**Effects:**

* returns all swap suggestions involving the user, with full details

**Request Body:**

```json
{
  "user": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "initiatingUser": "string",
    "targetUser": "string",
    "offeredItem": "string",
    "requestedItem": "string",
    "status": "string"
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
