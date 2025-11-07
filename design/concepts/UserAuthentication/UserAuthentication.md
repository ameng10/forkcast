[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-state](../../background/detailed/concept-state.md)


[@sync-background](../../tools/sync-background.md)

# implement: Update the UserAuthentication concept specification based on the below concept. The UserAuthentication concept should allow a user to sign in and sign out. If i need a logout action, add it.


# concept: UserAuthentication [User]

*   **purpose**: To securely verify a user's identity based on credentials.
*   **principle**: If you register with a unique username and a password, and later provide the same credentials to log in, you will be successfully identified as that user.
*   **state**:
    *   a set of `User`s with
        *   a `username` String (unique)
        *   a `passwordHash` String
*   **actions**:
    *   `register (username: String, password: String): (user: User)`
        *   **requires**: no User exists with the given `username`.
        *   **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`.
    *   `register (username: String, password: String): (error: String)`
        *   **requires**: a User already exists with the given `username`.
        *   **effects**: returns an error message.
    *   `login (username: String, password: String): (user: User)`
        *   **requires**: a User exists with the given `username` and the `password` matches their `passwordHash`.
        *   **effects**: returns the matching User `u` as `user`.
    *   `login (username: String, password: String): (error: String)`
        *   **requires**: no User exists with the given `username` or the `password` does not match.
        *   **effects**: returns an error message.
*   **queries**:
    *   `_getUserByUsername (username: String): (user: User)`
        *   **requires**: a User with the given `username` exists.
        *   **effects**: returns the corresponding User.

# response:
