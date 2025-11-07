---
timestamp: 'Fri Nov 07 2025 01:03:57 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_010357.f1f4d067.md]]'
content_id: b0d82f5f806116988654aa284b519f5251ee58e762198541f22748f6d87f86b5
---

# file: src/concepts/SwapSuggestions/SwapSuggestionsConcept.ts

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
 * @principle When a signal is negatively associated with an outcome at sufficient confidence, the system proposes safer alternatives; the user may accept a proposal.
 */
export default class SwapSuggestionsConcept {
  proposals: Collection<Proposal>;

  constructor(private readonly db: Db) {
    this.proposals = this.db.collection<Proposal>(PREFIX + "proposals");
  }

  /**
   * propose (owner: User, risky: Signal[], alternatives: Alternative[], rationale: String): (proposal: ID)
   *
   * @requires true
   * @effects Creates a new Proposal with the given details, initialized as not 'accepted', and returns its unique ID.
   */
  async propose(
    params: {
      owner: User;
      risky: Signal[];
      alternatives: Alternative[];
      rationale: string;
    },
  ): Promise<{ proposal: ID } | { error: string }> {
    const { owner, risky, alternatives, rationale } = params;

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
   * @requires A proposal with the given ID must exist, the requester must be the proposal's owner, and the proposal must not already be accepted.
   * @effects Sets the 'accepted' flag of the specified proposal to true.
   */
  async accept(
    params: {
      requester: User;
      proposal: ID;
    },
  ): Promise<Empty | { error: string }> {
    const { requester, proposal: proposalId } = params;

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
   * _getProposal (proposalId: ID): (proposal: Proposal)
   *
   * @requires A proposal with the given ID exists.
   * @effects Returns an array containing the proposal document.
   */
  async _getProposal(params: { proposalId: ID }): Promise<Proposal[]> {
    const { proposalId } = params;
    const proposal = await this.proposals.findOne({ _id: proposalId });
    return proposal ? [proposal] : [];
  }

  /**
   * _getProposalsByOwner (owner: User): (proposal: Proposal)
   *
   * @requires User exists.
   * @effects Returns an array of all proposals created by the specified owner.
   */
  async _getProposalsByOwner(params: { owner: User }): Promise<Proposal[]> {
    const { owner } = params;
    return await this.proposals.find({ owner }).toArray();
  }
}
```
