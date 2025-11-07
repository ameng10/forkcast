---
timestamp: 'Fri Nov 07 2025 01:07:54 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010754.21a2a691.md]]'
content_id: def32db6e731718b5a4f10786a87985f16fcdf929a76a977143455a764c0c904
---

# file: src/SwapSuggestions/SwapSuggestionsConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "SwapSuggestions.";

// Generic types for the concept
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
   *
   * **effects** creates a new Proposal `p` with the given owner, risky signals, alternatives, and rationale; sets `accepted` to false; returns the ID of `p`.
   */
  async propose(
    { owner, risky, alternatives, rationale }: {
      owner: User;
      risky: Signal[];
      alternatives: Alternative[];
      rationale: string;
    },
  ): Promise<{ proposal: ID } | { error: string }> {
    try {
      const newProposal: Proposal = {
        _id: freshID(),
        owner,
        risky,
        alternatives,
        rationale,
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
   * accept (requester: User, proposal: ID)
   *
   * **requires** a Proposal with the given `proposal` ID exists, is not already accepted, and its owner is the `requester`.
   *
   * **effects** sets the `accepted` flag of the Proposal to true.
   */
  async accept(
    { requester, proposal: proposalId }: {
      requester: User;
      proposal: ID;
    },
  ): Promise<Empty | { error: string }> {
    const proposal = await this.proposals.findOne({
      _id: proposalId,
    });

    if (!proposal) {
      return { error: `Proposal with id ${proposalId} not found.` };
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
   * _getProposal (proposal: ID): (proposal: Proposal)
   *
   * **requires** true
   *
   * **effects** returns the proposal with the given ID, if it exists.
   */
  async _getProposal(
    { proposal: proposalId }: {
      proposal: ID;
    },
  ): Promise<Proposal[]> {
    const proposal = await this.proposals.findOne({ _id: proposalId });
    return proposal ? [proposal] : [];
  }

  /**
   * _getProposalsByOwner (owner: User): (proposal: Proposal)
   *
   * **requires** true
   *
   * **effects** returns all proposals created by the given owner.
   */
  async _getProposalsByOwner(
    { owner }: {
      owner: User;
    },
  ): Promise<Proposal[]> {
    return await this.proposals.find({ owner }).toArray();
  }
}
```
