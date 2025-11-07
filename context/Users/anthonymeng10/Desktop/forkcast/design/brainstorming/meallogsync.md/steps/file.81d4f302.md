---
timestamp: 'Fri Nov 07 2025 15:08:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_150814.e2d4e850.md]]'
content_id: 81d4f3028400fa302db55bc1656c8f53f0a784f466f8b74d0b413101bc7d47d3
---

# file: src/syncs/meallog.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { MealLog, Requesting, Sessioning } from "@concepts";

// --- MealLog CRUD Operations ---

// This helper function authenticates a request by finding the user associated with the session.
// It's used as a 'where' clause in multiple synchronizations.
const authenticate =
  ({ session, user }: { session: symbol; user: symbol }) =>
  async (frames: Frames): Promise<Frames> => {
    return await frames.query(Sessioning._getUser, { session }, { user });
  };

// 1. Submit a new meal after authentication.
export const SubmitMealRequest: Sync = ({ request, session, user, at, items, notes }) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/submit", session, at, items, notes },
    { request },
  ]),
  where: authenticate({ session, user }),
  then: actions([MealLog.submit, { owner: user, at, items, notes }]),
});

// 2. Edit an existing meal after authentication.
export const EditMealRequest: Sync = ({ request, session, user, meal, at, items, notes }) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/edit", session, meal, at, items, notes },
    { request },
  ]),
  where: authenticate({ session, user }),
  then: actions([MealLog.edit, { caller: user, meal, at, items, notes }]),
});

// 3. Delete a meal after authentication.
export const DeleteMealRequest: Sync = ({ request, session, user, meal }) => ({
  when: actions([Requesting.request, { path: "/MealLog/delete", session, meal }, { request }]),
  where: authenticate({ session, user }),
  then: actions([MealLog.delete, { caller: user, meal }]),
});

// --- Responses for CRUD operations ---

// A generic success response that refetches all user's meals and returns them.
// This is used for submit, edit, and delete successes to give the client the updated state.
const respondWithAllMeals =
  ({ session, user, meal, meals }: { session: symbol; user: symbol; meal: symbol; meals: symbol }) =>
  async (frames: Frames): Promise<Frames> => {
    frames = await frames.query(Sessioning._getUser, { session }, { user });
    if (frames.length === 0) return new Frames(); // No valid user, abort.

    const mealFrames = await frames.query(MealLog._getMealsByOwner, { owner: user }, { meal });

    // Handle the "zero matches" case, e.g., after deleting the last meal.
    if (mealFrames.length === 0) {
      const responseFrame = { ...frames[0], [meals]: [] };
      return new Frames(responseFrame);
    }
    
    // `collectAs` groups by the non-collected variables (like `request`), creating a single frame
    // with a `meals` property that is an array of all the `meal` bindings.
    return mealFrames.collectAs([meal], meals);
  };

// 4. Respond to successful Submit, Edit, or Delete by returning the user's updated list of meals.
export const CrudSuccessResponse: Sync = ({ request, session, user, meal, meals }) => ({
  when: [
    actions(
      [Requesting.request, { path: "/MealLog/submit", session }, { request }],
      [MealLog.submit, {}, {}],
    ),
    actions(
      [Requesting.request, { path: "/MealLog/edit", session }, { request }],
      [MealLog.edit, {}, {}],
    ),
    actions(
      [Requesting.request, { path: "/MealLog/delete", session }, { request }],
      [MealLog.delete, {}, {}],
    ),
  ],
  where: respondWithAllMeals({ session, user, meal, meals }),
  then: actions([Requesting.respond, { request, meals }]),
});

// 5. Respond to failed Submit, Edit, or Delete with the error message.
export const CrudFailureResponse: Sync = ({ request, error }) => ({
  when: [
    actions(
      [Requesting.request, { path: "/MealLog/submit" }, { request }],
      [MealLog.submit, {}, { error }],
    ),
    actions(
      [Requesting.request, { path: "/MealLog/edit" }, { request }],
      [MealLog.edit, {}, { error }],
    ),
    actions(
      [Requesting.request, { path: "/MealLog/delete" }, { request }],
      [MealLog.delete, {}, { error }],
    ),
  ],
  then: actions([Requesting.respond, { request, error }]),
});


// --- Read Operation: Get all meals ---

// 6. Handle a request to get all meals for the logged-in user.
export const GetMealsRequest: Sync = ({ request, session, user, meal, meals }) => ({
  when: actions([Requesting.request, { path: "/MealLog/getMeals", session }, { request }]),
  where: respondWithAllMeals({ session, user, meal, meals }),
  then: actions([Requesting.respond, { request, meals }]),
});
```
