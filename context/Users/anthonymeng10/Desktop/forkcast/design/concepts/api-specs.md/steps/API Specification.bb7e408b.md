---
timestamp: 'Fri Nov 07 2025 12:28:03 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_122803.72421663.md]]'
content_id: bb7e408b45b05468f924ab6d512aee8c04766364cf11543dd75fb8b0258f5c2e
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

***

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session for an authenticated user.

**Requirements:**

* A valid `user` ID must be provided.

**Effects:**

* Creates a new session `s`.
* Associates the new session with the given `user`.
* Returns the new session ID `s` as `session`.

**Request Body:**

```json
{
  "user": "UserID"
}
```

**Success Response Body (Action):**

```json
{
  "session": "SessionID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/Sessioning/delete

**Description:** Deletes a session, effectively logging a user out.

**Requirements:**

* The given `session` ID must exist.

**Effects:**

* Removes the specified session `s`.

**Request Body:**

```json
{
  "session": "SessionID"
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

### POST /api/Sessioning/\_getUser

**Description:** Retrieves the user associated with a given session.

**Requirements:**

* The given `session` ID must exist.

**Effects:**

* Returns the user ID associated with the session.

**Request Body:**

```json
{
  "session": "SessionID"
}
```

**Success Response Body (Query):**

```json
[
  {
    "user": "UserID"
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
