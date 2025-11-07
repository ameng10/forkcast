---
timestamp: 'Fri Nov 07 2025 11:13:26 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_111326.40406fb8.md]]'
content_id: 47ffa44c859821c3efcf5eadeca935ffd4209e565c6e9c57f838c87aaede7498
---

# API Specification: UserAuthentication Concept

**Purpose:** To manage user accounts and sessions, including registration, login, and logout.

***

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Creates a new user account with a username and password.

**Requirements:**

* A user with the given `username` must not already exist.

**Effects:**

* A new user is created with the provided credentials.
* Returns the ID of the newly created user.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "UserID"
}
```

**Error Response Body:**

```json
{
  "error": "string"
}
```

***

### POST /api/UserAuthentication/login

**Description:** Authenticates a user and starts a new session.

**Requirements:**

* A user with the given `username` must exist.
* The provided `password` must match the user's stored password.

**Effects:**

* Creates a new session for the authenticated user.
* Returns the user's ID and the new session ID.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response Body (Action):**

```json
{
  "user": "UserID",
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

### POST /api/UserAuthentication/logout

**Description:** Ends a user's session, logging them out.

**Requirements:**

* The `session` ID must correspond to an active session.

**Effects:**

* The specified session is invalidated and removed.

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

### POST /api/UserAuthentication/\_isLoggedIn

**Description:** Checks if a session ID is currently active and valid.

**Requirements:**

* The `session` ID must be provided.

**Effects:**

* Returns the user ID associated with the session if it is active.

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

### POST /api/UserAuthentication/\_getUserByUsername

**Description:** Retrieves a user's information by their username.

**Requirements:**

* A user with the given `username` must exist.

**Effects:**

* Returns the user record matching the username.

**Request Body:**

```json
{
  "username": "string"
}
```

**Success Response Body (Query):**

```json
[
  {
    "_id": "UserID",
    "username": "string"
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
