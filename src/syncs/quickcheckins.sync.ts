import { actions, Frames, Sync } from "@engine";
import { QuickCheckIns, Requesting, Sessioning } from "@concepts";

const AUTH_ERROR = "Authentication failed: Invalid or expired session.";
const buildListResponse = (
  frames: Frames,
  listSymbol: symbol,
  entries: Iterable<unknown>,
) => {
  const baseFrame = frames[0] ?? {};
  const asArray = Array.isArray(entries) ? entries : Array.from(entries);
  return new Frames({ ...baseFrame, [listSymbol]: asArray });
};

const collectCheckIns = (
  { owner, checkIns }: { owner: symbol; checkIns: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  if (frames.length === 0) return frames;
  const ownerValue = frames[0][owner];
  if (ownerValue === undefined) return new Frames();
  const docs = await QuickCheckIns._listCheckInsByOwner({ owner: ownerValue });
  return buildListResponse(frames, checkIns, docs);
};

const collectMetrics = (
  { owner, metrics }: { owner: symbol; metrics: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  if (frames.length === 0) return frames;
  const ownerValue = frames[0][owner];
  if (ownerValue === undefined) return new Frames();
  const docs = await QuickCheckIns._listMetricsForOwner({ owner: ownerValue });
  return buildListResponse(frames, metrics, docs);
};

const ensureSession = (
  { session, user }: { session: symbol; user: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  frames = await frames.query(Sessioning._getUser, { session }, { user });
  return frames.filter(($) => $[user] !== undefined);
};

const sessionFailure = (
  { session, error }: { session: symbol; error: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  frames = await frames.query(Sessioning._getUser, { session }, { error });
  return frames.filter(($) => $[error] !== undefined);
};

// --- Record a Check-In ---

export const RecordCheckInRequest: Sync = (
  { request, session, user, at, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/record", session, at, metric, value },
    { request },
  ]),
  where: async (frames) => await ensureSession({ session, user })(frames),
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
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    return userFrames.length === 0 ? frames : new Frames();
  },
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Define a Metric ---

export const DefineMetricRequest: Sync = (
  { request, session, user, name },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/defineMetric", session, name },
    { request },
  ]),
  where: async (frames) => await ensureSession({ session, user })(frames),
  then: actions([QuickCheckIns.defineMetric, { owner: user, name }]),
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

export const DefineMetricAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/defineMetric", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Edit a Check-In ---

export const EditCheckInValueRequest: Sync = (
  { request, session, user, checkIn, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/edit", session, checkIn, value },
    { request },
  ]),
  where: async (frames) => await ensureSession({ session, user })(frames),
  then: actions([QuickCheckIns.edit, { owner: user, checkIn, value }]),
});

export const EditCheckInMetricAndValueRequest: Sync = (
  { request, session, user, checkIn, metric, value },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/edit", session, checkIn, metric, value },
    { request },
  ]),
  where: async (frames) => await ensureSession({ session, user })(frames),
  then: actions([QuickCheckIns.edit, { owner: user, checkIn, metric, value }]),
});

export const EditCheckInMetricOnlyRequest: Sync = (
  { request, session, user, checkIn, metric },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/edit", session, checkIn, metric },
    { request },
  ]),
  where: async (frames) => await ensureSession({ session, user })(frames),
  then: actions([QuickCheckIns.edit, { owner: user, checkIn, metric }]),
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
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
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
  where: async (frames) => await ensureSession({ session, user })(frames),
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
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
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
  where: async (frames) => await ensureSession({ session, user })(frames),
  then: actions([QuickCheckIns.deleteMetric, { requester: user, metric }]),
});

export const DeleteMetricResponseSuccess: Sync = ({ request, deleted }) => ({
  when: actions(
    [Requesting.request, { path: "/QuickCheckIns/deleteMetric" }, { request }],
    [QuickCheckIns.deleteMetric, {}, { deleted }],
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

export const DeleteMetricAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/deleteMetric", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Legacy Queries (owner-based) ---

// --- List Check-Ins by Owner (session-based) ---
export const ListCheckInsSessionRequest: Sync = (
  { request, session, user, checkIns },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/_listCheckInsByOwner", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    return collectCheckIns({ owner: user, checkIns })(frames);
  },
  then: actions([Requesting.respond, { request, checkIns }]),
});

export const ListCheckInsSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/_listCheckInsByOwner", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- List Metrics for Owner (session-based) ---
export const ListMetricsSessionRequest: Sync = (
  { request, session, user, metrics },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/_listMetricsForOwner", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    return collectMetrics({ owner: user, metrics })(frames);
  },
  then: actions([Requesting.respond, { request, metrics }]),
});

export const ListMetricsSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/_listMetricsForOwner", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});

// --- Get Metrics by Name (session-based) ---
export const GetMetricsByNameSessionRequest: Sync = (
  { request, session, user, name, metrics },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/_getMetricsByName", session, name },
    { request },
  ]),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await QuickCheckIns._getMetricsByName({ owner: ownerValue, name });
    return buildListResponse(frames, metrics, docs);
  },
  then: actions([Requesting.respond, { request, metrics }]),
});

export const GetMetricsByNameSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/QuickCheckIns/_getMetricsByName", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: AUTH_ERROR }]),
});
