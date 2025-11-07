---
timestamp: 'Fri Nov 07 2025 01:46:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014649.24e98b00.md]]'
content_id: b09cd51aacc27747d4074f6ea0767f8850f99bb7912fda1a6a033b7996c56eb2
---

# API Specification: SwapSuggestions Concept

**Purpose:** To provide users with healthier or better alternative suggestions for logged items, such as meals.

***

## API Endpoints

### POST /api/SwapSuggestions/requestSwapSuggestion

**Description:** Generates and returns a healthier alternative for a given food item.

**Requirements:**

* The `user` must exist.
* `originalItemName` must not be empty.

**Effects:**

* A new `Suggestion` is generated based on the original item.
* The new suggestion is stored and its ID is returned.

**Request Body:**

```json
{
  "user": "ID",
  "originalItemName": "string",
  "context": "string"
}
```

**Success Response Body (Action):**

```json
{
  "suggestion": "ID",
  "suggestionText": "string",
  "rationale": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/rateSuggestion

**Description:** Allows a user to provide feedback on a received suggestion.

**Requirements:**

* The `suggestion` must exist.
* `rating` must be a number within a valid range (e.g., 1-5).

**Effects:**

* The rating for the specified `suggestion` is updated.

**Request Body:**

```json
{
  "suggestion": "ID",
  "rating": "number"
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

### POST /api/SwapSuggestions/\_getSuggestions

**Description:** Retrieves all swap suggestions generated for a specific user.

**Requirements:**

* The `user` must exist.

**Effects:**

* Returns a list of all suggestion objects associated with the user.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "ID",
    "originalItemName": "string",
    "suggestionText": "string",
    "rationale": "string",
    "rating": "number",
    "timestamp": "Date"
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
