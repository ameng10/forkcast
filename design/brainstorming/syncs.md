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

# implement: Create syncronizations for the concepts above. Use the syncs-example on how to logout without an explicit action. The only included/public actions are the following:
"/api/UserAuthentication/register": "public endpoint to create account",
  "/api/UserAuthentication/login": "public endpoint to start session",

# response:

# response:

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
