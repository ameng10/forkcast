---
timestamp: 'Sun Oct 19 2025 16:01:22 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160122.777e2d0f.md]]'
content_id: 5c053e8221a4ba5a89348b6ca42c05376a219966d98d29d672c1622667c294d8
---

# solution:

To safely access the `message` property (or any other property) from the `e` variable in a `catch` block, we need to first check if `e` is an instance of `Error`. If it is, we can then confidently access `e.message`. If it's not an `Error` object, we can convert it to a string using `String(e)` to provide a generic error message, ensuring the application doesn't crash due to type safety issues and still provides useful feedback.

The updated `catch` blocks in both `propose` and `accept` actions now include this type-guarding logic.

```typescript
// file: src/SwapSuggestions/SwapSuggestionsConcept.ts

import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

const PREFIX = "SwapSuggestions.";

type User = ID;
type Signal = ID;
type Alternative = ID;

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

  async propose(params: {
    owner: User;
    risky: Signal[];
    alternatives: Alternative[];
    rationale: string;
  }): Promise<Empty | { error: string }> {
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
      return {};
    } catch (e) {
      console.error("Error proposing swap suggestion:", e);
      // Debug: 'e' is of type 'unknown'.deno-ts(18046) - Fixed here
      const errorMessage = e instanceof Error ? e.message : String(e);
      return { error: `Failed to create proposal: ${errorMessage}` };
    }
  }

  async accept(params: {
    requester: User;
    owner: User;
    risky: Signal[];
    alternatives: Alternative[];
  }): Promise<Empty | { error: string }> {
    const { requester, owner, risky, alternatives } = params;

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
      console.error("Error accepting swap suggestion:", e);
      // Debug: 'e' is of type 'unknown'.deno-ts(18046) - Fixed here
      const errorMessage = e instanceof Error ? e.message : String(e);
      return { error: `Failed to accept proposal: ${errorMessage}` };
    }
  }

  async _getProposal(params: { proposalId: ID }): Promise<Proposal | null> {
    const { proposalId } = params;
    return await this.proposals.findOne({ _id: proposalId });
  }

  async _getProposalsByOwner(params: {
    owner: User;
  }): Promise<Proposal[]> {
    const { owner } = params;
    return await this.proposals.find({ owner }).toArray();
  }
}
```
