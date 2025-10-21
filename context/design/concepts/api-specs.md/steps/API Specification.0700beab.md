---
timestamp: 'Tue Oct 21 2025 16:02:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_160246.00795e07.md]]'
content_id: 0700beab31aafb7ea0e523a89ba4a106b9deb83e7beab062abef985f08d4507b
---

# API Specification: SwapSuggestions Concept

**Purpose:** Facilitate the proposal and acceptance of item swaps between users.

***

## API Endpoints

### POST /api/SwapSuggestions/propose

**Description:** Allows a user to propose a swap of their item for another user's item.

**Requirements:**

* `proposer` and `accepter` must correspond to existing users.
* `proposerItem` and `accepterItem` must correspond to existing items.
* The `proposer` must own `proposerItem`.
* The `accepter` must own `accepterItem`.

**Effects:**

* A new swap `proposal` is created, linking the `proposer`, `accepter`, and their respective items.
* A unique identifier (`proposalId`) for the new proposal is generated and returned.

**Request Body:**

```json
{
  "proposer": "ID",
  "proposerItem": "ID",
  "accepter": "ID",
  "accepterItem": "ID"
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

**Description:** Allows the recipient of a proposal to accept a swap, finalizing the item exchange.

**Requirements:**

* `proposalId` must correspond to an existing proposal.
* The calling user must be the `accepter` of the proposal.
* The proposal must be in a pending state.

**Effects:**

* The swap `proposal` identified by `proposalId` is marked as accepted.
* The `proposerItem` is transferred to the `accepter`, and `accepterItem` is transferred to the `proposer`.
* The proposal is finalized and cannot be modified further.

**Request Body:**

```json
{
  "proposalId": "ID"
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

**Description:** Retrieves the details of a specific swap proposal by its unique identifier.

**Requirements:**

* `proposalId` must correspond to an existing proposal.

**Effects:**

* Returns the details of the proposal, including the `proposer`, `accepter`, their respective `items`, and the `status` of the proposal.

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
    "proposer": "ID",
    "proposerItem": "ID",
    "accepter": "ID",
    "accepterItem": "ID",
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

**Description:** Retrieves all swap proposals where a given user is either the proposer or the accepter.

**Requirements:**

* `owner` must correspond to an existing user.

**Effects:**

* Returns a list of all proposals involving the `owner`, including their IDs, associated items, and status.

**Request Body:**

```json
{
  "owner": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "proposalId": "ID",
    "proposer": "ID",
    "proposerItem": "ID",
    "accepter": "ID",
    "accepterItem": "ID",
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
