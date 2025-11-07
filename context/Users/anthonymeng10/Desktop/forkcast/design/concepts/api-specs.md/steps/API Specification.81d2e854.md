---
timestamp: 'Fri Nov 07 2025 01:42:59 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014259.aca5f87a.md]]'
content_id: 81d2e854b6372b8d91b2790462f2077c02c351b48ff374db2ed38f20fca4da9c
---

# API Specification: SwapSuggestions Concept

**Purpose:** To provide healthier or better alternative suggestions for logged items, such as meals.

***

## API Endpoints

### POST /api/SwapSuggestions/createSuggestion

**Description:** Creates a new swap suggestion for a target item, like a logged meal.

**Requirements:**

* The `targetMeal` must exist.
* The `suggestionText` must not be empty.

**Effects:**

* A new `Suggestion` entity is created.
* The `Suggestion` is linked to the `targetMeal`.
* The `suggestionText` and `reason` are stored.
* The suggestion is initialized with a 'pending' status.
* The ID of the new `Suggestion` is returned.

**Request Body:**

```json
{
  "targetMeal": "Meal",
  "suggestionText": "string",
  "reason": "string"
}
```

**Success Response Body (Action):**

```json
{
  "suggestion": "Suggestion"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/updateSuggestionStatus

**Description:** Updates the status of a suggestion to 'accepted' or 'rejected'.

**Requirements:**

* The `suggestion` must exist.
* The `status` must be either 'accepted' or 'rejected'.

**Effects:**

* The status of the specified `suggestion` is updated to the new value.

**Request Body:**

```json
{
  "suggestion": "Suggestion",
  "status": "string"
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

### POST /api/SwapSuggestions/\_getSuggestionsForMeal

**Description:** Retrieves all swap suggestions for a specific meal.

**Requirements:**

* The `targetMeal` must exist.

**Effects:**

* Returns a list of all `Suggestion` entities linked to the given `targetMeal`.

**Request Body:**

```json
{
  "targetMeal": "Meal"
}
```

**Success Response Body (Query):**

```json
[
  {
    "suggestion": "Suggestion",
    "suggestionText": "string",
    "reason": "string",
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
