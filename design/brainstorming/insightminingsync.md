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

# implement: Create the insightmining syncronizations using the concepts above. The only included/public actions are the following:
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
# file: src/syncs/insightMining.sync.ts
```typescript
import { actions, Sync } from "@engine";
import { InsightMining, Requesting, Sessioning } from "@concepts";

// --- Ingest Action Flow ---

export const IngestRequest: Sync = (
  { request, session, user, at, signals, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/insight-mining/ingest", session, at, signals, metric, value },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    InsightMining.ingest,
    { owner: user, at, signals, metric, value },
  ]),
});

export const IngestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/ingest" }, { request }],
    [InsightMining.ingest, {}, {}], // Success is an empty object
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

// --- Analyze Action Flow ---

export const AnalyzeRequest: Sync = ({ request, session, user, window }) => ({
  when: actions([
    Requesting.request,
    { path: "/insight-mining/analyze", session, window },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([InsightMining.analyze, { owner: user, window }]),
});

export const AnalyzeSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/analyze" }, { request }],
    [InsightMining.analyze, {}, {}], // Success is an empty object
  ),
  then: actions([Requesting.respond, { request, status: "analysis complete" }]),
});

export const AnalyzeErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/analyze" }, { request }],
    [InsightMining.analyze, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Summarize Action Flow ---

export const SummarizeRequest: Sync = ({ request, session, user, period }) => ({
  when: actions([
    Requesting.request,
    { path: "/insight-mining/summarize", session, period },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([InsightMining.summarize, { owner: user, period }]),
});

export const SummarizeSuccessResponse: Sync = ({ request, report }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/summarize" }, { request }],
    [InsightMining.summarize, {}, { report }],
  ),
  then: actions([Requesting.respond, { request, report }]),
});

export const SummarizeErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/summarize" }, { request }],
    [InsightMining.summarize, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Deactivate Action Flow ---

export const DeactivateRequest: Sync = (
  { request, session, user, signals, metric },
) => ({
  when: actions([
    Requesting.request,
    { path: "/insight-mining/deactivate", session, signals, metric },
    { request },
  ]),
  where: async (frames) => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([
    InsightMining.deactivate,
    { requester: user, owner: user, signals, metric },
  ]),
});

export const DeactivateSuccessResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/deactivate" }, { request }],
    [InsightMining.deactivate, {}, {}], // Success is an empty object
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const DeactivateErrorResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/insight-mining/deactivate" }, { request }],
    [InsightMining.deactivate, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```