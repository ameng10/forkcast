---
timestamp: 'Fri Nov 07 2025 13:31:20 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_133120.e9d9a6b0.md]]'
content_id: 63984f3c9f9056cb8e16e51f2404bec98b97444937baa13192d7cf1561e3b556
---

# concept: Sessioning \[User, Session]

* **purpose**: To maintain a user's logged-in state across multiple requests without re-sending credentials.
* **principle**: After a user is authenticated, a session is created for them. Subsequent requests using that session's ID are treated as being performed by that user, until the session is deleted (logout).
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
* **queries**:
  * `_getUser (session: Session): (user: User)`
    * **requires**: the given `session` exists.
    * **effects**: returns the user associated with the session.

@[syncs-example](syncs-example.md)
