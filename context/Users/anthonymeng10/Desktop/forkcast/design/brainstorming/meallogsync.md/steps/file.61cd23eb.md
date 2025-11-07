---
timestamp: 'Fri Nov 07 2025 15:08:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_150814.e2d4e850.md]]'
content_id: 61cd23eb43f97cad8a0b69beb476019d483cfc830326b403032543f42d8e0cca
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

// --- Registration and Login Flow ---

// 1. A request to /register triggers the UserAuthentication.register action.
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

// 2. A request to /login triggers the UserAuthentication.login action.
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

// 3. A successful registration or login triggers session creation.
export const AuthenticationSuccessCreatesSession: Sync = ({ request, user }) => ({
  when: [
    actions(
      [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
      [UserAuthentication.register, {}, { user }],
    ),
    actions(
      [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
      [UserAuthentication.login, {}, { user }],
    ),
  ],
  then: actions([Sessioning.create, { user }]),
});

// 4. A successful session creation responds to the original request with the session ID.
export const SessionCreationResponse: Sync = ({ request, session }) => ({
  when: [
    actions(
      [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
      [Sessioning.create, {}, { session }],
    ),
    actions(
      [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
      [Sessioning.create, {}, { session }],
    ),
  ],
  then: actions([Requesting.respond, { request, session }]),
});

// 5. An unsuccessful registration or login responds with an error.
export const AuthenticationFailureResponse: Sync = ({ request, error }) => ({
  when: [
    actions(
      [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
      [UserAuthentication.register, {}, { error }],
    ),
    actions(
      [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
      [UserAuthentication.login, {}, { error }],
    ),
  ],
  then: actions([Requesting.respond, { request, error }]),
});

// --- Logout Flow ---

// 6. A request to /Sessioning/delete (our logout endpoint) triggers the Sessioning.delete action.
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/Sessioning/delete", session },
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

// 7. A successful session deletion responds with a success status.
export const LogoutSuccessResponse: Sync = ({ request, status }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete" }, { request }],
    [Sessioning.delete, {}, {}], // Match successful deletion (empty output)
  ),
  where: (frames) => frames.map((frame) => ({ ...frame, [status]: "logged_out" })),
  then: actions([Requesting.respond, { request, status }]),
});

// 8. A failed session deletion responds with an error.
export const LogoutFailureResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/delete" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
