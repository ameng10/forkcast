---
timestamp: 'Fri Nov 07 2025 12:41:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_124152.0bf73b34.md]]'
content_id: da269bb464619a738840f975392016767a3bb1a31d90f2e43ef9a9b619b2e21b
---

# concept: Sessioning \[User, Session]

* **purpose**: To maintain a user's logged-in state across multiple requests without re-sending credentials.
* **principle**: After a user is authenticated, a session is created for them. Subsequent requests using that session's ID are treated as being performed by that user, until the session is logged out (deleted).
* **state**:
  * a set of `Session`s with
    * a `user` User
* **actions**:
  * `create (user: User): (session: Session)`
    * **requires**: true.
    * **effects**: creates a new Session `s`; associates it with the given `user`; returns `s` as `session`.
  * `delete (session: Session): ()`
    * **requires**: the given `session` exists.
    * **effects**: removes the session `s`.
  * `logout (session: Session): ()`
    * **requires**: the given `session` exists.
    * **effects**: removes the session `s`. (Alias for delete).
* **queries**:
  * `_getUser (session: Session): (user: User)`
    * **requires**: the given `session` exists.
    * **effects**: returns the user associated with the session.
