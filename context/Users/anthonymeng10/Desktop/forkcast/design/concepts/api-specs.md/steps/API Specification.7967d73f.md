---
timestamp: 'Fri Nov 07 2025 01:26:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_012614.34b8893b.md]]'
content_id: 7967d73f647e7ede3af238abe2bf3d1b820abff1586909bc654882db6e772dc8
---

# API Specification: InsightMining Concept

**Purpose:** To analyze a body of text and extract key insights or summaries.

***

## API Endpoints

### POST /api/InsightMining/submitSource

**Description:** Submits a new text document (source) for a user to be analyzed later.

**Requirements:**

* The specified `user` must exist.
* The `content` field must not be empty.

**Effects:**

* A new Source entity is created containing the provided text content.
* The ID of the new Source entity is returned.

**Request Body:**

```json
{
  "user": "ID",
  "content": "string"
}
```

**Success Response Body (Action):**

```json
{
  "source": "ID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/InsightMining/mineInsights

**Description:** Triggers the analysis of a source document to generate insights.

**Requirements:**

* The Source entity specified by `source` must exist.

**Effects:**

* The content of the source is processed to generate one or more Insight entities.
* Each new Insight is associated with the original source.
* Returns a list of the newly generated insight IDs.

**Request Body:**

```json
{
  "source": "ID"
}
```

**Success Response Body (Action):**

```json
{
  "insights": ["ID"]
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/InsightMining/\_getInsightsForSource

**Description:** Retrieves all insights that have been generated for a specific source document.

**Requirements:**

* The Source entity specified by `source` must exist.

**Effects:**

* Returns a list of all Insight entities associated with the given source.

**Request Body:**

```json
{
  "source": "ID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "insight": "ID",
    "insightText": "string"
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
