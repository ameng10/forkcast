---
timestamp: 'Fri Nov 07 2025 13:26:56 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_132656.6a76a792.md]]'
content_id: 68461a0de2cc7532b24789576fc6685ef51490a82c12ed23cecd0effbd30c10d
---

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
