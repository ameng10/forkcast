---
timestamp: 'Fri Nov 07 2025 12:37:43 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_123743.a832cf16.md]]'
content_id: e8971c277b04170243906c87676dbec5b08eee33fdb2470ee6f4997fcd7420cd
---

# implement: Update syncronizations for the concepts. The only included/public actions are the following:

"/api/UserAuthentication/register": "public endpoint to create account",
"/api/UserAuthentication/login": "public endpoint to start session",

Here are the synchronization implementations for the concepts that are not designated as public passthrough routes. These syncs handle the request/response cycle, including authorization by verifying a user's session.

All synchronizations are placed in a single file for convenience, but they could be split into multiple files under `src/syncs/` as described in the documentation.
