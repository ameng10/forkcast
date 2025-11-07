---
timestamp: 'Fri Nov 07 2025 13:32:40 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_133240.dd3cbf54.md]]'
content_id: 77b7d3c381e32ed98a72775f7987e7c3526ddab118c46128f723cc4fd77833a7
---

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
