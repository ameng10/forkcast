---
timestamp: 'Fri Nov 07 2025 16:08:53 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_160853.e8729cb5.md]]'
content_id: e4b9b046df7086c6ccfcfb10ea9263bfc03d0d95c17c792dd2a418dcec071d6d
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

import { actions, Sync } from "@engine";
import { Requesting, UserAuthentication, Sessioning } from "@concepts";

//-- User Registration --//
export const RegisterRequest: Sync = ({ request, username, password }) => ({
when: actions(\[Requesting.request, { path: "/UserAuthentication/register", username, password }, { request }]),
then: actions(\[UserAuthentication.register, { username, password }]),
});

export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
when: actions(
\[Requesting.request, { path: "/UserAuthentication/register" }, { request }],
\[UserAuthentication.register, {}, { user }],
),
then: actions(\[Requesting.respond, { request, user }]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
when: actions(
\[Requesting.request, { path: "/UserAuthentication/register" }, { request }],
\[UserAuthentication.register, {}, { error }],
),
then: actions(\[Requesting.respond, { request, error }]),
});

//-- User Login & Session Creation --//
export const LoginRequest: Sync = ({ request, username, password }) => ({
when: actions(\[Requesting.request, { path: "/login", username, password }, { request }]),
then: actions(\[UserAuthentication.login, { username, password }]),
});

export const LoginSuccessCreatesSession: Sync = ({ user }) => ({
when: actions(\[UserAuthentication.login, {}, { user }]),
then: actions(\[Sessioning.create, { user }]),
});

export const LoginResponseSuccess: Sync = ({ request, user, session }) => ({
when: actions(
\[Requesting.request, { path: "/login" }, { request }],
\[UserAuthentication.login, {}, { user }],
\[Sessioning.create, { user }, { session }],
),
then: actions(\[Requesting.respond, { request, session }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
when: actions(
\[Requesting.request, { path: "/login" }, { request }],
\[UserAuthentication.login, {}, { error }]
),
then: actions(\[Requesting.respond, { request, error }]),
});

//-- User Logout --//
export const LogoutRequest: Sync = ({ request, session, user }) => ({
when: actions(\[Requesting.request, { path: "/logout", session }, { request }]),
where: (frames) => frames.query(Sessioning.\_getUser, { session }, { user }),
then: actions(\[Sessioning.delete, { session }]),
});

export const LogoutResponse: Sync = ({ request }) => ({
when: actions(
\[Requesting.request, { path: "/logout" }, { request }],
\[Sessioning.delete, {}, {}],
),
then: actions(\[Requesting.respond, { request, status: "logged\_out" }]),
});

import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

//-- User Registration --//
export const RegisterRequest: Sync = ({ request, username, password }) => ({
when: actions(\[Requesting.request, {
path: "/UserAuthentication/register",
username,
password,
}, { request }]),
then: actions(\[UserAuthentication.register, { username, password }]),
});

export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
when: actions(
\[Requesting.request, { path: "/UserAuthentication/register" }, { request }],
\[UserAuthentication.register, {}, { user }],
),
then: actions(\[Requesting.respond, { request, user }]),
});

export const RegisterResponseError: Sync = ({ request, error }) => ({
when: actions(
\[Requesting.request, { path: "/UserAuthentication/register" }, { request }],
\[UserAuthentication.register, {}, { error }],
),
then: actions(\[Requesting.respond, { request, error }]),
});

//-- User Login & Session Creation --//
export const LoginRequest: Sync = ({ request, username, password }) => ({
when: actions(\[Requesting.request, {
path: "/UserAuthentication/login",
username,
password,
}, { request }]),
then: actions(\[UserAuthentication.login, { username, password }]),
});

export const LoginSuccessCreatesSession: Sync = ({ user }) => ({
when: actions(\[UserAuthentication.login, {}, { user }]),
then: actions(\[Sessioning.create, { user }]),
});

export const LoginResponseSuccess: Sync = ({ request, user, session }) => ({
when: actions(
\[Requesting.request, { path: "/UserAuthentication/login" }, { request }],
\[UserAuthentication.login, {}, { user }],
\[Sessioning.create, { user }, { session }],
),
then: actions(\[Requesting.respond, { request, session, user }]),
});

export const LoginResponseError: Sync = ({ request, error }) => ({
when: actions(
\[Requesting.request, { path: "/UserAuthentication/login" }, { request }],
\[UserAuthentication.login, {}, { error }],
),
then: actions(\[Requesting.respond, { request, error }]),
});

//-- User Logout --//
export const LogoutRequest: Sync = ({ request, session, user }) => ({
when: actions(\[Requesting.request, { path: "/logout", session }, {
request,
}]),
where: (frames) => frames.query(Sessioning.\_getUser, { session }, { user }),
then: actions(\[Sessioning.delete, { session }]),
});

export const LogoutResponse: Sync = ({ request }) => ({
when: actions(
\[Requesting.request, { path: "/logout" }, { request }],
\[Sessioning.delete, {}, {}],
),
then: actions(\[Requesting.respond, { request, status: "logged\_out" }]),
});

//-- Session Validation (frontend may poll /Sessioning/\_getUser) --//
export const SessionValidationSuccess: Sync = (
{ request, session, user },
) => ({
when: actions(\[
Requesting.request,
{ path: "/Sessioning/\_getUser", session },
{ request },
]),
where: (frames) => frames.query(Sessioning.\_getUser, { session }, { user }),
then: actions(\[Requesting.respond, { request, user }]),
});

export const SessionValidationError: Sync = (
{ request, session, error },
) => ({
when: actions(\[
Requesting.request,
{ path: "/Sessioning/\_getUser", session },
{ request },
]),
where: (frames) => frames.query(Sessioning.\_getUser, { session }, { error }),
then: actions(\[Requesting.respond, { request, error }]),
});
