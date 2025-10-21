---
timestamp: 'Tue Oct 21 2025 15:33:41 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_153341.a8a1070a.md]]'
content_id: be92c0b1d5fe12c959e8dc2cbb8d04057c50f9316991c05e8c5a3ce0103e8735
---

# API Specification: PersonalQA Concept

**Purpose:** *\[Purpose not provided in the input specification.]*

***

## API Endpoints

### POST /api/PersonalQA/ingestFact

**Description:** *\[Description not provided in the input specification.]*

**Requirements:**

* *\[Requirements not provided in the input specification.]*

**Effects:**

* *\[Effects not provided in the input specification.]*

**Request Body:**

```json
{
  // Specific arguments for 'ingestFact' are not provided in the input specification.
  // Example placeholder:
  // "userId": "string",
  // "factContent": "string"
}
```

**Success Response Body (Action):**

```json
{
  // Specific results for 'ingestFact' are not provided in the input specification.
  // If no specific result is returned, an empty object {} is expected.
  // Example placeholder:
  // "factId": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/forgetFact

**Description:** *\[Description not provided in the input specification.]*

**Requirements:**

* *\[Requirements not provided in the input specification.]*

**Effects:**

* *\[Effects not provided in the input specification.]*

**Request Body:**

```json
{
  // Specific arguments for 'forgetFact' are not provided in the input specification.
  // Example placeholder:
  // "factId": "string"
}
```

**Success Response Body (Action):**

```json
{
  // Specific results for 'forgetFact' are not provided in the input specification.
  // If no specific result is returned, an empty object {} is expected.
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/ask

**Description:** *\[Description not provided in the input specification.]*

**Requirements:**

* *\[Requirements not provided in the input specification.]*

**Effects:**

* *\[Effects not provided in the input specification.]*

**Request Body:**

```json
{
  // Specific arguments for 'ask' are not provided in the input specification.
  // Example placeholder:
  // "userId": "string",
  // "question": "string"
}
```

**Success Response Body (Action):**

```json
{
  // Specific results for 'ask' are not provided in the input specification.
  // Example placeholder:
  // "answer": "string"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/PersonalQA/\_getUserFacts

**Description:** *\[Description not provided in the input specification.]*

**Requirements:**

* *\[Requirements not provided in the input specification.]*

**Effects:**

* *\[Effects not provided in the input specification.]*

**Request Body:**

```json
{
  // Specific arguments for '_getUserFacts' are not provided in the input specification.
  // Example placeholder:
  // "userId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    // Specific results for '_getUserFacts' are not provided in the input specification.
    // Example placeholder:
    // "factId": "string",
    // "content": "string",
    // "timestamp": "number"
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

### POST /api/PersonalQA/\_getUserQAs

**Description:** *\[Description not provided in the input specification.]*

**Requirements:**

* *\[Requirements not provided in the input specification.]*

**Effects:**

* *\[Effects not provided in the input specification.]*

**Request Body:**

```json
{
  // Specific arguments for '_getUserQAs' are not provided in the input specification.
  // Example placeholder:
  // "userId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    // Specific results for '_getUserQAs' are not provided in the input specification.
    // Example placeholder:
    // "question": "string",
    // "answer": "string",
    // "timestamp": "number"
  }
]
```

**Error Response Body:**

```json
{
  "error": "string"
}
```
