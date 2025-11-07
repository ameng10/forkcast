import { actions, Frames, Sync } from "@engine";
import { MealLog, Requesting, Sessioning } from "@concepts";

// This file implements the synchronization logic for the MealLog concept,
// handling HTTP requests for creating, editing, deleting, and retrieving meals.
// All endpoints are protected and require a valid session.

// Sample-mirrored style: per-endpoint auth inside each where clause.

// --- SUBMIT A NEW MEAL ---
// Handles POST /meals/submit

/**
 * A request to submit a meal is authorized, then triggers the MealLog.submit action.
 */
export const SubmitMealRequest: Sync = (
  { request, session, user, at, items, notes },
) => ({
  when: actions([
    Requesting.request,
    // Note: 'notes' is optional and may be undefined in the matched action.
    { path: "/MealLog/submit", session, at, items, notes },
    { request },
  ]),
  where: async (frames) => {
    // Authorize: Get user from session. This filters out frames with invalid sessions.
    return await frames.query(Sessioning._getUser, { session }, { user });
  },
  then: actions([MealLog.submit, { owner: user, at, items, notes }]),
});

/**
 * On successful meal submission, this sync fetches the user's *entire* updated
 * list of meals and returns it in the response, as per the requirements.
 */
export const SubmitMealResponseSuccess: Sync = (
  { request, user, meal, meals, mealDoc },
) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { meal }], // Triggered only on successful submission
  ),
  where: async (frames) => {
    // The `user` is available in the frame from the causal flow of `SubmitMealRequest`.
    // We now query for all meals owned by that user, which will include the one just submitted.
    const framesWithMeals = await frames.query(MealLog._getMealsByOwner, {
      owner: user,
    }, { meal: mealDoc });
    // All the user's meals are now in separate frames. Collect them into a single
    // 'meals' array for the response.
    return framesWithMeals.collectAs([mealDoc], meals);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

/**
 * If the MealLog.submit action returns an error (e.g., empty items list),
 * forward that error in the response.
 */
export const SubmitMealResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// Owner-only submit (no session provided) -> respond with just meal id
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

export const SubmitMealOwnerResponseSuccess: Sync = ({ request, meal }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { meal }],
  ),
  then: actions([Requesting.respond, { request, meal }]),
});

export const SubmitMealOwnerResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- EDIT A MEAL ---
// Handles POST /meals/edit

/**
 * A request to edit a meal is authorized, then triggers the MealLog.edit action.
 */
export const EditMealRequest: Sync = (
  { request, session, user, meal, at, items, notes, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", session, meal, at, items, notes },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(MealLog._getMealOwner, { meal }, { owner });
    return frames.filter(($) => $[user] === $[owner]);
  },
  then: actions([MealLog.edit, { caller: user, meal, at, items, notes }]),
});

/**
 * Responds with a success status when a meal is edited successfully.
 */
export const EditMealResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "ok" }]),
});

/**
 * If MealLog.edit returns an error (e.g., user not owner, meal not active),
 * forward that error in the response.
 */
export const EditMealResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- DELETE A MEAL ---
// Handles POST /meals/delete

/**
 * A request to delete a meal is authorized, then triggers the MealLog.delete action.
 */
export const DeleteMealRequest: Sync = (
  { request, session, user, meal, owner },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", session, meal },
    { request },
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    frames = await frames.query(MealLog._getMealOwner, { meal }, { owner });
    return frames.filter(($) => $[user] === $[owner]);
  },
  then: actions([MealLog.delete, { caller: user, meal }]),
});

/**
 * Responds with a success status when a meal is deleted successfully.
 */
export const DeleteMealResponseSuccess: Sync = ({ request }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, {}],
  ),
  then: actions([Requesting.respond, { request, status: "deleted" }]),
});

/**
 * If MealLog.delete returns an error, forward it in the response.
 */
export const DeleteMealResponseError: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, { error }],
  ),
  then: actions([Requesting.respond, { request, error }]),
});

// --- LIST ALL MEALS FOR CURRENT USER ---
// Handles POST /meals/list

/**
 * Fetches and returns all active meals for the logged-in user.
 * This handles the "zero matches" pitfall by explicitly returning an empty
 * array if the user is valid but has no meals.
 */
export const ListMeals: Sync = (
  { request, session, user, mealDoc, meals },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/list", session },
    { request },
  ]),
  where: async (frames) => {
    const framesWithUser = await frames.query(
      Sessioning._getUser,
      { session },
      { user },
    );
    // If session is invalid, framesWithUser will be empty, and the MealAuthFailure sync will handle the response.
    if (framesWithUser.length === 0) {
      return new Frames();
    }

    // Get the frame with the user binding to use for the final response.
    const userBindingFrame = framesWithUser[0];
    const mealFrames = await framesWithUser.query(MealLog._getMealsByOwner, {
      owner: user,
    }, { meal: mealDoc });

    if (mealFrames.length === 0) {
      // User is valid but has no meals. Create a single response frame with an empty 'meals' array.
      const responseFrame = { ...userBindingFrame, [meals]: [] };
      return new Frames(responseFrame);
    }

    // User has meals, collect them into a single frame for the response.
    return mealFrames.collectAs([mealDoc], meals);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

// --- EXACT QUERIES (underscore variants) ---

// /MealLog/_getMealsByOwner (owner only; includeDeleted defaults false)
export const GetMealsByOwnerRequest: Sync = (
  { request, owner, mealDoc, meals },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealsByOwner", owner },
    { request },
  ]),
  where: async (frames) => {
    const mealFrames = await frames.query(
      MealLog._getMealsByOwner,
      { owner },
      { meal: mealDoc },
    );
    if (mealFrames.length === 0) {
      const responseFrame = { ...frames[0], [meals]: [] };
      return new Frames(responseFrame);
    }
    return mealFrames.collectAs([mealDoc], meals);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

// /MealLog/_getMealsByOwner (owner + includeDeleted)
export const GetMealsByOwnerWithDeletedRequest: Sync = (
  { request, owner, includeDeleted, mealDoc, meals },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealsByOwner", owner, includeDeleted },
    { request },
  ]),
  where: async (frames) => {
    const mealFrames = await frames.query(
      MealLog._getMealsByOwner,
      { owner, includeDeleted },
      { meal: mealDoc },
    );
    if (mealFrames.length === 0) {
      const responseFrame = { ...frames[0], [meals]: [] };
      return new Frames(responseFrame);
    }
    return mealFrames.collectAs([mealDoc], meals);
  },
  then: actions([Requesting.respond, { request, meals }]),
});

// /MealLog/_getMealById success
export const GetMealByIdSuccess: Sync = (
  { request, meal, mealDoc },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealById", meal },
    { request },
  ]),
  where: (frames) =>
    frames.query(MealLog._getMealById, { meal }, { meal: mealDoc }),
  then: actions([Requesting.respond, { request, meal: mealDoc }]),
});

// /MealLog/_getMealById not found
export const GetMealByIdNotFound: Sync = (
  { request, meal, error },
) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/_getMealById", meal },
    { request },
  ]),
  where: async (frames) => {
    const mealFrames = await frames.query(MealLog._getMealById, { meal }, {
      meal,
    });
    if (mealFrames.length === 0) {
      const responseFrame = { ...frames[0], [error]: "Meal not found" };
      return new Frames(responseFrame);
    }
    return new Frames();
  },
  then: actions([Requesting.respond, { request, error }]),
});

// --- GET A SINGLE MEAL BY ID ---
// Handles POST /meals/get with multiple, mutually exclusive syncs for different outcomes.

/**
 * Handles a successful request to get a meal, ensuring the requester is the owner.
 */
export const GetMealSuccess: Sync = (
  { request, session, user, meal, mealDoc },
) => ({
  when: actions([Requesting.request, { path: "/MealLog/get", session, meal }, {
    request,
  }]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // Invalid session

    frames = await frames.query(MealLog._getMealById, { meal }, {
      meal: mealDoc,
    });
    if (frames.length === 0) return new Frames(); // Meal not found

    // Authorize: filter down to frames where the session user is the meal owner.
    // mealDoc binding holds a MealDocument; perform a runtime owner match
    return frames.filter(($) => {
      const doc = $[mealDoc] as { owner?: unknown } | undefined;
      return doc && doc.owner === $[user];
    });
  },
  then: actions([Requesting.respond, { request, meal: mealDoc }]),
});

/**
 * Handles the case where a meal is requested but does not exist.
 */
export const GetMealNotFound: Sync = (
  { request, session, user, meal, mealDoc, error },
) => ({
  when: actions([Requesting.request, { path: "/MealLog/get", session, meal }, {
    request,
  }]),
  where: async (frames) => {
    const framesWithUser = await frames.query(
      Sessioning._getUser,
      { session },
      { user },
    );
    if (framesWithUser.length === 0) return new Frames(); // Let auth failure sync handle this

    const mealFrames = await frames.query(MealLog._getMealById, { meal }, {
      meal: mealDoc,
    });
    // This sync should only fire if the meal query returns no results.
    if (mealFrames.length === 0) {
      // Add an error binding to the frame to be used in the 'then' clause.
      return framesWithUser.map(($) => ({ ...$, [error]: "Meal not found" }));
    }
    return new Frames(); // Don't fire if the meal was found.
  },
  then: actions([Requesting.respond, { request, error }]),
});

/**
 * Handles the case where a meal exists, but the requester is not the owner.
 */
export const GetMealPermissionDenied: Sync = (
  { request, session, user, meal, mealDoc, error },
) => ({
  when: actions([Requesting.request, { path: "/MealLog/get", session, meal }, {
    request,
  }]),
  where: async (frames) => {
    const framesWithUser = await frames.query(
      Sessioning._getUser,
      { session },
      { user },
    );
    if (framesWithUser.length === 0) return new Frames(); // Let auth failure sync handle this

    const mealFrames = await frames.query(MealLog._getMealById, { meal }, {
      meal: mealDoc,
    });
    if (mealFrames.length === 0) return new Frames(); // Let not-found sync handle this

    // Filter for authorized frames. If the result is empty, it means the user is not the owner.
    const authorizedFrames = mealFrames.filter(($) => {
      const doc = $[mealDoc] as { owner?: unknown } | undefined;
      return doc && doc.owner === $[user];
    });
    if (authorizedFrames.length === 0) {
      // The meal exists, but the user is not the owner. Add the error.
      return framesWithUser.map(($) => ({
        ...$,
        [error]: "Permission denied",
      }));
    }
    return new Frames(); // Don't fire if authorization succeeded.
  },
  then: actions([Requesting.respond, { request, error }]),
});
