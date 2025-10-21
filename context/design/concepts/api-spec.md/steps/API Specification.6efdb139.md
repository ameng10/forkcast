---
timestamp: 'Tue Oct 21 2025 15:52:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155220.f3ceaf8a.md]]'
content_id: 6efdb1395ad6e71b3253c24c82730d8384dbbc20584a025e2e7298e4b0aaf39d
---

# API Specification: SwapSuggestions Concept

**Purpose:** To manage and facilitate suggestions for swapping items or ideas between users.

***

## API Endpoints

### POST /api/SwapSuggestions/propose

**Description:** Proposes a new swap suggestion between users.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "proposerId": "ID",
  "suggestedForId": "ID",
  "itemOffered": "Object",
  "itemRequested": "Object"
}
```

**Success Response Body (Action):**

```json
{
  "proposalId": "ID"
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

**Description:** Accepts a specific swap suggestion.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "proposalId": "ID",
  "acceptorId": "ID"
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

**Description:** Retrieves a specific swap proposal by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "proposalId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "proposalId": "ID",
    "proposerId": "ID",
    "suggestedForId": "ID",
    "itemOffered": "Object",
    "itemRequested": "Object",
    "status": "String"
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

**Description:** Lists all swap proposals related to a specific user (as proposer or recipient).

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
  "statusFilter": "String"
}
```

**Success Response Body (Query):**

```json
[
  {
    "proposalId": "ID",
    "proposerId": "ID",
    "suggestedForId": "ID",
    "itemOffered": "Object",
    "itemRequested": "Object",
    "status": "String"
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
