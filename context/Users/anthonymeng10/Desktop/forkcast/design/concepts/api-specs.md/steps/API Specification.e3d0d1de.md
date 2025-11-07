---
timestamp: 'Fri Nov 07 2025 01:42:59 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014259.aca5f87a.md]]'
content_id: e3d0d1de14d60e441b7fae01400002e759e2883309dbea64ae0f4555f4bb86ad
---

# API Specification: QuickCheckIns Concept

**Purpose:** To enable users to log brief, periodic updates about their status or mood.

***

## API Endpoints

### POST /api/QuickCheckIns/logCheckIn

**Description:** Logs a new check-in for a user with a mood and an optional note.

**Requirements:**

* The `author` user must exist.
* The `mood` string must not be empty.

**Effects:**

* A new `CheckIn` entity is created.
* The `CheckIn` is associated with the `author`.
* A timestamp, `mood`, and `note` are recorded.
* The ID of the new `CheckIn` is returned.

**Request Body:**

```json
{
  "author": "User",
  "mood": "string",
  "note": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkIn": "CheckIn"
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

**Description:** Retrieves a history of all check-ins for a user.

**Requirements:**

* The `author` user must exist.

**Effects:**

* Returns a list of all `CheckIn` entities for the given `author`, typically sorted by timestamp.

**Request Body:**

```json
{
  "author": "User"
}
```

**Success Response Body (Query):**

```json
[
  {
    "checkIn": "CheckIn",
    "timestamp": "Date",
    "mood": "string",
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
