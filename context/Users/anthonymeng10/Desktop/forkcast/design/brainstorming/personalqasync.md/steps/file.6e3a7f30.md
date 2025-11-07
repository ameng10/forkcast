---
timestamp: 'Fri Nov 07 2025 13:29:30 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_132930.1f13c6c7.md]]'
content_id: 6e3a7f307394bc64ac03c902aa88b36b26cb615c4809d9324245046af2271a55
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

/**
 * After a user successfully logs in, create a session for them.
 */
export const LoginFlow: Sync = ({ user }) => ({
  when: actions(
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions(
    [Sessioning.create, { user }],
  ),
});

/**
 * When a session is successfully created as part of a login flow,
 * respond to the original login request with the session ID.
 */
export const LoginResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions(
    [Requesting.respond, { request, session }],
  ),
});

/**
 * If a login attempt fails, respond to the original request with the error.
 */
export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

/**
 * If a registration attempt is successful, respond with the new user's ID.
 */
export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions(
    [Requesting.respond, { request, user }],
  ),
});

/**
 * If a registration attempt fails (e.g., username taken), respond with the error.
 */
export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/register" },
      { request },
    ],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

/**
 * When a user requests to log out, delete their session.
 */
export const LogoutRequest: Sync = ({ session }) => ({
  when: actions(
    [Requesting.request, { path: "/logout", session }, {}],
  ),
  then: actions(
    [Sessioning.delete, { session }],
  ),
});

/**
 * After a session is successfully deleted for logout, confirm with a response.
 */
export const LogoutResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions(
    [Requesting.respond, { request, status: "logged_out" }],
  ),
});

/**
 * If a logout request is made with an invalid session, respond with an error.
 */
export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});
```
