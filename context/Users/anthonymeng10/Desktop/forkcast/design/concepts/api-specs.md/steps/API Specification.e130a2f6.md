---
timestamp: 'Fri Nov 07 2025 02:01:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_020152.944dd54f.md]]'
content_id: e130a2f65caa968f2f6241f6056e7383a22551d04b31cbc8198e587cd427bebb
---

# API Specification: QuickCheckIns Concept

**Purpose:** To allow users to define metrics and record periodic check-ins against them.

***

## API Endpoints

### POST /api/QuickCheckIns/record

**Description:** Records a new check-in for a specific metric.

**Requirements:**

* `owner` ID must be a valid and existing user.
* `metric` name must correspond to a metric defined by the owner.

**Effects:**

* Creates a new check-in record with the given value and notes.
* Returns the ID of the new check-in.

**Request Body:**

```json
{
  "owner": "UserID",
  "metric": "string",
  "value": "number",
  "notes": "string"
}
```

**Success Response Body (Action):**

```json
{
  "checkIn": "CheckInID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/defineMetric

**Description:** Defines a new metric for a user to track.

**Requirements:**

* `owner` ID must be a valid and existing user.
* The metric `name` must not already exist for the user.

**Effects:**

* Creates a new metric definition for the user.
* Returns the ID of the new metric.

**Request Body:**

```json
{
  "owner": "UserID",
  "name": "string",
  "unit": "string"
}
```

**Success Response Body (Action):**

```json
{
  "metric": "MetricID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/QuickCheckIns/edit

**Description:** Edits the value or notes of an existing check-in.

**Requirements:**

* The `checkIn` ID must be a valid and existing check-in.

**Effects:**

* Updates the specified check-in record with the new value and notes.

**Request Body:**

```json
{
  "checkIn": "CheckInID",
  "value": "number",
  "notes": "string"
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

### POST /api/QuickCheckIns/delete

**Description:** Deletes a check-in record.

**Requirements:**

* The `checkIn` ID must be a valid and existing check-in.

**Effects:**

* Removes the specified check-in record.

**Request Body:**

```json
{
  "checkIn": "CheckInID"
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

### POST /api/QuickCheckIns/deleteMetric

**Description:** Deletes a metric definition and all associated check-ins.

**Requirements:**

* The `metric` ID must be a valid and existing metric.

**Effects:**

* Removes the metric definition and all of its associated check-in records.

**Request Body:**

```json
{
  "metric": "MetricID"
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

### POST /api/QuickCheckIns/\_getCheckIn

**Description:** Retrieves a single check-in by its ID.

**Requirements:**

* The `checkIn` ID must be a valid and existing check-in.

**Effects:**

* Returns the specified check-in record.

**Request Body:**

```json
{
  "checkIn": "CheckInID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "CheckInID",
    "metric": "MetricID",
    "value": "number",
    "notes": "string",
    "timestamp": "date"
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

### POST /api/QuickCheckIns/\_getMetricsByName

**Description:** Retrieves metric definitions for a user by name.

**Requirements:**

* The `owner` ID must be a valid and existing user.

**Effects:**

* Returns a list of metric definitions matching the name for that user.

**Request Body:**

```json
{
  "owner": "UserID",
  "name": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "MetricID",
    "name": "string",
    "unit": "string",
    "owner": "UserID"
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

### POST /api/QuickCheckIns/\_listCheckInsByOwner

**Description:** Lists all check-ins recorded by a user.

**Requirements:**

* The `owner` ID must be a valid and existing user.

**Effects:**

* Returns a list of all check-in records for the user.

**Request Body:**

```json
{
  "owner": "UserID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "CheckInID",
    "metric": "MetricID",
    "value": "number",
    "notes": "string",
    "timestamp": "date"
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
