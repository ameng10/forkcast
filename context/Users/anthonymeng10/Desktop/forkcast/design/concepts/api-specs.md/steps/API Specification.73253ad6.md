---
timestamp: 'Fri Nov 07 2025 01:53:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015314.8219baf1.md]]'
content_id: 73253ad6fbdaba5dfdf6a30496dfa07a286bd317719d576e49309af946eeb5a8
---

# API Specification: QuickCheckIns Concept

**Purpose:** To allow users to log brief, periodic status updates or mood entries for tracking well-being.

***

## API Endpoints

### POST /api/QuickCheckIns/checkIn

**Description:** Records a new check-in entry with a mood and an optional note.

**Requirements:**

* The `mood` string must not be empty.

**Effects:**

* A new check-in record is created with the provided mood, note, and a server-generated timestamp.
* Returns the unique ID of the new check-in.

**Request Body:**

```json
{
  "mood": "string",
  "note": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkInId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/\_getCheckInHistory

**Description:** Retrieves the user's complete history of check-in entries.

**Requirements:**

* None.

**Effects:**

* Fetches all check-in records for the user, ordered from most to least recent.
* Returns an array of check-in objects.

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "checkInId": "string",
    "mood": "string",
    "note": "string",
    "timestamp": "string"
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
