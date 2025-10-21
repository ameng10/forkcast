---
timestamp: 'Tue Oct 21 2025 15:56:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155651.87aacf4b.md]]'
content_id: b9c041bdde5f24e548df571013ca318c2e05702b049e040d9d78b714b46bd33f
---

# API Specification: SwapSuggestions Concept

**Purpose:** To manage and facilitate suggestions for swapping items or ideas between users.

***

## API Endpoints

### POST /api/SwapSuggestions/propose

**Description:** Creates a new swap proposal, detailing the items offered and requested between two users.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "proposerId": "string",
  "suggestedForId": "string",
  "itemOffered": "object",
  "itemRequested": "object"
}
```

**Success Response Body (Action):**

```json
{
  "proposalId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/accept

**Description:** Marks an existing swap suggestion as accepted by the intended recipient.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "proposalId": "string",
  "acceptorId": "string"
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

### POST /api/SwapSuggestions/\_getProposal

**Description:** Retrieves the full details of a specific swap proposal by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "proposalId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "proposalId": "string",
    "proposerId": "string",
    "suggestedForId": "string",
    "itemOffered": "object",
    "itemRequested": "object",
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

### POST /api/SwapSuggestions/\_getProposalsByOwner

**Description:** Lists all swap proposals associated with a particular user, optionally filtered by status.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "statusFilter": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "proposalId": "string",
    "proposerId": "string",
    "suggestedForId": "string",
    "itemOffered": "object",
    "itemRequested": "object",
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
