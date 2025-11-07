---
timestamp: 'Fri Nov 07 2025 01:42:59 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_014259.aca5f87a.md]]'
content_id: 393ac21ccfe69e3601cfacd92d67d2ddcdfe25ec221986e8a50768d0a1389302
---

# API Specification: InsightMining Concept

**Purpose:** To extract and store key insights from various sources of text.

***

## API Endpoints

### POST /api/InsightMining/createSource

**Description:** Creates a new source document from which insights can be mined.

**Requirements:**

* The `author` user must exist.
* The `name` must not be empty.

**Effects:**

* A new `Source` entity is created with the given `name` and `content`.
* The `Source` is associated with the `author`.
* The ID of the new `Source` is returned.

**Request Body:**

```json
{
  "author": "User",
  "name": "string",
  "content": "string"
}
```

**Success Response Body (Action):**

```json
{
  "source": "Source"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/InsightMining/addInsight

**Description:** Adds a new insight derived from a specific source.

**Requirements:**

* The `author` user must exist.
* The `source` must exist.
* The `text` must not be empty.

**Effects:**

* A new `Insight` entity is created with the given `text`.
* The `Insight` is associated with the `author` and the `source`.
* The ID of the new `Insight` is returned.

**Request Body:**

```json
{
  "author": "User",
  "source": "Source",
  "text": "string"
}
```

**Success Response Body (Action):**

```json
{
  "insight": "Insight"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/InsightMining/\_getInsightsBySource

**Description:** Retrieves all insights associated with a specific source document.

**Requirements:**

* The `source` entity must exist.

**Effects:**

* Returns a list of all `Insight` entities linked to the given `source`.

**Request Body:**

```json
{
  "source": "Source"
}
```

**Success Response Body (Query):**

```json
[
  {
    "insight": "Insight",
    "text": "string",
    "author": "User"
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
