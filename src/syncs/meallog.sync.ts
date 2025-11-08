import { actions, Frames, Sync } from "@engine";
import { MealLog, Requesting, Sessioning } from "@concepts";

const SESSION_AUTH_ERROR = "Invalid or expired session.";
const SESSION_REQUIRED_ERROR = "Session is required for this action.";

const ensureSession = (
  { session, user }: { session: symbol; user: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  frames = await frames.query(Sessioning._getUser, { session }, { user });
  return frames.filter(($) => $[user] !== undefined);
};

const ensureSessionWithOwnership = (
  { session, user, meal, owner }: {
    session: symbol;
    user: symbol;
    meal: symbol;
    owner: symbol;
  },
) =>
async (frames: Frames): Promise<Frames> => {
  frames = await ensureSession({ session, user })(frames);
  if (frames.length === 0) return frames;
  frames = await frames.query(MealLog._getMealOwner, { meal }, { owner });
  return frames.filter(($) => $[owner] === $[user]);
};

const sessionFailure = (
  { session, error }: { session: symbol; error: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  frames = await frames.query(Sessioning._getUser, { session }, { error });
  return frames.filter(($) => $[error] !== undefined);
};

const buildMealsResponse = (
  baseFrames: Frames,
  meals: symbol,
  docs: unknown[],
) => {
  const base = baseFrames[0] ?? {};
  return new Frames({ ...base, [meals]: docs });
};

const collectMeals = (
  { owner, mealDoc, meals, includeDeleted }: {
    owner: symbol;
    mealDoc: symbol;
    meals: symbol;
    includeDeleted?: symbol;
  },
) =>
async (frames: Frames): Promise<Frames> => {
  if (frames.length === 0) return frames;
  if (includeDeleted) {
    frames = frames.map((frame) => ({
      ...frame,
      [includeDeleted]: frame[includeDeleted] ?? false,
    }));
  }
  const queryInput = includeDeleted
    ? { owner, includeDeleted }
    : { owner };
  const mealFrames = await frames.query(MealLog._getMealsByOwner, queryInput, {
    meal: mealDoc,
  });
  const docs = mealFrames.map(($) => $[mealDoc]);
  return buildMealsResponse(frames, meals, docs);
};

// --- Submit Meal ---
export const SubmitMealSessionRequest: Sync = (
  { request, session, user, at, items, notes },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", session, at, items, notes },
    { request },
  ]),
  where: ensureSession({ session, user }),
  then: actions([MealLog.submit, { owner: user, at, items, notes }]),
});

export const SubmitMealSessionRequestNoNotes: Sync = (
  { request, session, user, at, items },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", session, at, items },
    { request },
  ]),
  where: ensureSession({ session, user }),
  then: actions([MealLog.submit, { owner: user, at, items }]),
});

export const SubmitMealSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const SubmitMealMissingSessionResponse: Sync = (
  { request, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", owner },
    { request },
  ]),
  then: actions([Requesting.respond, {
    request,
    error: SESSION_REQUIRED_ERROR,
  }]),
});

export const SubmitMealResponseSuccess: Sync = (
  { request, meal },
) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { meal }],
  ),
  then: actions([Requesting.respond, { request, meal }]),
});

export const SubmitMealResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Edit Meal ---
export const EditMealSessionRequest: Sync = (
  { request, session, user, meal, at, items, notes, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", session, meal, at, items, notes },
    { request },
  ]),
  where: ensureSessionWithOwnership({ session, user, meal, owner }),
  then: actions([MealLog.edit, { caller: user, meal, at, items, notes }]),
});

export const EditMealSessionRequestNoNotes: Sync = (
  { request, session, user, meal, at, items, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", session, meal, at, items },
    { request },
  ]),
  where: ensureSessionWithOwnership({ session, user, meal, owner }),
  then: actions([MealLog.edit, { caller: user, meal, at, items }]),
});

export const EditMealSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const EditMealMissingSessionResponseCaller: Sync = (
  { request, caller },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", caller },
    { request },
  ]),
  then: actions([Requesting.respond, {
    request,
    error: SESSION_REQUIRED_ERROR,
  }]),
});

export const EditMealMissingSessionResponseOwner: Sync = (
  { request, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", owner },
    { request },
  ]),
  then: actions([Requesting.respond, {
    request,
    error: SESSION_REQUIRED_ERROR,
  }]),
});

export const EditMealResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

export const EditMealResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Delete Meal ---
export const DeleteMealSessionRequest: Sync = (
  { request, session, user, meal, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", session, meal },
    { request },
  ]),
  where: ensureSessionWithOwnership({ session, user, meal, owner }),
  then: actions([MealLog.delete, { caller: user, meal }]),
});

export const DeleteMealSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

export const DeleteMealMissingSessionResponseCaller: Sync = (
  { request, caller },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", caller },
    { request },
  ]),
  then: actions([Requesting.respond, {
    request,
    error: SESSION_REQUIRED_ERROR,
  }]),
});

export const DeleteMealMissingSessionResponseOwner: Sync = (
  { request, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", owner },
    { request },
  ]),
  then: actions([Requesting.respond, {
    request,
    error: SESSION_REQUIRED_ERROR,
  }]),
});

export const DeleteMealResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "deleted" }]),
});

export const DeleteMealResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- Get Meals (session) ---
export const GetMealsSessionRequest: Sync = (
  { request, session, user, mealDoc, meals },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/getMeals", session },
    { request },
  ]),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    return collectMeals({ owner: user, mealDoc, meals })(frames);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

export const GetMealsSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/getMeals", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

// --- Get Meals by Owner (session-protected legacy path) ---
export const GetMealsByOwnerSessionRequest: Sync = (
  { request, session, user, includeDeleted, mealDoc, meals },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealsByOwner", session, includeDeleted },
    { request },
  ]),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    return collectMeals({ owner: user, mealDoc, meals, includeDeleted })(frames);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

export const GetMealsByOwnerSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealsByOwner", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});

// --- Get Meal by ID (session-protected) ---
export const GetMealByIdSessionRequest: Sync = (
  { request, session, user, meal, mealDoc },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealById", session, meal },
    { request },
  ]),
  where: async (frames) => {
    frames = await ensureSession({ session, user })(frames);
    if (frames.length === 0) return frames;
    const mealFrames = await frames.query(MealLog._getMealById, { meal }, {
      meal: mealDoc,
    });
    if (mealFrames.length === 0) {
      const responseFrame = { ...frames[0], [mealDoc]: null };
      return new Frames(responseFrame);
    }
    const authorized = mealFrames.filter(($) => {
      const doc = $[mealDoc] as { owner?: unknown } | undefined;
      return doc && doc.owner === $[user];
    });
    if (authorized.length === 0) {
      const responseFrame = { ...frames[0], [mealDoc]: null };
      return new Frames(responseFrame);
    }
    return authorized;
  },
  then: actions([Requesting.respond, { request, meal: mealDoc }]),
});

export const GetMealByIdSessionAuthFailure: Sync = (
  { request, session, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealById", session },
    { request },
  ]),
  where: sessionFailure({ session, error }),
  then: actions([Requesting.respond, { request, error: SESSION_AUTH_ERROR }]),
});
