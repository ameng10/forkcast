---
timestamp: 'Fri Nov 07 2025 13:16:33 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_131633.b23240fc.md]]'
content_id: 877cfb3099fb395e20e7c3b4879304a38292aacd80436ebe4fa346fff5be806a
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

// --- Registration ---
// 1. A request to register triggers the registration action.
export const RegisterRequest: Sync = ({ username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    {},
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

// 2. The completion of the registration action (success or error) triggers a response.
export const RegisterResponse: Sync = ({ request, user, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user, error }],
  ),
  then: actions([Requesting.respond, { request, user, error }]),
});

// --- Login & Session Creation ---
// 1. A request to login triggers the login action.
export const LoginRequest: Sync = ({ username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    {},
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

// 2a. A successful login triggers the creation of a new session.
export const LoginSuccessCreatesSession: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

// 2b. A failed login triggers an immediate error response.
export const LoginErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// 3. The successful creation of a session triggers a response with the session ID.
export const CreateSessionResponse: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

// --- Logout (Session Deletion) ---
// 1. A request to logout (delete a session) triggers the delete action.
export const LogoutRequest: Sync = ({ session }) => ({
  when: actions([
    Requesting.request,
    { path: "/Sessioning/delete", session },
    {},
  ]),
  then: actions([Sessioning.delete, { session }]),
});

// 2. The completion of the delete action triggers a response.
export const LogoutResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete" }, { request }],
    // The output pattern is partial: it will match {} on success or {error: ...} on failure,
    // binding `error` only if it exists in the output frame.
    [Sessioning.delete, {}, { error }],
  ),
  then: actions([
    Requesting.respond,
    // Use a function to conditionally build the response parameters based on the frame's contents.
    ($) =>
      $[error]
        ? { request: $[request], error: $[error] }
        : { request: $[request], status: "logged_out" },
  ]),
});
```
