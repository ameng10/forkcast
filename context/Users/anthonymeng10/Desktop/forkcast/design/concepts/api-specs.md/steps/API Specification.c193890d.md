---
timestamp: 'Fri Nov 07 2025 01:54:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015440.a61afa39.md]]'
content_id: c193890d90bd5167aaafb2aedd656f6ad17d686bb21444cda9839bdf1874bc5a
---

# API Specification: SwapSuggestions Concept

**Purpose:** To provide and manage AI-generated healthy alternative suggestions for logged meals.

***

## API Endpoints

### POST /api/SwapSuggestions/addSwapSuggestion

**Description:** Creates and stores a new swap suggestion for a specific meal.

**Requirements:**

* A `Meal` with the specified ID `meal` must exist.

**Effects:**

* Creates a new `Suggestion` record linked to the `meal`.
* Sets the suggestion's status to 'pending'.
* Returns the new suggestion's ID.

**Request Body:**

```json
{
  "user": "string (UserID)",
  "meal": "string (MealID)",
  "suggestionText": "string"
}
```

**Success Response Body (Action):**

```json
{
  "suggestion": "string (SuggestionID)"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/acceptSwapSuggestion

**Description:** Marks a given swap suggestion as 'accepted'.

**Requirements:**

* A `Suggestion` with the specified ID `suggestion` must exist.

**Effects:**

* Updates the status of the specified `Suggestion` to 'accepted'.

**Request Body:**

```json
{
  "suggestion": "string (SuggestionID)"
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

**Description:** Retrieves all swap suggestions associated with a specific meal.

**Requirements:**

* A `Meal` with the specified ID `meal` must exist.

**Effects:**

* Returns a list of all `Suggestion` documents for the given `meal`.

**Request Body:**

```json
{
  "meal": "string (MealID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (SuggestionID)",
    "suggestionText": "string",
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
