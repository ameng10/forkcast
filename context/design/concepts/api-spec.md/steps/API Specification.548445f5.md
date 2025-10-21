---
timestamp: 'Tue Oct 21 2025 13:33:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_133353.bae1eddb.md]]'
content_id: 548445f580b7a1811096e6f5e3d2920eb9352c3aa767be5bb4a3cfda9430e5a7
---

# API Specification: InsightMining Concept

**Purpose:** detect long-term eating patterns and suggest personalized insights for diet adjustments

***

## API Endpoints

### POST /api/InsightMining/processNewMealLog

**Description:** Processes a new meal log for a user, analyzing their eating patterns and detecting new insights.

**Requirements:**

* mealLog has not been processed for this user

**Effects:**

* adds mealLog to user's processedMeals
* analyzes all processedMeals for user
* if new patterns detected, adds them to user's detectedPatterns and generates suggestedAdjustment

**Request Body:**

```json
{
  "user": "{ID}",
  "mealLog": "{ID}"
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

### POST /api/InsightMining/\_getDetectedPatterns

**Description:** Retrieves all detected eating patterns and suggested adjustments for a given user.

**Requirements:**

* user exists

**Effects:**

* returns all detected patterns for the given user, each with its type, description, and suggested adjustment

**Request Body:**

```json
{
  "user": "{ID}"
}
```

**Success Response Body (Query):**

```json
[
  {
    "pattern": {
      "patternType": "string",
      "description": "string",
      "suggestedAdjustment": "string"
    }
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
