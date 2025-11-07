---
timestamp: 'Fri Nov 07 2025 01:26:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_012614.34b8893b.md]]'
content_id: 2a28ce55cf032397b05608cf76f6aae40128f098cadb4b72db372b72ce366fbc
---

# API Specification: QuickCheckIns Concept

**Purpose:** To log brief status updates, moods, or journal entries for a user over time.

***

## API Endpoints

### POST /api/QuickCheckIns/createCheckIn

**Description:** Creates a new check-in entry for a user with a status and an optional note.

**Requirements:**

* The specified `user` must exist.
* The `status` field must not be empty.

**Effects:**

* A new CheckIn entity is created for the user with the current timestamp.
* The ID of the new CheckIn entity is returned.

**Request Body:**

```json
{
  "user": "ID",
  "status": "string",
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

**Description:** Retrieves a user's check-in entries within a specified date range.

**Requirements:**

* The specified `user` must exist.

**Effects:**

* Returns a list of all CheckIn entities for the user that fall between `startDate` and `endDate`.

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
    "checkIn": "ID",
    "timestamp": "Date",
    "status": "string",
    "note": "string"
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
