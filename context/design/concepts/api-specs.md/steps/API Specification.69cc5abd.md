---
timestamp: 'Tue Oct 21 2025 16:02:46 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_160246.00795e07.md]]'
content_id: 69cc5abdeb7e0ff954c776155628e189ff69e8fbac066114b2b982f6bbb16e8b
---

# API Specification: QuickCheckIns Concept

**Purpose:** Enable users to define and record measurements for custom metrics, and retrieve their check-in data.

***

## API Endpoints

### POST /api/QuickCheckIns/record

**Description:** Records a new check-in value for a specific metric owned by a user.

**Requirements:**

* The `owner` (User ID) must correspond to an existing user.
* The `metricName` must correspond to a metric previously defined by the `owner`.
* The `value` must be a valid number.
* `timestamp` is optional, if not provided, current time will be used.

**Effects:**

* A new check-in record is created, associating the `owner`, `metricName`, `value`, and `timestamp`.
* A unique identifier (`checkInId`) for the new check-in is generated and returned.

**Request Body:**

```json
{
  "owner": "ID",
  "metricName": "String",
  "value": "Number",
  "timestamp": "Number"
}
```

**Success Response Body (Action):**

```json
{
  "checkInId": "ID"
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

**Description:** Defines a new custom metric that a user can record check-ins against.

**Requirements:**

* The `owner` (User ID) must correspond to an existing user.
* A metric with the given `name` must not already exist for this `owner`.
* The `unit` string must not be empty.

**Effects:**

* A new metric is defined for the `owner` with the specified `name` and `unit`.
* A unique identifier (`metricId`) for the new metric is generated and returned.

**Request Body:**

```json
{
  "owner": "ID",
  "name": "String",
  "unit": "String"
}
```

**Success Response Body (Action):**

```json
{
  "metricId": "ID"
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

**Description:** Modifies an existing check-in record for a specific user.

**Requirements:**

* The `owner` (User ID) must correspond to an existing user.
* The `checkInId` must correspond to an existing check-in owned by `owner`.
* `newValue` must be a valid number. `newTimestamp` is optional.

**Effects:**

* The check-in identified by `checkInId` has its `value` updated to `newValue`.
* If `newTimestamp` is provided, the check-in's timestamp is updated.

**Request Body:**

```json
{
  "owner": "ID",
  "checkInId": "ID",
  "newValue": "Number",
  "newTimestamp": "Number"
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

**Description:** Retrieves a specific check-in record by its unique identifier.

**Requirements:**

* The `checkInId` must correspond to an existing check-in.

**Effects:**

* Returns the check-in record including its `owner`, `metricName`, `value`, and `timestamp`.

**Request Body:**

```json
{
  "checkInId": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "checkInId": "ID",
    "owner": "ID",
    "metricName": "String",
    "value": "Number",
    "timestamp": "Number"
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

**Description:** Retrieves all metrics defined by a user matching a given name.

**Requirements:**

* The `owner` (User ID) must correspond to an existing user.
* The `name` string must not be empty.

**Effects:**

* Returns a list of metrics defined by `owner` that have the specified `name`, including their ID and unit.

**Request Body:**

```json
{
  "owner": "ID",
  "name": "String"
}
```

**Success Response Body (Query):**

```json
[
  {
    "metricId": "ID",
    "name": "String",
    "unit": "String"
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

**Description:** Retrieves all check-in records for a specific user, optionally filtered by metric name and time range.

**Requirements:**

* The `owner` (User ID) must correspond to an existing user.
* `metricName` (optional) must correspond to a metric defined by the `owner` if provided.
* `startDate` and `endDate` (optional) must be valid timestamps if provided.

**Effects:**

* Returns a list of all check-in records for the `owner`, filtered by the provided optional parameters.

**Request Body:**

```json
{
  "owner": "ID",
  "metricName": "String",
  "startDate": "Number",
  "endDate": "Number"
}
```

**Success Response Body (Query):**

```json
[
  {
    "checkInId": "ID",
    "metricName": "String",
    "value": "Number",
    "timestamp": "Number"
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
