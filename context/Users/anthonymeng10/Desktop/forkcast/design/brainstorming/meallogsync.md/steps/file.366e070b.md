---
timestamp: 'Fri Nov 07 2025 13:16:33 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_131633.b23240fc.md]]'
content_id: 366e070be3358aae4bac39adaa978a476f798b89a07329e055aa6098cef2accb
---

# file: src/syncs/meallog.sync.ts

```typescript
import { actions, Frames, Sync } from "@engine";
import { MealLog, Requesting, Sessioning } from "@concepts";
// This import path assumes the type is exported from the concept implementation file.
import { FoodItem } from "@concepts/MealLog/MealLogConcept.ts";

// --- Submit Meal ---

export const SubmitMealRequest: Sync = ({ session, at, items, notes, user }) => ({
  when: actions([
    Requesting.request,
    // `at` and `items` are required; `notes` is optional.
    { path: "/MealLog/submit", session, at, items },
    { notes },
  ]),
  // Authorize: This sync only proceeds if the session is valid and a user is found.
  where: async (frames) =>
    frames.query(Sessioning._getUser, { session }, { user }),
  then: actions([
    MealLog.submit,
    // The frame `$` contains all bound variables. We build the params for the action.
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

export const EditMealRequest: Sync = ({ session, meal, at, items, notes, user, caller, owner }) => ({
  when: actions([
    Requesting.request,
    // Optional params `at`, `items`, `notes` from the request body are passed
    // implicitly on the frame, to be used by the `then` clause.
    { path: "/MealLog/edit", session, meal },
    {},
  ]),
  // Authorize: Caller must have a valid session and must be the owner of the meal.
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { caller: user });
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
        caller: frame[user], // 'user' is the symbol we bound 'caller' to
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

export const DeleteMealRequest: Sync = ({ session, meal, user, caller, owner }) => ({
  when: actions([
    Requesting.request,
    { path: "/MealLog/delete", session, meal },
    {},
  ]),
  where: async (frames) => {
    frames = await frames.query(Sessioning._getUser, { session }, { caller: user });
    if (frames.length === 0) return new Frames(); // Auth failed
    frames = await frames.query(MealLog._getMealOwner, { meal }, { owner });
    return frames.filter(($) => $[caller] === $[owner]); // Ownership check
  },
  then: actions([MealLog.delete, { caller: user, meal }]),
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
    { path: "/MealLog/list", session },
    { request, includeDeleted }, // Capture optional param from request body
  ]),
  where: async (frames) => {
    const userFrames = await frames.query(Sessioning._getUser, { session }, { user });
    // This sync only proceeds if auth succeeds. A timeout on the client indicates auth failure.
    if (userFrames.length === 0) return new Frames();

    const mealFrames = await userFrames.query(
      MealLog._getMealsByOwner,
      { owner: user, includeDeleted: userFrames[0][includeDeleted] ?? false },
      { meal },
    );

    if (mealFrames.length === 0) {
      // Success, but no meals found. Respond with an empty array.
      return new Frames({ ...userFrames[0], [results]: [] });
    }
    // Collect all found meal documents into a single `results` array.
    return mealFrames.collectAs([meal], results);
  },
  then: actions([Requesting.respond, { request, results }]),
});
```
