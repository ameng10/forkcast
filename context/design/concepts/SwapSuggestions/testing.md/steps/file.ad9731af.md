---
timestamp: 'Sun Oct 19 2025 16:02:14 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160214.3be920ea.md]]'
content_id: ad9731aff472d49279c74b12369630a4b6eaf3863e0ffdc924a0731b4be908da
---

# file: src/SwapSuggestions/SwapSuggestionsConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import SwapSuggestionsConcept from "./SwapSuggestionsConcept.ts";

// --- Test Data ---
const authorA = "user:Alice" as ID;
const requesterA = authorA; // For simplicity, owner is also requester
const authorB = "user:Bob" as ID;
const requesterB = authorB;

const signalRiskHighCpu = "signal:HighCpuUsage" as ID;
const signalRiskMemoryLeak = "signal:MemoryLeak" as ID;
const signalRiskDbSlow = "signal:DatabaseSlow" as ID;

const altUpgradePlan = "alternative:UpgradeSubscriptionPlan" as ID;
const altOptimizeCode = "alternative:OptimizeApplicationCode" as ID;
const altAddIndex = "alternative:AddDatabaseIndex" as ID;
const altChangeProvider = "alternative:ChangeCloudProvider" as ID;

const rationaleCpu = "High CPU usage detected, suggesting code optimization or plan upgrade.";
const rationaleDb = "Slow database queries, suggesting adding an index or changing provider.";
const rationaleMemory = "Memory leaks detected, suggesting code optimization.";


Deno.test("Principle: Propose and Accept a Swap Suggestion lifecycle", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    // 1. Author A proposes a swap suggestion
    console.log("Trace: Author A proposes a swap suggestion.");
    const proposeResult = await concept.propose({
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode, altUpgradePlan],
      rationale: rationaleCpu,
    });
    assertNotEquals("error" in proposeResult, true, `Propose should succeed: ${JSON.stringify(proposeResult)}`);

    const proposalsInitial = await concept._getProposalsByOwner({ owner: authorA });
    assertEquals(proposalsInitial.length, 1, "There should be one proposal for authorA.");
    const proposal = proposalsInitial[0];
    assertExists(proposal._id, "Proposal ID should exist.");
    assertEquals(proposal.owner, authorA, "Proposal owner should be authorA.");
    assertEquals(proposal.risky, [signalRiskHighCpu], "Risky signals should match.");
    // assertArrayIncludes checks if all elements are present, order not strictly enforced for comparison
    assertArrayIncludes(proposal.alternatives, [altOptimizeCode, altUpgradePlan], "Alternatives should match.");
    assertEquals(proposal.rationale, rationaleCpu, "Rationale should match.");
    assertEquals(proposal.accepted, false, "Proposal should initially be unaccepted.");
    console.log("Trace: Proposal created and verified as unaccepted.");

    // 2. Author A (owner) accepts their own proposal
    console.log("Trace: Author A accepts their own proposal.");
    const acceptResult = await concept.accept({
      requester: requesterA,
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode, altUpgradePlan], // Must match exactly including order
    });
    assertNotEquals("error" in acceptResult, true, `Accept should succeed: ${JSON.stringify(acceptResult)}`);

    // 3. Verify the proposal is now accepted
    console.log("Trace: Verifying proposal is accepted.");
    const updatedProposal = await concept._getProposal({ proposalId: proposal._id });
    assertExists(updatedProposal, "The proposal should still exist.");
    assertEquals(updatedProposal?.accepted, true, "The proposal should now be accepted.");
    console.log("Trace: Proposal successfully accepted and verified.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: propose - successful creation of proposals with various data", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    // Test 1: Basic proposal
    const result1 = await concept.propose({
      owner: authorA,
      risky: [signalRiskDbSlow],
      alternatives: [altAddIndex],
      rationale: rationaleDb,
    });
    assertNotEquals("error" in result1, true, `Propose should succeed for basic proposal: ${JSON.stringify(result1)}`);

    // Test 2: Proposal with multiple risky signals and alternatives
    const result2 = await concept.propose({
      owner: authorA,
      risky: [signalRiskMemoryLeak, signalRiskHighCpu],
      alternatives: [altOptimizeCode, altUpgradePlan, altChangeProvider],
      rationale: "Multiple issues and options.",
    });
    assertNotEquals("error" in result2, true, `Propose should succeed for multiple items: ${JSON.stringify(result2)}`);

    // Test 3: Proposal by a different owner
    const result3 = await concept.propose({
      owner: authorB,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
      rationale: "Bob's proposal.",
    });
    assertNotEquals("error" in result3, true, `Propose should succeed for different owner: ${JSON.stringify(result3)}`);

    const proposalsA = await concept._getProposalsByOwner({ owner: authorA });
    assertEquals(proposalsA.length, 2, "AuthorA should have two proposals.");
    const proposalsB = await concept._getProposalsByOwner({ owner: authorB });
    assertEquals(proposalsB.length, 1, "AuthorB should have one proposal.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: propose - with empty risky/alternatives arrays (edge case)", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    const result = await concept.propose({
      owner: authorA,
      risky: [], // Empty risky
      alternatives: [], // Empty alternatives
      rationale: "No specific risky signal or alternative, just a placeholder proposal.",
    });
    assertNotEquals("error" in result, true, `Propose with empty arrays should succeed: ${JSON.stringify(result)}`);

    const proposals = await concept._getProposalsByOwner({ owner: authorA });
    assertEquals(proposals.length, 1, "Should have one proposal with empty arrays.");
    assertEquals(proposals[0].risky.length, 0, "Risky array should be empty.");
    assertEquals(proposals[0].alternatives.length, 0, "Alternatives array should be empty.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: accept - requires matching proposal based on owner, risky, and alternatives", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    // Create a proposal
    await concept.propose({
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
      rationale: rationaleCpu,
    });
    const { _id: originalProposalId } = (await concept._getProposalsByOwner({ owner: authorA }))[0];

    // Test 1: No matching proposal found (different owner in criteria)
    const noMatchOwnerResult = await concept.accept({
      requester: requesterB, // Different requester, but search by authorB
      owner: authorB, // This owner does not have a matching proposal
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
    });
    assertEquals("error" in noMatchOwnerResult, true, "Should fail if no matching proposal for owner criteria.");
    assertEquals((noMatchOwnerResult as { error: string }).error, "No matching proposal found.");

    // Test 2: No matching proposal found (different risky signals in criteria)
    const noMatchRiskyResult = await concept.accept({
      requester: requesterA,
      owner: authorA,
      risky: [signalRiskMemoryLeak], // Different risky signal array
      alternatives: [altOptimizeCode],
    });
    assertEquals("error" in noMatchRiskyResult, true, "Should fail if risky signals array doesn't match.");
    assertEquals((noMatchRiskyResult as { error: string }).error, "No matching proposal found.");

    // Test 3: No matching proposal found (different alternatives in criteria)
    const noMatchAlternativesResult = await concept.accept({
      requester: requesterA,
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altChangeProvider], // Different alternative array
    });
    assertEquals("error" in noMatchAlternativesResult, true, "Should fail if alternatives array doesn't match.");
    assertEquals((noMatchAlternativesResult as { error: string }).error, "No matching proposal found.");

    // Test 4: Array order matters (potential "failure" of Set() semantics)
    // The spec uses `Set(Signal)` implying order-independence. However, MongoDB's `findOne` for arrays is order-sensitive.
    // This test confirms that the current implementation requires exact array match, including order.
    await concept.propose({
      owner: authorB,
      risky: [signalRiskMemoryLeak, signalRiskDbSlow],
      alternatives: [altOptimizeCode, altAddIndex],
      rationale: "Multi-item proposal for order test",
    });
    const { _id: multiRiskyProposalId } = (await concept._getProposalsByOwner({ owner: authorB }))[0];

    // Attempt to accept with same elements, but different order
    const differentOrderResult = await concept.accept({
      requester: requesterB,
      owner: authorB,
      risky: [signalRiskDbSlow, signalRiskMemoryLeak], // Order is different from creation
      alternatives: [altAddIndex, altOptimizeCode], // Order is different from creation
    });
    assertEquals("error" in differentOrderResult, true, "Accept should fail if array order differs for 'risky' or 'alternatives'. This highlights the difference between concept 'Set()' and MongoDB array matching.");
    assertEquals((differentOrderResult as { error: string }).error, "No matching proposal found.", "Error message should indicate no match due to array mismatch.");

    // Verify the original proposal for authorA is still unaccepted
    const originalProposal = await concept._getProposal({ proposalId: originalProposalId });
    assertEquals(originalProposal?.accepted, false, "Original proposal should remain unaccepted after failed attempts.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: accept - requires requester to be the owner", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    // Create a proposal by authorA
    await concept.propose({
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
      rationale: rationaleCpu,
    });
    const { _id: proposalId } = (await concept._getProposalsByOwner({ owner: authorA }))[0];

    // Attempt to accept by a different user (authorB)
    const result = await concept.accept({
      requester: requesterB, // Author B is trying to accept A's proposal
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
    });
    assertEquals("error" in result, true, "Non-owner should not be able to accept a proposal.");
    assertEquals((result as { error: string }).error, "Only the owner can accept their proposal.");

    // Verify it's still not accepted
    const updatedProposal = await concept._getProposal({ proposalId });
    assertEquals(updatedProposal?.accepted, false, "Proposal should still be unaccepted.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: accept - requires proposal not already accepted", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    // Create and then successfully accept a proposal
    await concept.propose({
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
      rationale: rationaleCpu,
    });
    const { _id: proposalId } = (await concept._getProposalsByOwner({ owner: authorA }))[0];

    await concept.accept({
      requester: requesterA,
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
    });

    const acceptedProposal = await concept._getProposal({ proposalId });
    assertEquals(acceptedProposal?.accepted, true, "Proposal should be accepted after first successful call.");

    // Attempt to accept the same (already accepted) proposal again
    const result = await concept.accept({
      requester: requesterA,
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
    });
    assertEquals("error" in result, true, "Should fail if proposal is already accepted.");
    assertEquals((result as { error: string }).error, "Proposal is already accepted.");

    // Verify it remains accepted (no unintended state changes)
    const finalProposal = await concept._getProposal({ proposalId });
    assertEquals(finalProposal?.accepted, true, "Proposal should remain accepted.");
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getProposal and _getProposalsByOwner functionality", async () => {
  const [db, client] = await testDb();
  const concept = new SwapSuggestionsConcept(db);

  try {
    // Setup multiple proposals for different owners
    await concept.propose({
      owner: authorA,
      risky: [signalRiskHighCpu],
      alternatives: [altOptimizeCode],
      rationale: "R1",
    });
    const { _id: proposalId1 } = (await concept._getProposalsByOwner({ owner: authorA }))[0];

    await concept.propose({
      owner: authorA,
      risky: [signalRiskMemoryLeak],
      alternatives: [altUpgradePlan],
      rationale: "R2",
    });
    // Need to re-query to get the new proposal for authorA, or specifically query the second one
    const proposalsA_after2 = await concept._getProposalsByOwner({ owner: authorA });
    const proposalId2 = proposalsA_after2.find(p => p.rationale === "R2")?._id as ID;
    assertExists(proposalId2, "Should find ID for proposal R2.");


    await concept.propose({
      owner: authorB,
      risky: [signalRiskDbSlow],
      alternatives: [altAddIndex],
      rationale: "R3",
    });
    const { _id: proposalId3 } = (await concept._getProposalsByOwner({ owner: authorB }))[0];

    // _getProposal - existing
    const foundProposal1 = await concept._getProposal({ proposalId: proposalId1 });
    assertExists(foundProposal1, "Should find proposal 1 by ID.");
    assertEquals(foundProposal1?.owner, authorA);
    assertEquals(foundProposal1?.rationale, "R1");

    const foundProposal3 = await concept._getProposal({ proposalId: proposalId3 });
    assertExists(foundProposal3, "Should find proposal 3 by ID.");
    assertEquals(foundProposal3?.owner, authorB);
    assertEquals(foundProposal3?.rationale, "R3");

    // _getProposal - non-existent
    const nonExistentProposal = await concept._getProposal({ proposalId: "proposal:fake" as ID });
    assertEquals(nonExistentProposal, null, "Should return null for non-existent proposal ID.");

    // _getProposalsByOwner - existing owner with multiple proposals
    const proposalsA = await concept._getProposalsByOwner({ owner: authorA });
    assertEquals(proposalsA.length, 2, "Should retrieve 2 proposals for authorA.");
    assertArrayIncludes(proposalsA.map(p => p.rationale), ["R1", "R2"]);

    // _getProposalsByOwner - existing owner with one proposal
    const proposalsB = await concept._getProposalsByOwner({ owner: authorB });
    assertEquals(proposalsB.length, 1, "Should retrieve 1 proposal for authorB.");
    assertEquals(proposalsB[0].rationale, "R3");

    // _getProposalsByOwner - non-existent owner
    const proposalsC = await concept._getProposalsByOwner({ owner: "user:Carlos" as ID });
    assertEquals(proposalsC.length, 0, "Should retrieve 0 proposals for non-existent owner.");

  } finally {
    await client.close();
  }
});
```
