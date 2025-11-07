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

# implement: Create the personalqa syncronizations using the concepts above. The only included/public actions are the following:
"/api/UserAuthentication/register": "public endpoint to create account",
  "/api/UserAuthentication/login": "public endpoint to start session",

# response:

# response:

# file: src/syncs/auth.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { Requesting, Sessioning, UserAuthentication } from "@concepts";

/**
 * After a user successfully logs in, create a session for them.
 */
export const LoginFlow: Sync = ({ user }) => ({
  when: actions(
    [UserAuthentication.login, {}, { user }],
  ),
  then: actions(
    [Sessioning.create, { user }],
  ),
});

/**
 * When a session is successfully created as part of a login flow,
 * respond to the original login request with the session ID.
 */
export const LoginResponseSuccess: Sync = ({ request, session }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [Sessioning.create, {}, { session }],
  ),
  then: actions(
    [Requesting.respond, { request, session }],
  ),
});

/**
 * If a login attempt fails, respond to the original request with the error.
 */
export const LoginResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/login" }, { request }],
    [UserAuthentication.login, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

/**
 * If a registration attempt is successful, respond with the new user's ID.
 */
export const RegisterResponseSuccess: Sync = ({ request, user }) => ({
  when: actions(
    [Requesting.request, { path: "/UserAuthentication/register" }, { request }],
    [UserAuthentication.register, {}, { user }],
  ),
  then: actions(
    [Requesting.respond, { request, user }],
  ),
});

/**
 * If a registration attempt fails (e.g., username taken), respond with the error.
 */
export const RegisterResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/UserAuthentication/register" },
      { request },
    ],
    [UserAuthentication.register, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});

/**
 * When a user requests to log out, delete their session.
 */
export const LogoutRequest: Sync = ({ session }) => ({
  when: actions(
    [Requesting.request, { path: "/logout", session }, {}],
  ),
  then: actions(
    [Sessioning.delete, { session }],
  ),
});

/**
 * After a session is successfully deleted for logout, confirm with a response.
 */
export const LogoutResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, {}],
  ),
  then: actions(
    [Requesting.respond, { request, status: "logged_out" }],
  ),
});

/**
 * If a logout request is made with an invalid session, respond with an error.
 */
export const LogoutResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/logout" }, { request }],
    [Sessioning.delete, {}, { error }],
  ),
  then: actions(
    [Requesting.respond, { request, error }],
  ),
});
```

# file: src/syncs/personal_qa.sync.ts

```typescript
import { actions, Sync } from "@engine";
import { PersonalQA, Requesting, Sessioning } from "@concepts";

// --- Ingest Fact ---

export const IngestFactRequest: Sync = (
  { session, user, at, content, source },
) => ({
  when: actions([
    Requesting.request,
    { path: "/personalqa/ingestFact", session, at, content, source },
    {},
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
    [Requesting.request, { path: "/personalqa/ingestFact" }, { request }],
    [PersonalQA.ingestFact, {}, { fact }],
  ),
  then: actions([Requesting.respond, { request, fact }]),
});

// --- Forget Fact ---

export const ForgetFactRequest: Sync = ({ session, user, factId }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/forgetFact", session, factId }, {}],
  ),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.forgetFact, { requester: user, owner: user, factId }]),
});

export const ForgetFactResponseSuccess: Sync = ({ request, ok }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/forgetFact" }, { request }],
    [PersonalQA.forgetFact, {}, { ok }],
  ),
  then: actions([Requesting.respond, { request, ok }]),
});

export const ForgetFactResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/forgetFact" }, { request }],
    [PersonalQA.forgetFact, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Ask ---

export const AskRequest: Sync = ({ session, user, question }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/ask", session, question }, {}],
  ),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.ask, { requester: user, question }]),
});

export const AskResponse: Sync = ({ request, qa }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/ask" }, { request }],
    [PersonalQA.ask, {}, { qa }],
  ),
  then: actions([Requesting.respond, { request, qa }]),
});

// --- Ask LLM ---

export const AskLLMRequest: Sync = ({ session, user, question, k }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/askLLM", session, question, k }, {}],
  ),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.askLLM, { requester: user, question, k }]),
});

export const AskLLMResponse: Sync = ({ request, qa }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/askLLM" }, { request }],
    [PersonalQA.askLLM, {}, { qa }],
  ),
  then: actions([Requesting.respond, { request, qa }]),
});

// --- Set Template ---

export const SetTemplateRequest: Sync = (
  { session, user, name, template },
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/personalqa/setTemplate", session, name, template },
      {},
    ],
  ),
  where: async (frames) =>
    await frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([PersonalQA.setTemplate, { requester: user, name, template }]),
});

export const SetTemplateResponse: Sync = ({ request, ok }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/setTemplate" }, { request }],
    [PersonalQA.setTemplate, {}, { ok }],
  ),
  then: actions([Requesting.respond, { request, ok }]),
});

// --- Queries ---

export const GetUserFactsRequest: Sync = (
  { request, session, user, facts },
) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/facts", session }, { request }],
  ),
  where: async (frames) =>
    await frames
      .query(Sessioning._getUser, { session }, { user })
      .query(PersonalQA._getUserFacts, { owner: user }, { facts }),
  then: actions([Requesting.respond, { request, facts }]),
});

export const GetUserQAsRequest: Sync = ({ request, session, user, qas }) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/qas", session }, { request }],
  ),
  where: async (frames) =>
    await frames
      .query(Sessioning._getUser, { session }, { user })
      .query(PersonalQA._getUserQAs, { owner: user }, { qas }),
  then: actions([Requesting.respond, { request, qas }]),
});

export const GetUserDraftsRequest: Sync = (
  { request, session, user, drafts },
) => ({
  when: actions(
    [Requesting.request, { path: "/personalqa/drafts", session }, { request }],
  ),
  where: async (frames) =>
    await frames
      .query(Sessioning._getUser, { session }, { user })
      .query(PersonalQA._getUserDrafts, { owner: user }, { drafts }),
  then: actions([Requesting.respond, { request, drafts }]),
});
```