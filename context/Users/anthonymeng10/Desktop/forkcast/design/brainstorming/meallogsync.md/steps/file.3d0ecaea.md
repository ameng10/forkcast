---
timestamp: 'Fri Nov 07 2025 15:08:14 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_150814.e2d4e850.md]]'
content_id: 3d0ecaea8ab1ebb95b522af246d40084c243e97b5d7a1375b3d486346f535c8d
---

# file: src/concepts/Requesting/passthrough.ts

```typescript
// By default, all concept actions are available as passthrough routes.
// This file allows you to explicitly include or exclude routes.
// Excluded routes will fire a `Requesting.request` action instead,
// allowing you to handle them with synchronizations.

/**
 * Routes to EXCLUDE from passthrough.
 * These routes will trigger a `Requesting.request` event.
 * Use this for any action that requires orchestration (e.g., authentication, multi-concept logic).
 */
export const exclusions: string[] = [
  // Authentication flow requires creating a session, so it cannot be a simple passthrough.
  "/UserAuthentication/register",
  "/UserAuthentication/login",
  "/Sessioning/delete", // This will be our logout endpoint.

  // MealLog flow requires session-based authentication.
  "/MealLog/submit",
  "/MealLog/edit",
  "/MealLog/delete",
  "/MealLog/getMeals", // An endpoint to fetch all meals for the logged-in user.
];

/**
 * Routes to INCLUDE in passthrough.
 * Key: route path (e.g., "/MyConcept/myAction")
 * Value: justification for why it's safe to expose directly.
 * Use this for simple, public, read-only queries or actions that don't require orchestration.
 */
export const inclusions: { [route: string]: string } = {
  // There are no simple passthrough routes in this setup; all actions are orchestrated.
};
```
