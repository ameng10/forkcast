---
timestamp: 'Fri Nov 07 2025 01:54:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015440.a61afa39.md]]'
content_id: f282d01333063bf8f465b741debd23586e0eb8892bd145896ab83926eac66203
---

# API Specification: QuickCheckIns Concept

**Purpose:** To provide a simple way for users to log their mood and a brief note at any time.

***

## API Endpoints

### POST /api/QuickCheckIns/logCheckIn

**Description:** Records a user's current mood and an accompanying note as a check-in.

**Requirements:**

* The `user` must exist.
* The `mood` must be a number (e.g., within a predefined range like 1-5).

**Effects:**

* Creates a new `CheckIn` record with the user's ID, mood, note, and the current timestamp.
* Returns the ID of the new `CheckIn`.

**Request Body:**

```json
{
  "user": "string (UserID)",
  "mood": "number",
  "note": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkIn": "string (CheckInID)"
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

**Description:** Retrieves all historical check-ins for a specific user.

**Requirements:**

* The `user` must exist.

**Effects:**

* Returns a list of all `CheckIn` documents for the given user, ordered by timestamp.

**Request Body:**

```json
{
  "user": "string (UserID)"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "string (CheckInID)",
    "mood": "number",
    "note": "string",
    "timestamp": "string (ISO Date)"
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
