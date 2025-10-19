---
timestamp: 'Sun Oct 19 2025 16:11:30 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_161130.e3dae545.md]]'
content_id: 7df337b25dee9947f892ef25b14eb709973a08713b7e9f9d2f073c91cfa337fc
---

# test: QuickCheckIns

Use the following errors to debug my test cases:

running 7 tests from ./src/concepts/SwapSuggestions/SwapSuggestionsConcept.test.ts
Principle: Propose and Accept a Swap Suggestion lifecycle ...
\------- post-test output -------
Trace: Author A proposes a swap suggestion.
Trace: Proposal created and verified as unaccepted.
Trace: Author A accepts their own proposal.
Trace: Verifying proposal is accepted.
Trace: Proposal successfully accepted and verified.
\----- post-test output end -----
Principle: Propose and Accept a Swap Suggestion lifecycle ... ok (690ms)
Action: propose - successful creation of proposals with various data ... ok (828ms)
Action: propose - with empty risky/alternatives arrays (edge case) ... ok (601ms)
Action: accept - requires matching proposal based on owner, risky, and alternatives ... FAILED (666ms)
Action: accept - requires requester to be the owner ... FAILED (589ms)
Action: accept - requires proposal not already accepted ... ok (697ms)
Query: \_getProposal and \_getProposalsByOwner functionality ... ok (694ms)

ERRORS

Action: accept - requires matching proposal based on owner, risky, and alternatives => ./src/concepts/SwapSuggestions/SwapSuggestionsConcept.test.ts:199:6
error: Leaks detected:

* An async operation to connect to a TCP server was started in this test, but never completed. This is often caused by not awaiting a `Deno.connect` call.
  To get more details where leaks occurred, run again with the --trace-leaks flag.

Action: accept - requires requester to be the owner => ./src/concepts/SwapSuggestions/SwapSuggestionsConcept.test.ts:309:6
error: Leaks detected:

* A TCP connection was opened/accepted during the test, but not closed during the test. Close the TCP connection by calling `tcpConn.close()`.
* An async operation to connect to a TCP server was started before the test, but completed during the test. Async operations should not complete in a test if they were not started in that test. This is often caused by not awaiting a `Deno.connect` call.
  To get more details where leaks occurred, run again with the --trace-leaks flag.

FAILURES

Action: accept - requires matching proposal based on owner, risky, and alternatives => ./src/concepts/SwapSuggestions/SwapSuggestionsConcept.test.ts:199:6
Action: accept - requires requester to be the owner => ./src/concepts/SwapSuggestions/SwapSuggestionsConcept.test.ts:309:6

FAILED | 33 passed (39 steps) | 2 failed (29s)

error: Test failed
