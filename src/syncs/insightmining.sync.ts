// import { actions, Sync } from "@engine";
// import { InsightMining, Requesting, Sessioning } from "@concepts";

// // --- Ingest Action Flow ---

// export const IngestRequest: Sync = (
//   { request, session, user, at, signals, metric, value },
// ) => ({
//   when: actions([
//     Requesting.request,
//     { path: "/InsightMining/ingest", session, at, signals, metric, value },
//     { request },
//   ]),
//   where: async (frames) => {
//     return await frames.query(Sessioning._getUser, { session }, { user });
//   },
//   then: actions([
//     InsightMining.ingest,
//     { owner: user, at, signals, metric, value },
//   ]),
// });

// export const IngestResponse: Sync = ({ request }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/ingest" }, { request }],
//     [InsightMining.ingest, {}, {}], // Success is an empty object
//   ),
//   then: actions([Requesting.respond, { request, status: "ok" }]),
// });

// // --- Analyze Action Flow ---

// export const AnalyzeRequest: Sync = ({ request, session, user, window }) => ({
//   when: actions([
//     Requesting.request,
//     { path: "/InsightMining/analyze", session, window },
//     { request },
//   ]),
//   where: async (frames) => {
//     return await frames.query(Sessioning._getUser, { session }, { user });
//   },
//   then: actions([InsightMining.analyze, { owner: user, window }]),
// });

// export const AnalyzeSuccessResponse: Sync = ({ request }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/analyze" }, { request }],
//     [InsightMining.analyze, {}, {}], // Success is an empty object
//   ),
//   then: actions([Requesting.respond, { request, status: "analysis complete" }]),
// });

// export const AnalyzeErrorResponse: Sync = ({ request, error }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/analyze" }, { request }],
//     [InsightMining.analyze, {}, { error }],
//   ),
//   then: actions([Requesting.respond, { request, error }]),
// });

// // --- Summarize Action Flow ---

// export const SummarizeRequest: Sync = ({ request, session, user, period }) => ({
//   when: actions([
//     Requesting.request,
//     { path: "/InsightMining/summarize", session, period },
//     { request },
//   ]),
//   where: async (frames) => {
//     return await frames.query(Sessioning._getUser, { session }, { user });
//   },
//   then: actions([InsightMining.summarize, { owner: user, period }]),
// });

// export const SummarizeSuccessResponse: Sync = ({ request, report }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/summarize" }, { request }],
//     [InsightMining.summarize, {}, { report }],
//   ),
//   then: actions([Requesting.respond, { request, report }]),
// });

// export const SummarizeErrorResponse: Sync = ({ request, error }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/summarize" }, { request }],
//     [InsightMining.summarize, {}, { error }],
//   ),
//   then: actions([Requesting.respond, { request, error }]),
// });

// // --- Deactivate Action Flow ---

// export const DeactivateRequest: Sync = (
//   { request, session, user, signals, metric },
// ) => ({
//   when: actions([
//     Requesting.request,
//     { path: "/InsightMining/deactivate", session, signals, metric },
//     { request },
//   ]),
//   where: async (frames) => {
//     return await frames.query(Sessioning._getUser, { session }, { user });
//   },
//   then: actions([
//     InsightMining.deactivate,
//     { requester: user, owner: user, signals, metric },
//   ]),
// });

// export const DeactivateSuccessResponse: Sync = ({ request }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/deactivate" }, { request }],
//     [InsightMining.deactivate, {}, {}], // Success is an empty object
//   ),
//   then: actions([Requesting.respond, { request, status: "ok" }]),
// });

// export const DeactivateErrorResponse: Sync = ({ request, error }) => ({
//   when: actions(
//     [Requesting.request, { path: "/InsightMining/deactivate" }, { request }],
//     [InsightMining.deactivate, {}, { error }],
//   ),
//   then: actions([Requesting.respond, { request, error }]),
// });
