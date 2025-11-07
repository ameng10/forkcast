---
timestamp: 'Fri Nov 07 2025 13:12:06 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_131206.ab2dbd80.md]]'
content_id: 9ebb25d291ad1c776d7fcb4d89656fd7ef696c4cfe15fcfb277e8937707cdfea
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

// --- Registration Flow ---

/**
 * When a request is made to the register endpoint, trigger the UserAuthentication.register action.
 */
export const HandleRegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

/**
 * When registration is successful (returning a user), create a new session for that user.
 */
export const CreateSessionOnRegister: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * When a session is created following a registration, respond to the original request with the session ID.
 */
export const RespondWithSessionOnRegister: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * If the registration action fails (returning an error), respond to the original request with the error.
 */
export const RespondOnRegisterError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Login Flow ---

/**
 * When a request is made to the login endpoint, trigger the UserAuthentication.login action.
 */
export const HandleLoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

/**
 * When login is successful (returning a user), create a new session for that user.
 */
export const CreateSessionOnLogin: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * When a session is created following a login, respond to the original request with the session ID.
 */
export const RespondWithSessionOnLogin: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * If the login action fails (returning an error), respond to the original request with the error.
 */
export const RespondOnLoginError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Logout Flow ---

/**
 * When a request is made to the /logout endpoint with a session, trigger the Sessioning.delete action.
 * This provides a logout mechanism without requiring an explicit logout action in any concept.
 */
export const HandleLogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/logout", session },
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

/**
 * When a session is successfully deleted (returns an empty object), respond to the original logout request with a success status.
 */
export const RespondOnLogoutSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, {}], // Match the success case (empty object output)
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});

/**
 * If deleting the session fails (e.g., session not found), respond to the original logout request with the error.
 */
export const RespondOnLogoutError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, { error }], // Match the error case
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
