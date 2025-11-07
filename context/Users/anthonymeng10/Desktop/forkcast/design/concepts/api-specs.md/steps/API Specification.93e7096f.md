---
timestamp: 'Fri Nov 07 2025 02:01:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_020152.944dd54f.md]]'
content_id: 93e7096f2c6446531ed4de11bc1f4309f812c85deb5cc7f9eb30795682e3abb2
---

# API Specification: SwapSuggestions Concept

**Purpose:** To allow users to propose and accept suggestions for swapping one meal with another.

***

## API Endpoints

### POST /api/SwapSuggestions/propose

**Description:** Proposes a swap from an existing meal to a new meal suggestion.

**Requirements:**

* `owner` ID must be a valid and existing user.
* `fromMeal` ID must be a valid meal belonging to the user.

**Effects:**

* Creates a new meal swap proposal in a 'pending' state.
* Returns the ID of the new proposal.

**Request Body:**

```json
{
  "owner": "UserID",
  "fromMeal": "MealID",
  "toMealSuggestion": "string"
}
```

**Success Response Body (Action):**

```json
{
  "proposal": "ProposalID"
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

**Description:** Accepts a meal swap proposal.

**Requirements:**

* The `proposal` ID must be valid and in a 'pending' state.

**Effects:**

* Marks the proposal as 'accepted'.

**Request Body:**

```json
{
  "proposal": "ProposalID"
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

**Description:** Retrieves a single swap proposal by its ID.

**Requirements:**

* The `proposal` ID must be a valid and existing proposal.

**Effects:**

* Returns the specified proposal record.

**Request Body:**

```json
{
  "proposal": "ProposalID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "ProposalID",
    "fromMeal": "MealID",
    "toMealSuggestion": "string",
    "status": "string",
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

### POST /api/SwapSuggestions/\_getProposalsByOwner

**Description:** Retrieves all swap proposals for a user.

**Requirements:**

* The `owner` ID must be a valid and existing user.

**Effects:**

* Returns a list of all proposal records for the user.

**Request Body:**

```json
{
  "owner": "UserID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "ProposalID",
    "fromMeal": "MealID",
    "toMealSuggestion": "string",
    "status": "string",
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
