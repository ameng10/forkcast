import { actions, Sync } from "@engine";
import { PersonalQA, Requesting, Sessioning } from "@concepts";

// --- Ingest Fact ---

export const IngestFactRequest: Sync = (
  { request, session, user, at, content, source },
) => ({
  when: actions([
    Requesting.request,
    { path: "/PersonalQA/ingestFact", session, at, content, source },
    { request },
  ]),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    PersonalQA.ingestFact,
    { owner: user, at, content, source },
  ]),
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
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
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
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
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
  { request, session, user, question, k },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/PersonalQA/askLLM", session, question, k },
      { request },
    ],
  ),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.askLLM, { requester: user, question, k }]),
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
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
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
    [Requesting.request, { path: "/PersonalQA/facts", session }, { request }],
  ),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    if (userFrames.length === 0) return userFrames;
    return await userFrames.query(
      PersonalQA._getUserFacts,
      { owner: user },
      { facts },
    );
  },
  then: actions([Requesting.respond, { request, facts }]),
});

export const GetUserQAsRequest: Sync = ({ request, session, user, qas }) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/qas", session }, { request }],
  ),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    if (userFrames.length === 0) return userFrames;
    return await userFrames.query(
      PersonalQA._getUserQAs,
      { owner: user },
      { qas },
    );
  },
  then: actions([Requesting.respond, { request, qas }]),
});

export const GetUserDraftsRequest: Sync = (
  { request, session, user, drafts },
) => ({
  when: actions(
    [Requesting.request, { path: "/PersonalQA/drafts", session }, { request }],
  ),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, {
      user,
    });
    if (userFrames.length === 0) return userFrames;
    return await userFrames.query(
      PersonalQA._getUserDrafts,
      { owner: user },
      { drafts },
    );
  },
  then: actions([Requesting.respond, { request, drafts }]),
});
