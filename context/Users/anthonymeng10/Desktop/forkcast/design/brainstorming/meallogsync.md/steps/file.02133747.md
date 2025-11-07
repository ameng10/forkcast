---
timestamp: 'Fri Nov 07 2025 13:21:47 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_132147.6201d639.md]]'
content_id: 021337471c6455837086e0c735e482ce342d157250e6d25e9e2c2cb5e224de0f
---

# file: src/syncs/meallog.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { MealLog, Requesting, Sessioning } from "@concepts";
// This import path assumes the type is exported from the concept implementation file.
import { FoodItem } from "@concepts/MealLog/MealLogConcept.ts";
import { ID } from "@utils/types.ts";

// --- Submit Meal ---

export const SubmitMealRequest: Sync = ({ session, at, items, notes, user }) => ({
  when: actions([
    Requesting.request,
    // FIX: Optional 'notes' parameter moved from output pattern to input pattern.
    { path: "/MealLog/submit", session, at, items, notes },
    {},
  ]),
  // Authorize: This sync only proceeds if the session is valid and a user is found.
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    MealLog.submit,
    // The frame '$' contains all bound variables. We build the params for the action.
    ($) => ({
      owner: $[user],
      at: new Date($[at] as string),
      items: $[items] as FoodItem[],
      // Only include notes if it was provided in the original request.
      ...($[notes] !== undefined && { notes: $[notes] as string }),
    }),
  ]),
});

export const SubmitMealResponse: Sync = ({ request, meal, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/submit" }, { request }],
    [MealLog.submit, {}, { meal, error }],
  ),
  then: actions([Requesting.respond, { request, meal, error }]),
});

// --- Edit Meal ---

export const EditMealRequest: Sync = ({ session, meal, at, items, notes, caller, owner }) => ({
  when: actions([
    Requesting.request,
    // FIX: Optional parameters `at`, `items`, and `notes` must be included
    // in the input pattern to be bound to symbols and made available to later clauses.
    { path: "/MealLog/edit", session, meal, at, items, notes },
    {},
  ]),
  // Authorize: Caller must have a valid session and must be the owner of the meal.
  where: async (frames) => {
    // FIX: Using 'caller' consistently for clarity instead of aliasing 'user'.
    frames = await frames.query(Sessioning._getUser, { session }, { caller });
    if (frames.length === 0) return new Frames(); // Auth failed, stop sync.
    frames = await frames.query(MealLog._getMealOwner, { meal }, { owner });
    return frames.filter(($) => $[caller] === $[owner]); // Ownership check
  },
  then: actions([
    MealLog.edit,
    // Use a function to dynamically build params from the frame,
    // as `at`, `items`, and `notes` are all optional.
    (frame) => {
      const params: { caller: ID; meal: ID; at?: Date; items?: FoodItem[]; notes?: string } = {
        caller: frame[caller], // FIX: Using 'caller' symbol consistently.
        meal: frame[meal],
      };
      if (frame[at] !== undefined) params.at = new Date(frame[at] as string);
      if (frame[items] !== undefined) params.items = frame[items] as FoodItem[];
      if (frame[notes] !== undefined) params.notes = frame[notes] as string;
      return params;
    },
  ]),
});

export const EditMealResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/edit" }, { request }],
    [MealLog.edit, {}, { error }], // Success returns {}, error returns {error}
  ),
  then: actions([
    Requesting.respond,
    ($) =>
      $[error]
        ? { request: $[request], error: $[error] }
        : { request: $[request], status: "ok" },
  ]),
});

// --- Delete Meal ---

export const DeleteMealRequest: Sync = ({ session, meal, caller, owner }) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", session, meal },
    {},
  ]),
  where: async (frames) => {
    // FIX: Using 'caller' consistently for clarity.
    frames = await frames.query(Sessioning._getUser, { session }, { caller });
    if (frames.length === 0) return new Frames(); // Auth failed
    frames = await frames.query(MealLog._getMealOwner, { meal }, { owner });
    return frames.filter(($) => $[caller] === $[owner]); // Ownership check
  },
  then: actions([MealLog.delete, { caller, meal }]),
});

export const DeleteMealResponse: Sync = ({ request, error }) => ({
  when: actions(
    [Requesting.request, { path: "/MealLog/delete" }, { request }],
    [MealLog.delete, {}, { error }],
  ),
  then: actions([
    Requesting.respond,
    ($) =>
      $[error]
        ? { request: $[request], error: $[error] }
        : { request: $[request], status: "ok" },
  ]),
});

// --- List Meals ---

export const ListMealsResponse: Sync = ({ request, session, includeDeleted, user, meal, results }) => ({
  when: actions([
    Requesting.request,
    // FIX: Optional 'includeDeleted' parameter moved to the input pattern.
    { path: "/MealLog/list", session, includeDeleted },
    { request },
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    if (userFrames.length === 0) return new Frames();

    // The value of includeDeleted is accessed from the frame bound in the 'when' clause.
    const include = userFrames[0][includeDeleted] === true;
    const mealFrames = await userFrames.query(
      MealLog._getMealsByOwner,
      { owner: user, includeDeleted: include },
      { meal },
    );

    if (mealFrames.length === 0) {
      // Handle the "zero matches" case by creating a valid response frame.
      return new Frames({ ...userFrames[0], [results]: [] });
    }
    // Collect all found meal documents into a single `results` array.
    return mealFrames.collectAs([meal], results);
  },
  then: actions([Requesting.respond, { request, results }]),
});
```
