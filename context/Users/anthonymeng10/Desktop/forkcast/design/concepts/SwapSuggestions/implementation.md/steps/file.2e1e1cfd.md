---
timestamp: 'Fri Nov 07 2025 01:05:24 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010524.ed39e9a5.md]]'
content_id: 2e1e1cfd95745d53cc77896a77610b76e5dbb5c866281683c3f484927ea48a62
---

# file: src/SwapSuggestions/SwapSuggestionsConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "SwapSuggestions.";

// Generic types for this concept
type User = ID;
type Signal = ID;
type Alternative = ID;

/**
 * a set of Proposals with
 *   an owner User
 *   a risky set of Signal
 *   an alternatives set of Alternative
 *   a rationale String
 *   an accepted Flag
 */
interface Proposal {
  _id: ID;
  owner: User;
  risky: Signal[];
  alternatives: Alternative[];
  rationale: string;
  accepted: boolean;
}

/**
 * @concept SwapSuggestions
 * @purpose Propose practical alternatives when an insight indicates risk.
 * @principle When a signal is negatively associated with an outcome at sufficient confidence, the system proposes safer alternatives; the user may accept a proposal.
 */
export default class SwapSuggestionsConcept {
  proposals: Collection<Proposal>;

  constructor(private readonly db: Db) {
    this.proposals = this.db.collection<Proposal>(PREFIX + "proposals");
  }

  /**
   * propose (owner: User, risky: set of Signal, alternatives: set of Alternative, rationale: String): (proposal: ID)
   *
   * **requires** true
   * **effects** Creates a new Proposal `p` with the given `owner`, `risky` signals, `alternatives`, and `rationale`.
   *           The `accepted` flag of `p` is initialized to false. Returns the ID of the new proposal `p`.
   */
  async propose(
    params: {
      owner: User;
      risky: Signal[];
      alternatives: Alternative[];
      rationale: string;
    },
  ): Promise<{ proposal: ID } | { error: string }> {
    try {
      const newProposal: Proposal = {
        _id: freshID(),
        owner: params.owner,
        risky: params.risky,
        alternatives: params.alternatives,
        rationale: params.rationale,
        accepted: false,
      };

      await this.proposals.insertOne(newProposal);
      return { proposal: newProposal._id };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return { error: `Failed to create proposal: ${errorMessage}` };
    }
  }

  /**
   * accept (requester: User, owner: User, risky: set of Signal, alternatives: set of Alternative)
   *
   * **requires** A proposal `p` exists with the given `owner`, `risky` signals, and `alternatives`.
   *            The `requester` must be the same as the proposal's `owner`.
   *            The proposal `p` must not already be accepted.
   * **effects** Sets the `accepted` flag of proposal `p` to true.
   */
  async accept(
    params: {
      requester: User;
      owner: User;
      risky: Signal[];
      alternatives: Alternative[];
    },
  ): Promise<Empty | { error: string }> {
    const { requester, owner, risky, alternatives } = params;

    // Note: Finding a proposal by its content is brittle. A better design
    // would be to accept a proposal by its unique ID.
    // However, behavior is preserved as requested.
    const proposal = await this.proposals.findOne({
      owner,
      risky,
      alternatives,
    });

    if (!proposal) {
      return { error: "No matching proposal found." };
    }

    if (requester !== proposal.owner) {
      return { error: "Only the owner can accept their proposal." };
    }

    if (proposal.accepted) {
      return { error: "Proposal is already accepted." };
    }

    try {
      await this.proposals.updateOne(
        { _id: proposal._id },
        { $set: { accepted: true } },
      );
      return {};
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      return { error: `Failed to accept proposal: ${errorMessage}` };
    }
  }

  /**
   * _getProposal (proposalId: ID): (proposal: Proposal)
   *
   * **requires** true
   * **effects** Returns the proposal matching `proposalId`, if it exists.
   */
  async _getProposal(
    params: { proposalId: ID },
  ): Promise<Proposal[]> {
    // Queries must always return an array.
    return await this.proposals.find({ _id: params.proposalId }).limit(1).toArray();
  }

  /**
   * _getProposalsByOwner (owner: User): (proposal: Proposal)
   *
   * **requires** true
   * **effects** Returns all proposals owned by the specified `owner`.
   */
  async _getProposalsByOwner(
    params: { owner: User },
  ): Promise<Proposal[]> {
    return await this.proposals.find({ owner: params.owner }).toArray();
  }
}
```
