---
timestamp: 'Tue Oct 21 2025 15:52:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155220.f3ceaf8a.md]]'
content_id: 0ff9c109d367f688c68ce9ebce619ec3ab7c08a11494457e51cf9c701c817392
---

# API Specification: QuickCheckIns Concept

**Purpose:** To enable users to quickly record metrics about their state or activities and manage these metrics.

***

## API Endpoints

### POST /api/QuickCheckIns/record

**Description:** Records a new check-in value for a specified metric and owner.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
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

**Description:** Defines a new metric that can be used for check-ins.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
  "metricName": "String",
  "unit": "String",
  "description": "String"
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

**Description:** Edits an existing check-in entry.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "checkInId": "ID",
  "ownerId": "ID",
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

**Description:** Retrieves a specific check-in by its ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

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
    "ownerId": "ID",
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

**Description:** Retrieves metrics matching a given name or pattern for an owner.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
  "metricName": "String"
}
```

**Success Response Body (Query):**

```json
[
  {
    "metricId": "ID",
    "name": "String",
    "unit": "String",
    "description": "String"
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

**Description:** Lists all check-ins for a specific owner, optionally filtered by metric or time.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "ID",
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
    "ownerId": "ID",
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
