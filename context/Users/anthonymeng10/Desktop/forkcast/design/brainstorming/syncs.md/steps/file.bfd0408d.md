---
timestamp: 'Fri Nov 07 2025 11:48:32 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_114832.a1f502d2.md]]'
content_id: bfd0408d51659f343f300e4a1d2476e239b903e063ca30ddca693c7785730dd9
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
} from "@concepts";

// =================================================================
// Note on Authentication
// =================================================================
// The synchronizations below assume a common authorization pattern:
// 1. A client authenticates via a passthrough route (e.g., /api/UserAuthentication/login).
// 2. The client uses the returned user ID to create a session via another passthrough route
//    (e.g., /api/Sessioning/createSession), receiving a session ID.
// 3. For all subsequent requests handled by these synchronizations, the client includes the
//    session ID.
// 4. Each request sync uses a `where` clause to query `Sessioning._getUser` to verify
//    the session and retrieve the authenticated user ID, which is then used to authorize
//    and perform the requested action.
// =================================================================

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
