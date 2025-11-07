---
timestamp: 'Fri Nov 07 2025 12:39:35 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_123935.061705fe.md]]'
content_id: 4b2fd2065d038d159bef6db770e820082c4332ca6614f2bdbddf4fb7da2d13e7
---

# implement: Update the following syncronizations for the concepts. The only included/public actions are the following:

"/api/UserAuthentication/register": "public endpoint to create account",
"/api/UserAuthentication/login": "public endpoint to start session",

Here are the synchronization implementations for the concepts that are not designated as public passthrough routes. These syncs handle the request/response cycle, including authorization by verifying a user's session.

All synchronizations are placed in a single file for convenience, but they could be split into multiple files under `src/syncs/` as described in the documentation.
