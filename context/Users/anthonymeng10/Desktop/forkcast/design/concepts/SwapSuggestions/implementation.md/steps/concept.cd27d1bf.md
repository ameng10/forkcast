---
timestamp: 'Fri Nov 07 2025 01:07:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010754.21a2a691.md]]'
content_id: cd27d1bf7a56634bc534f2f386202a39d66525e6a9b8d95299910b6d38c5ebe3
---

# concept: SwapSuggestions

**concept** SwapSuggestions \[User, Signal, Alternative]

**purpose** Propose practical alternatives when an insight indicates risk.

**principle** When a signal is negatively associated with an outcome at sufficient confidence, the system proposes safer alternatives; the user may accept a proposal by its ID, and it will be marked as accepted.

**state**

```
a set of Proposals with
  an owner User
  a risky set of Signal
  an alternatives set of Alternative
  a rationale String
  an accepted Flag
```

**actions**

```
propose (owner: User, risky: set of Signal, alternatives: set of Alternative, rationale: String): (proposal: ID)
propose (owner: User, risky: set of Signal, alternatives: set of Alternative, rationale: String): (error: String)

accept (requester: User, proposal: ID)
accept (requester: User, proposal: ID): (error: String)
```

**queries**

```
_getProposal (proposal: ID): (proposal: Proposal)

_getProposalsByOwner (owner: User): (proposal: Proposal)
```
