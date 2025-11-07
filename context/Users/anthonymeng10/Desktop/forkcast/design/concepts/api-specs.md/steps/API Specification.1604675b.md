---
timestamp: 'Fri Nov 07 2025 12:28:03 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_122803.72421663.md]]'
content_id: 1604675b95e87569f895e53acca03b890f92e49c541006ce0b87fef7cb3160ca
---

# API Specification: UserAuthentication Concept

**Purpose:** To securely verify a user's identity based on credentials.

***

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Creates a new user account with a unique username and password.

**Requirements:**

* No user exists with the given `username`.

**Effects:**

* Creates a new User `u`.
* Sets the new user's `username` and a hash of their `password`.
* Returns the ID of the new user `u` as `user`.
* If a user with the given `username` already exists, returns an error message.

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

**Description:** Authenticates a user with their username and password.

**Requirements:**

* A user exists with the given `username`.
* The provided `password` matches the user's stored password hash.

**Effects:**

* Returns the matching user's ID.
* If no user exists with the `username` or the `password` does not match, returns an error message.

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

### POST /api/UserAuthentication/\_getUserByUsername

**Description:** Retrieves a user's ID by their username.

**Requirements:**

* A user with the given `username` must exist.

**Effects:**

* Returns the corresponding user's ID.

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
