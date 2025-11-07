import { actions, Frames, Sync } from "@engine";
import { MealLog, Requesting, Sessioning } from "@concepts";

const SESSION_AUTH_ERROR = "Invalid or expired session.";

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
  { owner, mealDoc, meals }: { owner: symbol; mealDoc: symbol; meals: symbol },
) =>
async (frames: Frames): Promise<Frames> => {
  if (frames.length === 0) return frames;
  const mealFrames = await frames.query(MealLog._getMealsByOwner, { owner }, {
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

export const SubmitMealOwnerRequest: Sync = (
  { request, owner, at, items, notes },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", owner, at, items, notes },
    { request },
  ]),
  then: actions([MealLog.submit, { owner, at, items, notes }]),
});

export const SubmitMealOwnerRequestNoNotes: Sync = (
  { request, owner, at, items },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", owner, at, items },
    { request },
  ]),
  then: actions([MealLog.submit, { owner, at, items }]),
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

export const EditMealOwnerRequest: Sync = (
  { request, owner, meal, at, items, notes },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", owner, meal, at, items, notes },
    { request },
  ]),
  then: actions([MealLog.edit, { caller: owner, meal, at, items, notes }]),
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

export const DeleteMealOwnerRequest: Sync = (
  { request, owner, meal },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", owner, meal },
    { request },
  ]),
  then: actions([MealLog.delete, { caller: owner, meal }]),
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

// --- Get Meals by Owner ---
export const GetMealsByOwnerRequest: Sync = (
  { request, owner, includeDeleted, mealDoc, meals },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealsByOwner", owner, includeDeleted },
    { request },
  ]),
  where: async (frames) => {
    const mealFrames = await frames.query(MealLog._getMealsByOwner, {
      owner,
      includeDeleted,
    }, { meal: mealDoc });
    const docs = mealFrames.map(($) => $[mealDoc]);
    return buildMealsResponse(frames, meals, docs);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

// --- Get Meal by ID ---
export const GetMealByIdRequest: Sync = (
  { request, meal, mealDoc },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealById", meal },
    { request },
  ]),
  where: async (frames) => {
    const mealFrames = await frames.query(MealLog._getMealById, { meal }, {
      meal: mealDoc,
    });
    if (mealFrames.length === 0) {
      const responseFrame = { ...frames[0], [mealDoc]: null };
      return new Frames(responseFrame);
    }
    return mealFrames;
  },
  then: actions([Requesting.respond, { request, meal: mealDoc }]),
});
