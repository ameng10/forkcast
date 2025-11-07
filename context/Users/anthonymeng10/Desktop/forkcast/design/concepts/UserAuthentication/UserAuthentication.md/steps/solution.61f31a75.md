---
timestamp: 'Fri Nov 07 2025 12:23:07 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_122307.f90ef133.md]]'
content_id: 61f31a75f4269313bc560936e4bdee97526fa258cc8d742ac4dba2c563d47b0b
---

# solution:

The decision to omit the `logout` action from the `UserAuthentication` concept is a deliberate design choice that adheres to the core principle of **Separation of Concerns** in concept design.

1. **Distinct Responsibilities**: User authentication and session management are two different concerns.
   * **Authentication** is the process of verifying who a user is. The `UserAuthentication` concept fulfills this by checking credentials (`login`) and creating identities (`register`). It is essentially stateless regarding a user's current "logged-in" status.
   * **Session Management** is the process of tracking a user's authenticated state over a period of time, usually via a session token. This is the concern that involves "logging in" (creating a session) and "logging out" (destroying a session).

2. **Concept Independence**: To maintain modularity and reusability, a concept should not depend on or conflate functionality from another. Placing `logout` in `UserAuthentication` would require it to manage session state, which is not its purpose.

3. **Correct Design**: The proper way to implement "signing out" in a concept-based architecture is to use a separate `Sessioning` concept.
   * A `Sessioning` concept would manage the lifecycle of sessions.
   * After a successful `UserAuthentication.login`, a synchronization would trigger a `Sessioning.createSession` action, which would generate a session token.
   * To "sign out," a client would call an action like `Sessioning.endSession`, which would invalidate the session token.

By keeping these concerns separate, both the `UserAuthentication` and `Sessioning` concepts remain simple, robust, and reusable across different applications.
