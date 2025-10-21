---
timestamp: 'Tue Oct 21 2025 15:29:29 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251021_152929.4780128b.md]]'
content_id: 567f0781ba600e0c08cbe57fa2779bcb7773f9caab5d280073b557eb824c9b03
---

# API Specification: SwapSuggestions Concept

**Purpose:** provide suggestions for item swaps based on user preferences and availability.

***

## API Endpoints

### POST /api/SwapSuggestions/registerSwapPreference

**Description:** Registers a user's preference for a specific item they own to be swapped for a desired item type.

**Requirements:**

* `userId` exists, `itemId` is owned by `userId`

**Effects:**

* registers a new swap preference for `userId` for `itemId` wanting `desiredItemType`

**Request Body:**

```json
{
  "userId": "string",
  "itemId": "string",
  "desiredItemType": "string"
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

### POST /api/SwapSuggestions/acceptSwapSuggestion

**Description:** Marks a given swap suggestion as accepted by the user.

**Requirements:**

* `suggestionId` exists and is for `userId`

**Effects:**

* marks the `suggestionId` as accepted by `userId`, potentially triggering further actions, returns `true` on success

**Request Body:**

```json
{
  "userId": "string",
  "suggestionId": "string"
}
```

**Success Response Body (Action):**

```json
{
  "success": "boolean"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/SwapSuggestions/declineSwapSuggestion

**Description:** Marks a given swap suggestion as declined by the user.

**Requirements:**

* `suggestionId` exists and is for `userId`

**Effects:**

* marks the `suggestionId` as declined by `userId`

**Request Body:**

```json
{
  "userId": "string",
  "suggestionId": "string"
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

### POST /api/SwapSuggestions/\_getSwapSuggestions

**Description:** Retrieves all active swap suggestions for a specific user.

**Requirements:**

* `userId` exists

**Effects:**

* returns all active swap suggestions for `userId`

**Request Body:**

```json
{
  "userId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "id": "string",
    "offerItem": "string",
    "requestItemType": "string",
    "generatedAt": "number"
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

### POST /api/SwapSuggestions/\_getRegisteredPreferences

**Description:** Retrieves all swap preferences registered by a specific user.

**Requirements:**

* `userId` exists

**Effects:**

* returns all swap preferences registered by `userId`

**Request Body:**

```json
{
  "userId": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "itemId": "string",
    "desiredType": "string"
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
