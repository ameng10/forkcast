---
timestamp: 'Fri Nov 07 2025 13:32:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_133240.dd3cbf54.md]]'
content_id: 884dc9a66bd8a338a4c9c78fb1e61b10fab883cbfb0b3a2e7fd4259903fc115a
---

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

// --- Registration Flow ---

/**
 * When a request is made to register, trigger the UserAuthentication.register action.
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
 * When a user is successfully registered, automatically create a new session for them.
 */
export const CreateSessionOnRegister: Sync = ({ user }) => ({
  when: actions([UserAuthentication.register, {}, { user }]),
  then: actions([Sessioning.create, { user }]),
});

/**
 * When a session is created as part of the registration flow, respond to the
 * original request with the new session ID.
 */
export const RegisterSuccessResponse: Sync = ({ request, session }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/register" },
      { request },
    ],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * If the registration action fails, respond to the original request with the error.
 */
export const RegisterErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Login Flow ---

/**
 * When a request is made to log in, trigger the UserAuthentication.login action.
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
 * When a user successfully logs in, create a new session for them.
 */
export const CreateSessionOnLogin: Sync = ({ user }) => ({
  when: actions([UserAuthentication.login, {}, { user }]),
  then: actions([Sessioning.create, { user }]),
});

/**
 * When a session is created as part of the login flow, respond to the
 * original request with the new session ID.
 */
export const LoginSuccessResponse: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

/**
 * If the login action fails, respond to the original request with the error.
 */
export const LoginErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
