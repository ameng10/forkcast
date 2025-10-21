---
timestamp: 'Tue Oct 21 2025 15:29:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152929.4780128b.md]]'
content_id: be3de277d38d280345be9855c9692d67a4de9b3e0da7c4189c12c307decd0636
---

# API Specification: QuickCheckIns Concept

**Purpose:** facilitate rapid periodic check-ins on user well-being or status.

***

## API Endpoints

### POST /api/QuickCheckIns/performCheckIn

**Description:** Records a new quick check-in for a user on a specific type (e.g., mood, energy).

**Requirements:**

* `userId` exists, `checkInType` is not empty, `value` is within an expected range (e.g., 1-10)

**Effects:**

* creates a new `CheckIn` record for `userId` with the given details, returns its `checkInId`

**Request Body:**

```json
{
  "userId": "string",
  "checkInType": "string",
  "value": "number",
  "notes": "string"
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

### POST /api/QuickCheckIns/updateCheckIn

**Description:** Updates the value and/or notes of an existing check-in entry.

**Requirements:**

* `userId` exists, `checkInId` exists and belongs to `userId`, `newValue` is within expected range

**Effects:**

* updates the `value` and `notes` of the specified `CheckIn`

**Request Body:**

```json
{
  "userId": "string",
  "checkInId": "string",
  "newValue": "number",
  "newNotes": "string"
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

### POST /api/QuickCheckIns/\_getCheckInsByType

**Description:** Retrieves all check-in records for a user of a specific type.

**Requirements:**

* `userId` exists, `checkInType` is not empty

**Effects:**

* returns all `CheckIn` records for `userId` of the specified `checkInType`

**Request Body:**

```json
{
  "userId": "string",
  "checkInType": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "value": "number",
    "notes": "string",
    "timestamp": "number"
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

### POST /api/QuickCheckIns/\_getRecentCheckIns

**Description:** Retrieves a specified number of the most recent check-in records for a user.

**Requirements:**

* `userId` exists, `count` is positive

**Effects:**

* returns the `count` most recent `CheckIn` records for `userId`

**Request Body:**

```json
{
  "userId": "string",
  "count": "number"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "type": "string",
    "value": "number",
    "timestamp": "number"
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
