### Concept: SwapSuggestions [User, Signal, Alternative]

**purpose** Propose practical alternatives when an insight indicates risk.

**principle** When a signal is negatively associated with an outcome at sufficient confidence, the system proposes safer alternatives; the user may accept a proposal.

**state**

- A set of Proposals with:
    - owner: User
    - risky: Set(Signal)
    - alternatives: Set(Alternative)
    - rationale: String
    - accepted: Flag

**actions**

- `propose(owner: User, risky: Set(Signal), alternatives: Set(Alternative), rationale: String)`
    - **effects:** add a proposal for owner
- `accept(requester: User, owner: User, risky: Set(Signal), alternatives: Set(Alternative))`
    - **requires:** matching proposal exists for owner and requester = owner
    - **effects:** set accepted = true