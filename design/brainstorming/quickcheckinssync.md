[@implementing-synchronizations](../background/implementing-synchronizations.md)

[@sync-background](../tools/sync-background.md)

[@concept-background](../tools/concept-background.md)


[@UserAuthenticationImplementation](../concepts/UserAuthentication/UserAuthenticationImplementation.md)

[@UserAuthentication](../concepts/UserAuthentication/UserAuthentication.md)

[@QuickCheckInsImplementation](../concepts/QuickCheckIns/QuickCheckInsImplementation.md)

[@QuickCheckIns](../concepts/QuickCheckIns/QuickCheckIns.md)

[@PersonalQAImplementation](../concepts/PersonalQA/PersonalQAImplementation.md)

[@PersonalQA](../concepts/PersonalQA/PersonalQA.md)

[@MealLogImplementation](../concepts/MealLog/MealLogImplementation.md)

[@MealLog](../concepts/MealLog/MealLog.md)

[@InsightMiningImplementation](../concepts/InsightMining/InsightMiningImplementation.md)

[@InsightMining](../concepts/InsightMining/InsightMining.md)

[@implementation](../concepts/Sessioning/implementation.md)

[@Sessioning](../concepts/Sessioning/Sessioning.md)

@[syncs-example](syncs-example.md)

# implement: Create the quickcheckins syncronizations using the concepts above. The only included/public actions are the following:
"/api/UserAuthentication/register": "public endpoint to create account",
  "/api/UserAuthentication/login": "public endpoint to start session",

# response:

# response:

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

# file: src/syncs/quickcheckins.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { QuickCheckIns, Requesting, Sessioning } from "@concepts";

const AUTH_ERROR = "Authentication failed: Invalid or expired session.";

// --- Record a Check-In ---

export const RecordCheckInRequest: Sync = (
  { request, session, user, at, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/record", session, at, metric, value },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([QuickCheckIns.record, { owner: user, at, metric, value }]),
});

export const RecordCheckInResponseSuccess: Sync = ({ request, checkIn }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/record" }, { request }],
    [QuickCheckIns.record, {}, { checkIn }],
  ),
  then: actions([Requesting.respond, { request, checkIn }]),
});

export const RecordCheckInResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/record" }, { request }],
    [QuickCheckIns.record, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const RecordCheckInAuthFailure: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/record", session },
    { request },
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    return userFrames.length === 0 ? frames : new Frames();
  },
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Define a Metric ---

export const DefineMetricRequest: Sync = ({ request, session, user, name }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/defineMetric", session, name },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([QuickCheckIns.defineMetric, { name }]),
});

export const DefineMetricResponseSuccess: Sync = ({ request, metric }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/defineMetric" }, { request }],
    [QuickCheckIns.defineMetric, {}, { metric }],
  ),
  then: actions([Requesting.respond, { request, metric }]),
});

export const DefineMetricResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/defineMetric" }, { request }],
    [QuickCheckIns.defineMetric, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DefineMetricAuthFailure: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/defineMetric", session },
    { request },
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    return userFrames.length === 0 ? frames : new Frames();
  },
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Edit a Check-In ---

export const EditCheckInRequest: Sync = (
  { request, session, user, checkIn, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/edit", session, checkIn, metric, value },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([QuickCheckIns.edit, { owner: user, checkIn, metric, value }]),
});

export const EditCheckInResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/edit" }, { request }],
    [QuickCheckIns.edit, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const EditCheckInResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/edit" }, { request }],
    [QuickCheckIns.edit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const EditCheckInAuthFailure: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/edit", session },
    { request },
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    return userFrames.length === 0 ? frames : new Frames();
  },
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Delete a Check-In ---

export const DeleteCheckInRequest: Sync = (
  { request, session, user, checkIn },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/delete", session, checkIn },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([QuickCheckIns.delete, { owner: user, checkIn }]),
});

export const DeleteCheckInResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/delete" }, { request }],
    [QuickCheckIns.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const DeleteCheckInResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/delete" }, { request }],
    [QuickCheckIns.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeleteCheckInAuthFailure: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/delete", session },
    { request },
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    return userFrames.length === 0 ? frames : new Frames();
  },
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Delete a Metric ---

export const DeleteMetricRequest: Sync = (
  { request, session, user, metric },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/deleteMetric", session, metric },
    { request },
  ]),
  where: async (frames) => frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([QuickCheckIns.deleteMetric, { metric }]),
});

export const DeleteMetricResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/deleteMetric" }, { request }],
    [QuickCheckIns.deleteMetric, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const DeleteMetricResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/deleteMetric" }, { request }],
    [QuickCheckIns.deleteMetric, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

export const DeleteMetricAuthFailure: Sync = ({ request, session, user }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/deleteMetric", session },
    { request },
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    return userFrames.length === 0 ? frames : new Frames();
  },
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});
```