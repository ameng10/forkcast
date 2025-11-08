import { actions, Frames, Sync } from "@engine";
import { PersonalQA, Requesting, Sessioning } from "@concepts";

const SESSION_AUTH_ERROR = "Invalid or expired session.";

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

const buildListResponse = (
  frames: Frames,
  listSymbol: symbol,
  items: unknown[],
) => {
  const base = frames[0] ?? {};
  return new Frames({ ...base, [listSymbol]: items });
};

// --- Ingest Fact ---

export const IngestFactRequest: Sync = (
  { request, session, user, at, content, source },
) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/ingestFact", session, at, content, source },
    { request },
  ]),
  where: ensureSession({ session, user }),
  then: actions([
    PersonalQA.ingestFact,
    { owner: user, at, content, source },
  ]),
});

export const IngestFactAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/ingestFact", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const IngestFactResponse: Sync = ({ request, fact }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/ingestFact" }, { request }],
    [PersonalQA.ingestFact, {}, { fact }],
  ),
  then: actions([Requesting.respond, { request, fact }]),
});

// --- Forget Fact ---

export const ForgetFactRequest: Sync = (
  { request, session, user, factId },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/forgetFact", session, factId },
      { request },
    ],
  ),
  where: ensureSession({ session, user }),
  then: actions([PersonalQA.forgetFact, {
    requester: user,
    owner: user,
    factId,
  }]),
});

export const ForgetFactResponseSuccess: Sync = ({ request, ok }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/forgetFact" }, { request }],
    [PersonalQA.forgetFact, {}, { ok }],
  ),
  then: actions([Requesting.respond, { request, ok }]),
});

export const ForgetFactResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/forgetFact" }, { request }],
    [PersonalQA.forgetFact, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Ask ---

export const AskRequest: Sync = ({ request, session, user, question }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/ask", session, question }, {
      request,
    }],
  ),
  where: ensureSession({ session, user }),
  then: actions([PersonalQA.ask, { requester: user, question }]),
});

export const AskResponse: Sync = ({ request, qa }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/ask" }, { request }],
    [PersonalQA.ask, {}, { qa }],
  ),
  then: actions([Requesting.respond, { request, qa }]),
});

// --- Ask LLM ---

export const AskLLMRequest: Sync = (
  { request, session, user, question },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/askLLM", session, question },
      { request },
    ],
  ),
  where: ensureSession({ session, user }),
  then: actions([PersonalQA.askLLM, { requester: user, question }]),
});

export const AskLLMResponse: Sync = ({ request, qa }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/askLLM" }, { request }],
    [PersonalQA.askLLM, {}, { qa }],
  ),
  then: actions([Requesting.respond, { request, qa }]),
});

// --- Set Template ---

export const SetTemplateRequest: Sync = (
  { request, session, user, name, template },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/setTemplate", session, name, template },
      { request },
    ],
  ),
  where: ensureSession({ session, user }),
  then: actions([PersonalQA.setTemplate, { requester: user, name, template }]),
});

export const SetTemplateResponse: Sync = ({ request, ok }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/setTemplate" }, { request }],
    [PersonalQA.setTemplate, {}, { ok }],
  ),
  then: actions([Requesting.respond, { request, ok }]),
});

// --- Queries ---

export const GetUserFactsRequest: Sync = (
  { request, session, user, facts },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/facts", session },
      { request },
    ],
  ),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await PersonalQA._getUserFacts({ owner: ownerValue });
    return buildListResponse(frames, facts, docs);
  },
  then: actions([Requesting.respond, { request, facts }]),
});

export const GetUserFactsAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/facts", session },
      { request },
    ],
  ),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const GetUserFactsRequestLegacy: Sync = (
  { request, session, user, facts },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/_getUserFacts", session },
      { request },
    ],
  ),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await PersonalQA._getUserFacts({ owner: ownerValue });
    return buildListResponse(frames, facts, docs);
  },
  then: actions([Requesting.respond, { request, facts }]),
});

export const GetUserFactsAuthFailureLegacy: Sync = (
  { request, session, error },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/_getUserFacts", session },
      { request },
    ],
  ),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const GetUserQAsRequest: Sync = ({ request, session, user, qas }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/qas", session },
      { request },
    ],
  ),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await PersonalQA._getUserQAs({ owner: ownerValue });
    return buildListResponse(frames, qas, docs);
  },
  then: actions([Requesting.respond, { request, qas }]),
});

export const GetUserQAsAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/qas", session },
      { request },
    ],
  ),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const GetUserQAsRequestLegacy: Sync = (
  { request, session, user, qas },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/_getUserQAs", session },
      { request },
    ],
  ),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await PersonalQA._getUserQAs({ owner: ownerValue });
    return buildListResponse(frames, qas, docs);
  },
  then: actions([Requesting.respond, { request, qas }]),
});

export const GetUserQAsAuthFailureLegacy: Sync = (
  { request, session, error },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/_getUserQAs", session },
      { request },
    ],
  ),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const GetUserDraftsRequest: Sync = (
  { request, session, user, drafts },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/drafts", session },
      { request },
    ],
  ),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await PersonalQA._getUserDrafts({ owner: ownerValue });
    return buildListResponse(frames, drafts, docs);
  },
  then: actions([Requesting.respond, { request, drafts }]),
});

export const GetUserDraftsAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/drafts", session },
      { request },
    ],
  ),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const GetUserDraftsRequestLegacy: Sync = (
  { request, session, user, drafts },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/_getUserDrafts", session },
      { request },
    ],
  ),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const ownerValue = frames[0][user];
    if (ownerValue === undefined) return new Frames();
    const docs = await PersonalQA._getUserDrafts({ owner: ownerValue });
    return buildListResponse(frames, drafts, docs);
  },
  then: actions([Requesting.respond, { request, drafts }]),
});

export const GetUserDraftsAuthFailureLegacy: Sync = (
  { request, session, error },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/_getUserDrafts", session },
      { request },
    ],
  ),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});
export const ForgetFactAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/forgetFact", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const AskAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/ask", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const AskLLMAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/askLLM", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const SetTemplateAuthFailure: Sync = ({ request, session, error }) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/setTemplate", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});
