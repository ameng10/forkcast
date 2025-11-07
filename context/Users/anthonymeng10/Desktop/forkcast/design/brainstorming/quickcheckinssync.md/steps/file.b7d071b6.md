---
timestamp: 'Fri Nov 07 2025 13:26:56 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_132656.6a76a792.md]]'
content_id: b7d071b6c55299e5f218b6dcac079e9c69c26718df52867414f12dc2754f0a15
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

/**
 * @sync RegisterRequest
 * @description Triggers user registration when a request is made to the public register endpoint.
 */
export const RegisterRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

/**
 * @sync RegisterResponseSuccess
 * @description Responds to a successful registration request with the new user's ID.
 */
export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions([Requesting.respond, { request, user }]),
});

/**
 * @sync RegisterResponseError
 * @description Responds to a failed registration request with an error message.
 */
export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * @sync LoginRequest
 * @description Triggers the login action when a request is made to the public login endpoint.
 */
export const LoginRequest: Sync = ({ request, username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    { request },
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

/**
 * @sync LoginSuccessCreateSession
 * @description Creates a new session when a user successfully logs in.
 */
export const LoginSuccessCreateSession: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

/**
 * @sync LoginResponseSuccess
 * @description Responds to a successful login request with the new session ID.
 */
export const LoginResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * @sync LoginResponseError
 * @description Responds to a failed login request with an error message.
 */
export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * @sync LogoutRequest
 * @description Triggers session deletion for a logout request.
 */
export const LogoutRequest: Sync = ({ request, session }) => ({
  when: actions([
    Requesting.request,
    { path: "/sessions/logout", session },
    { request },
  ]),
  then: actions([Sessioning.delete, { session }]),
});

/**
 * @sync LogoutResponseSuccess
 * @description Responds to a successful logout request.
 */
export const LogoutResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/sessions/logout" }, { request }],
    [Sessioning.delete, {}, {}], // Matches successful empty response from delete
  ),
  then: actions([Requesting.respond, { request, status: "logged_out" }]),
});

/**
 * @sync LogoutResponseError
 * @description Responds to a failed logout request with an error.
 */
export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/sessions/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
