---
timestamp: 'Fri Nov 07 2025 01:03:57 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010357.f1f4d067.md]]'
content_id: caa360e204b990d406adf0c7bb981895d4050a41b84b4d0c99c188d0f2612cde
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
propose (owner: User, risky: Signal\[], alternatives: Alternative\[], rationale: String): (proposal: ID)
accept (requester: User, proposal: ID)

**queries**
\_getProposal (proposalId: ID): (proposal: Proposal)
\_getProposalsByOwner (owner: User): (proposal: Proposal)
