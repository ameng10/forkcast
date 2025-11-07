---
timestamp: 'Fri Nov 07 2025 12:11:43 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_121143.b605465c.md]]'
content_id: e99828cb06d2967a908f5eea526760668516b4aea137697eab0cb55ad793eaa8
---

# API Specification: Sessioning Concept

**Purpose:** To maintain a user's logged-in state across multiple requests without re-sending credentials.

***

## API Endpoints

### POST /api/Sessioning/create

**Description:** Creates a new session associated with a given user.

**Requirements:**

* None.

**Effects:**

* Creates a new Session `s`.
* Associates the new session with the given `user`.
* Returns `s` as `session`.

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

**Description:** Deletes an existing session, effectively logging a user out.

**Requirements:**

* The given `session` must exist.

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

* The given `session` must exist.

**Effects:**

* Returns the user associated with the session.

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
