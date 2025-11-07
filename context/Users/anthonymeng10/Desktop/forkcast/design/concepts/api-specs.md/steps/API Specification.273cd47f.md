---
timestamp: 'Fri Nov 07 2025 01:53:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015314.8219baf1.md]]'
content_id: 273cd47fc806f929927b7d8a8a7251933e3efb19ec9ffe6ee1ba58d1532f0a6d
---

# API Specification: SwapSuggestions Concept

**Purpose:** To provide healthier or better alternative suggestions for a given item, such as a food or a habit.

***

## API Endpoints

### POST /api/SwapSuggestions/getSuggestion

**Description:** Gets a healthier or more suitable alternative for a given item name.

**Requirements:**

* The `itemName` must not be empty.

**Effects:**

* Queries the system's rules to find a matching swap suggestion.
* Returns a suggestion object containing the alternative item and the reason for the swap.

**Request Body:**

```json
{
  "itemName": "string",
  "context": "string"
}
```

**Success Response Body (Action):**

```json
{
  "suggestion": {
    "name": "string",
    "reason": "string"
  }
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/addSwapRule

**Description:** Adds a new suggestion rule to the system (typically an administrative action).

**Requirements:**

* `originalItem`, `suggestedItem`, and `reason` must not be empty.
* A rule for the `originalItem` must not already exist.

**Effects:**

* A new swap suggestion rule is created and stored.
* Returns the unique ID of the new rule.

**Request Body:**

```json
{
  "originalItem": "string",
  "suggestedItem": "string",
  "reason": "string"
}
```

**Success Response Body (Action):**

```json
{
  "ruleId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/\_getAllRules

**Description:** Retrieves all swap suggestion rules currently defined in the system.

**Requirements:**

* None.

**Effects:**

* Fetches all rule records from the database.
* Returns an array of rule objects.

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "ruleId": "string",
    "originalItem": "string",
    "suggestedItem": "string",
    "reason": "string"
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
