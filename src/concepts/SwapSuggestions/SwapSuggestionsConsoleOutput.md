running 7 tests from ./src/concepts/SwapSuggestions/SwapSuggestionsConcept.test.ts
Principle: Propose and Accept a Swap Suggestion lifecycle ... ok (660ms)
Action: propose - successful creation of proposals with various data ... ok (637ms)
Action: propose - with empty risky/alternatives arrays (edge case) ... ok (747ms)
Action: accept - requires matching proposal based on owner, risky, and alternatives ... ok (688ms)
Action: accept - requires requester to be the owner ... ok (676ms)
Action: accept - requires proposal not already accepted ... ok (862ms)
Query: _getProposal and _getProposalsByOwner functionality ... ok (748ms)
