---
timestamp: 'Fri Nov 07 2025 01:53:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_015314.8219baf1.md]]'
content_id: 672df3afcefe3b69fed165d81a7f886e8d91fe3eb385e550dd91b21ee2cab304
---

# API Specification: InsightMining Concept

**Purpose:** To analyze a collection of text documents to extract and surface key themes or insights.

***

## API Endpoints

### POST /api/InsightMining/addDocument

**Description:** Adds a new text document to the collection for future analysis.

**Requirements:**

* The `text` field must not be empty.

**Effects:**

* A new document is stored with its text and an optional source.
* Returns the unique ID of the newly created document.

**Request Body:**

```json
{
  "text": "string",
  "source": "string"
}
```

**Success Response Body (Action):**

```json
{
  "docId": "string"
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

**Description:** Processes all stored documents to identify and generate a list of key insights.

**Requirements:**

* At least one document must exist in the collection.

**Effects:**

* Analyzes the entire corpus of documents.
* Stores the generated insights in the database.
* Returns an array of the newly generated insight strings.

**Request Body:**

```json
{}
```

**Success Response Body (Action):**

```json
{
  "insights": ["string"]
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

**Description:** Retrieves all insights that have been previously generated.

**Requirements:**

* The `generateInsights` action must have been successfully run at least once.

**Effects:**

* Fetches all stored insight records.
* Returns an array of insight objects.

**Request Body:**

```json
{}
```

**Success Response Body (Query):**

```json
[
  {
    "insightId": "string",
    "insight": "string"
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
