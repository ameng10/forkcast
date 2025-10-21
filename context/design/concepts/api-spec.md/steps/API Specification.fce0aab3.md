---
timestamp: 'Tue Oct 21 2025 13:33:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_133353.bae1eddb.md]]'
content_id: fce0aab311dde700003c404bde3e541acf501c40c121e423be3080cd75e83350
---

# API Specification: QuickCheckIns Concept

**Purpose:** enable users to quickly log their current mood, energy levels, or other simple metrics for a rapid overview of their well-being

***

## API Endpoints

### POST /api/QuickCheckIns/recordCheckIn

**Description:** Records a quick check-in for a user, logging their current mood, energy level, and any notes.

**Requirements:**

* user exists

**Effects:**

* creates a new CheckIn `ci`
* sets `ci`'s `user` to `user`, `mood` to `mood`, `energyLevel` to `energyLevel`, `notes` to `notes`, and `timestamp` to current time
* adds `ci` to `user`'s `checkIns`
* returns `ci` as `checkIn`

**Request Body:**

```json
{
  "user": "{ID}",
  "mood": "string",
  "energyLevel": "number",
  "notes": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkIn": "{ID}"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/\_getCheckInsForUser

**Description:** Retrieves all quick check-ins for a specified user within a given date range.

**Requirements:**

* user exists

**Effects:**

* returns all check-ins for the given user within the specified date range, each with its timestamp, mood, energy level, and notes

**Request Body:**

```json
{
  "user": "{ID}",
  "startDate": "string",
  "endDate": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "checkIn": {
      "timestamp": "string",
      "mood": "string",
      "energyLevel": "number",
      "notes": "string"
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
