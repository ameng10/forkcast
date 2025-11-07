---
timestamp: 'Fri Nov 07 2025 12:41:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_124152.0bf73b34.md]]'
content_id: 824b4badb8ea283098f06bb158644107d84b86daa23ad9f897778722f7769f3a
---

# file: src/syncs/app.sync.ts

```typescript
import { actions, Sync } from "@engine";
import {
  InsightMining,
  MealLog,
  PersonalQA,
  QuickCheckIns,
  Requesting,
  Sessioning,
  UserAuthentication,
} from "@concepts";

// =================================================================
// UserAuthentication and Sessioning Synchronizations
// =================================================================

// --- UserAuthentication.register ---
// This flow turns a register request into a register action, then creates a session,
// then responds with the session. This provides an "auto-login" feature on successful registration.

export const RegisterRequest: Sync = ({ username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/register", username, password },
    {},
  ]),
  then: actions([UserAuthentication.register, { username, password }]),
});

export const RegisterSuccessToSession: Sync = ({ user }) => ({
  when: actions([
    // This triggers whenever a user is successfully registered,
    // as part of a request flow for registration.
    Requesting.request,
    { path: "/UserAuthentication/register" },
    {},
  ], [
    UserAuthentication.register,
    {},
    { user },
  ]),
  then: actions([Sessioning.create, { user }]),
});

export const RegisterResponse: Sync = ({ request, session }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/register" },
      { request },
    ],
    // This sync waits for the Sessioning.create action that was triggered
    // by the successful registration within the same flow.
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

export const RegisterError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/register" },
      { request },
    ],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- UserAuthentication.login ---
// This flow is similar to register: a successful login creates a new session
// and returns the session ID to the client.

export const LoginRequest: Sync = ({ username, password }) => ({
  when: actions([
    Requesting.request,
    { path: "/UserAuthentication/login", username, password },
    {},
  ]),
  then: actions([UserAuthentication.login, { username, password }]),
});

export const LoginSuccessToSession: Sync = ({ user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, {}],
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions([Sessioning.create, { user }]),
});

export const LoginResponse: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions([Requesting.respond, { request, session }]),
});

export const LoginError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Sessioning.logout ---

export const LogoutRequest: Sync = ({ session }) => ({
  when: actions([
    Requesting.request,
    { path: "/Sessioning/logout", session },
    {},
  ]),
  // No `where` clause needed, Sessioning.logout will handle invalid sessions internally
  then: actions([Sessioning.logout, { session }]),
});

export const LogoutResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/logout" }, { request }],
    [Sessioning.logout, {}, {}], // Success is an empty object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const LogoutError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/Sessioning/logout" }, { request }],
    [Sessioning.logout, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// =================================================================
// MealLog Synchronizations
// =================================================================

// --- MealLog.submit ---

export const MealLogSubmitRequest: Sync = (
  { session, user, at, items, notes },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", session, at, items, notes },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    MealLog.submit,
    { owner: user, at, items, notes },
  ]),
});

export const MealLogSubmitResponse: Sync = ({ request, meal }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { meal }],
  ),
  then: actions([Requesting.respond, { request, meal }]),
});

export const MealLogSubmitError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- MealLog.edit ---

export const MealLogEditRequest: Sync = (
  { session, user, meal, at, items, notes },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", session, meal, at, items, notes },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    MealLog.edit,
    { caller: user, meal, at, items, notes },
  ]),
});

export const MealLogEditResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, {}], // Success is an empty object
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const MealLogEditError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- MealLog.delete ---

export const MealLogDeleteRequest: Sync = ({ session, user, meal }) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", session, meal },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([MealLog.delete, { caller: user, meal }]),
});

export const MealLogDeleteResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const MealLogDeleteError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- MealLog Queries ---

export const GetMealsByOwnerRequest: Sync = (
  { session, user, includeDeleted },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealsByOwner", session, includeDeleted },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    MealLog._getMealsByOwner,
    { owner: user, includeDeleted },
  ]),
});

export const GetMealsByOwnerResponse: Sync = ({ request, meals }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/MealLog/_getMealsByOwner" },
      { request },
    ],
    // The query returns an array of {meal: MealDoc} objects.
    // We bind the entire array to the 'meals' variable.
    [MealLog._getMealsByOwner, {}, { meal: meals }],
  ),
  then: actions([Requesting.respond, { request, meals }]),
});

// =================================================================
// QuickCheckIns Synchronizations
// =================================================================

// --- QuickCheckIns.record ---

export const QuickCheckInRecordRequest: Sync = (
  { session, user, at, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/record", session, at, metric, value },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    QuickCheckIns.record,
    { owner: user, at, metric, value },
  ]),
});

export const QuickCheckInRecordResponse: Sync = ({ request, checkIn }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/record" }, { request }],
    [QuickCheckIns.record, {}, { checkIn }],
  ),
  then: actions([Requesting.respond, { request, checkIn }]),
});

export const QuickCheckInRecordError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/record" }, { request }],
    [QuickCheckIns.record, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- QuickCheckIns.defineMetric ---

export const QuickCheckInDefineMetricRequest: Sync = ({ session, name }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/defineMetric", session, name },
    {},
  ]),
  where: async (frames) =>
    // Authorize the request, though user is not passed to the action
    await frames.query(Sessioning._getUser, { session }, {}),
  then: actions([QuickCheckIns.defineMetric, { name }]),
});

export const QuickCheckInDefineMetricResponse: Sync = (
  { request, metric },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/QuickCheckIns/defineMetric" },
      { request },
    ],
    [QuickCheckIns.defineMetric, {}, { metric }],
  ),
  then: actions([Requesting.respond, { request, metric }]),
});

export const QuickCheckInDefineMetricError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/QuickCheckIns/defineMetric" },
      { request },
    ],
    [QuickCheckIns.defineMetric, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// =================================================================
// PersonalQA Synchronizations
// =================================================================

// --- PersonalQA.ingestFact ---

export const PersonalQAIngestFactRequest: Sync = (
  { session, user, at, content, source },
) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/ingestFact", session, at, content, source },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    PersonalQA.ingestFact,
    { owner: user, at, content, source },
  ]),
});

export const PersonalQAIngestFactResponse: Sync = ({ request, fact }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/ingestFact" }, { request }],
    [PersonalQA.ingestFact, {}, { fact }],
  ),
  then: actions([Requesting.respond, { request, fact }]),
});

// --- PersonalQA.ask ---

export const PersonalQAAskRequest: Sync = ({ session, user, question }) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/ask", session, question },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.ask, { requester: user, question }]),
});

export const PersonalQAAskResponse: Sync = ({ request, qa }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/ask" }, { request }],
    [PersonalQA.ask, {}, { qa }],
  ),
  then: actions([Requesting.respond, { request, qa }]),
});

// --- PersonalQA.askLLM ---

export const PersonalQAAskLLMRequest: Sync = (
  { session, user, question, k },
) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/askLLM", session, question, k },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.askLLM, { requester: user, question, k }]),
});

export const PersonalQAAskLLMResponse: Sync = ({ request, qa }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/askLLM" }, { request }],
    [PersonalQA.askLLM, {}, { qa }],
  ),
  then: actions([Requesting.respond, { request, qa }]),
});

// =================================================================
// InsightMining Synchronizations
// =================================================================

// --- InsightMining.ingest ---

export const InsightMiningIngestRequest: Sync = (
  { session, user, at, signals, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/InsightMining/ingest", session, at, signals, metric, value },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    InsightMining.ingest,
    { owner: user, at, signals, metric, value },
  ]),
});

export const InsightMiningIngestResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/InsightMining/ingest" }, { request }],
    [InsightMining.ingest, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

// --- InsightMining.analyze ---

export const InsightMiningAnalyzeRequest: Sync = (
  { session, user, window },
) => ({
  when: actions([
    Requesting.request,
    { path: "/InsightMining/analyze", session, window },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([InsightMining.analyze, { owner: user, window }]),
});

export const InsightMiningAnalyzeResponse: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/InsightMining/analyze" }, { request }],
    [InsightMining.analyze, {}, {}],
  ),
  then: actions([Requesting.respond, { request, success: true }]),
});

export const InsightMiningAnalyzeError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/InsightMining/analyze" }, { request }],
    [InsightMining.analyze, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- InsightMining.summarize ---

export const InsightMiningSummarizeRequest: Sync = (
  { session, user, period },
) => ({
  when: actions([
    Requesting.request,
    { path: "/InsightMining/summarize", session, period },
    {},
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([InsightMining.summarize, { owner: user, period }]),
});

export const InsightMiningSummarizeResponse: Sync = ({ request, report }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/InsightMining/summarize" },
      { request },
    ],
    [InsightMining.summarize, {}, { report }],
  ),
  then: actions([Requesting.respond, { request, report }]),
});

export const InsightMiningSummarizeError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/InsightMining/summarize" },
      { request },
    ],
    [InsightMining.summarize, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});
```
