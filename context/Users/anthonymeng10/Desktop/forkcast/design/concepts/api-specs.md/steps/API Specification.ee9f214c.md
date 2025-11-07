---
timestamp: 'Fri Nov 07 2025 01:46:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014649.24e98b00.md]]'
content_id: ee9f214c5f473fa9d499defd0b0c6e04ccb96393f96b0fb4970ae8c0640422a9
---

# API Specification: QuickCheckIns Concept

**Purpose:** To facilitate regular, brief check-ins on mood, progress, or other metrics.

***

## API Endpoints

### POST /api/QuickCheckIns/checkIn

**Description:** Records a new daily check-in for a user.

**Requirements:**

* The `user` must exist.
* `mood` must be a number within a valid range (e.g., 1-5).

**Effects:**

* A new `CheckIn` record is created with the user's mood, an optional note, and the current timestamp.
* The ID of the new check-in is returned.

**Request Body:**

```json
{
  "user": "ID",
  "mood": "number",
  "note": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkIn": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/\_getCheckIns

**Description:** Retrieves a user's check-ins within a specified date range.

**Requirements:**

* The `user` must exist.
* `startDate` and `endDate` must be valid date strings.

**Effects:**

* Returns a list of all check-in records for the user that fall within the specified time period.

**Request Body:**

```json
{
  "user": "ID",
  "startDate": "Date",
  "endDate": "Date"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "ID",
    "mood": "number",
    "note": "string",
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
