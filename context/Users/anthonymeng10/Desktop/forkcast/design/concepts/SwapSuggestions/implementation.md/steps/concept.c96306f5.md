---
timestamp: 'Fri Nov 07 2025 01:05:24 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010524.ed39e9a5.md]]'
content_id: c96306f5f7a39824d04ef7a2ad41885dc4615df18b6b046bd955ee141ec2d798
---

# concept: SwapSuggestions

**concept** SwapSuggestions \[User, Signal, Alternative]

**purpose** Propose practical alternatives when an insight indicates risk.

**principle** When a signal is negatively associated with an outcome at sufficient confidence, the system proposes safer alternatives; the user may accept a proposal.

**state**
a set of Proposals with
an owner User
a risky set of Signal
an alternatives set of Alternative
a rationale String
an accepted Flag

**actions**
propose (owner: User, risky: set of Signal, alternatives: set of Alternative, rationale: String): (proposal: ID)
**requires** true
**effects** Creates a new Proposal `p` with the given `owner`, `risky` signals, `alternatives`, and `rationale`. The `accepted` flag of `p` is initialized to false. Returns the ID of the new proposal `p`.

accept (requester: User, owner: User, risky: set of Signal, alternatives: set of Alternative)
**requires** A proposal `p` exists with the given `owner`, `risky` signals, and `alternatives`. The `requester` must be the same as the proposal's `owner`. The proposal `p` must not already be accepted.
**effects** Sets the `accepted` flag of proposal `p` to true.

**queries**
\_getProposal (proposalId: ID): (proposal: Proposal)
**requires** true
**effects** Returns the proposal matching `proposalId`, if it exists.

\_getProposalsByOwner (owner: User): (proposal: Proposal)
**requires** true
**effects** Returns all proposals owned by the specified `owner`.
