---
timestamp: 'Fri Nov 07 2025 01:26:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_012614.34b8893b.md]]'
content_id: 537037eec54e762d9c2ef8d73ab7e586624d8e1e7e7c4e522771116a974b8e51
---

# API Specification: SwapSuggestions Concept

**Purpose:** To suggest healthier or alternative food swaps based on a user's logged meals or individual food items.

***

## API Endpoints

### POST /api/SwapSuggestions/createSwapRule

**Description:** Creates a new rule that defines a suggested swap from one food item to another.

**Requirements:**

* Both `originalItem` and `suggestedItem` must be valid FoodItem IDs.

**Effects:**

* A new SwapRule entity is created linking the two food items with a justification.
* The ID of the new rule is returned.

**Request Body:**

```json
{
  "originalItem": "ID",
  "suggestedItem": "ID",
  "reason": "string"
}
```

**Success Response Body (Action):**

```json
{
  "swapRule": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/\_getSuggestionsForMeal

**Description:** Analyzes a completed meal log and returns all applicable food swap suggestions.

**Requirements:**

* The MealLog entity specified by `mealLog` must exist.

**Effects:**

* Returns a list of potential swaps for the items contained within the specified meal log.

**Request Body:**

```json
{
  "mealLog": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "originalItem": { "id": "ID", "name": "string" },
    "suggestedItem": { "id": "ID", "name": "string" },
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
