---
timestamp: 'Tue Oct 21 2025 15:56:51 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_155651.87aacf4b.md]]'
content_id: 2ec62b8487d2e20644ecd7822e97a034a1f32b3122d4fc92b9c2da87e58b2a55
---

# API Specification: QuickCheckIns Concept

**Purpose:** To enable users to quickly record metrics about their state or activities and manage these metrics.

***

## API Endpoints

### POST /api/QuickCheckIns/record

**Description:** Records a new check-in value for a specified metric, linked to an owner at a given timestamp.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "metricName": "string",
  "value": "number",
  "timestamp": "number"
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

### POST /api/QuickCheckIns/defineMetric

**Description:** Creates a new metric definition that can be used by an owner for subsequent check-ins.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "metricName": "string",
  "unit": "string",
  "description": "string"
}
```

**Success Response Body (Action):**

```json
{
  "metricId": "string"
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

**Description:** Modifies the value and/or timestamp of an existing check-in entry.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "checkInId": "string",
  "ownerId": "string",
  "newValue": "number",
  "newTimestamp": "number"
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

**Description:** Retrieves the details of a single check-in entry by its unique ID.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "checkInId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "checkInId": "string",
    "ownerId": "string",
    "metricName": "string",
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

### POST /api/QuickCheckIns/\_getMetricsByName

**Description:** Retrieves a list of metric definitions matching a given name for a specific owner.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "metricName": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "metricId": "string",
    "name": "string",
    "unit": "string",
    "description": "string"
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

**Description:** Lists all check-in entries for a specific owner, with optional filtering by metric name and date range.

**Requirements:**

* Not specified in the provided API summary.

**Effects:**

* Not specified in the provided API summary.

**Request Body:**

```json
{
  "ownerId": "string",
  "metricName": "string",
  "startDate": "number",
  "endDate": "number"
}
```

**Success Response Body (Query):**

```json
[
  {
    "checkInId": "string",
    "ownerId": "string",
    "metricName": "string",
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
