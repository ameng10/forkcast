---
timestamp: 'Fri Nov 07 2025 01:46:49 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014649.24e98b00.md]]'
content_id: 3092193b0ee9afa8c15d94582544d31d5af328f8c4c7645012a141a2cde986c8
---

# API Specification: InsightMining Concept

**Purpose:** To analyze a collection of text entries and generate key insights or themes.

***

## API Endpoints

### POST /api/InsightMining/addEntry

**Description:** Adds a new text entry for a user to be included in future analysis.

**Requirements:**

* The `user` must exist.
* `text` must not be empty.

**Effects:**

* A new `Entry` is created with the provided text and a timestamp.
* The ID of the new entry is returned.

**Request Body:**

```json
{
  "user": "ID",
  "text": "string"
}
```

**Success Response Body (Action):**

```json
{
  "entry": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/InsightMining/generateInsights

**Description:** Triggers an asynchronous job to analyze the user's entries and generate insights.

**Requirements:**

* The `user` must exist.
* The user must have a sufficient number of entries to analyze.

**Effects:**

* A background analysis process is initiated.
* A job ID is returned to track the status of the analysis.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "jobId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/InsightMining/\_getInsights

**Description:** Retrieves the latest set of generated insights for a user.

**Requirements:**

* The `user` must exist.

**Effects:**

* Returns a list of insight objects, each containing a theme and supporting entry excerpts.

**Request Body:**

```json
{
  "user": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "theme": "string",
    "supportingEntries": [
      "ID",
      "ID"
    ],
    "summary": "string"
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
