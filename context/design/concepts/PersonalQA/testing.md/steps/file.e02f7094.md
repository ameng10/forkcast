---
timestamp: 'Thu Oct 16 2025 22:56:07 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251016_225607.63a72041.md]]'
content_id: e02f7094f630d245ec89ffc5d807391c51206ee37b25c66c7d85a6c0a75d42e5
---

# file: src/personalqa/PersonalQAConcept.test.ts

```typescript
import { assertEquals, assertNotEquals, assertExists } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts"; // Assuming testDb is set up for MongoDB
import { ID } from "@utils/types.ts";
import PersonalQAConcept from "./PersonalQAConcept.ts";

// Define some constant IDs for testing
const aliceId: ID = "user:Alice";
const bobId: ID = "user:Bob";
const charlieId: ID = "user:Charlie";

enum FactSource {
  MEAL = "meal",
  CHECK_IN = "check_in",
  INSIGHT = "insight",
  BEHAVIOR = "behavior",
}

Deno.test("Principle: Assistant answers user's questions using their facts", async () => {
  const [db, client] = await testDb();
  const personalQA = new PersonalQAConcept(db);

  try {
    // 1. Ingest facts for Alice
    const fact1Result = await personalQA.ingestFact({ owner: aliceId, at: new Date(), content: "late_night + fried food linked to lower energy", source: FactSource.INSIGHT });
    assertNotEquals("error" in fact1Result, true, "Fact ingestion should not fail.");
    const fact1Id = (fact1Result as { fact: ID }).fact;
    assertExists(fact1Id);

    const fact2Result = await personalQA.ingestFact({ owner: aliceId, at: new Date(), content: "drank 2L water, felt focused and hydrated", source: FactSource.CHECK_IN });
    assertNotEquals("error" in fact2Result, true, "Fact ingestion should not fail.");
    const fact2Id = (fact2Result as { fact: ID }).fact;
    assertExists(fact2Id);

    // Verify facts were ingested
    const aliceFacts = await personalQA._getUserFacts({ owner: aliceId });
    assertEquals(aliceFacts.length, 2, "Alice should have 2 facts.");
    assertEquals(aliceFacts.some(f => f._id === fact1Id), true, "Fact 1 should exist for Alice.");
    assertEquals(aliceFacts.some(f => f._id === fact2Id), true, "Fact 2 should exist for Alice.");

    // 2. Alice asks a question based on her facts
    const question1 = "What have I learned about my energy?";
    const askResult1 = await personalQA.ask({ requester: aliceId, question: question1 });
    assertExists(askResult1.answer, "An answer should be provided.");
    assertExists(askResult1.citedFacts, "Cited facts should be provided.");
    assertNotEquals(askResult1.citedFacts.length, 0, "At least one fact should be cited for a relevant question.");
    assertEquals(askResult1.citedFacts.includes(fact1Id), true, "Fact 1 should be cited for energy question.");
    assertEquals(askResult1.answer.includes("late_night + fried food linked to lower energy"), true, "Answer should contain content from relevant fact.");

    // Verify QA was stored
    const aliceQAs = await personalQA._getUserQAs({ owner: aliceId });
    assertEquals(aliceQAs.length, 1, "Alice should have 1 Q&A entry.");
    assertEquals(aliceQAs[0].question, question1, "Stored QA should match the asked question.");
    assertEquals(aliceQAs[0].citedFacts.includes(fact1Id), true, "Stored QA should cite relevant fact.");

    // 3. Alice asks another question, citing another fact
    const question2 = "How does hydration affect me?";
    const askResult2 = await personalQA.ask({ requester: aliceId, question: question2 });
    assertNotEquals(askResult2.citedFacts.length, 0, "At least one fact should be cited for a relevant question.");
    assertEquals(askResult2.citedFacts.includes(fact2Id), true, "Fact 2 should be cited for hydration question.");
    assertEquals(askResult2.answer.includes("felt focused and hydrated"), true, "Answer should contain content from relevant fact.");

    // Verify total QAs
    const updatedAliceQAs = await personalQA._getUserQAs({ owner: aliceId });
    assertEquals(updatedAliceQAs.length, 2, "Alice should now have 2 Q&A entries.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: ingestFact successfully adds a fact", async () => {
  const [db, client] = await testDb();
  const personalQA = new PersonalQAConcept(db);

  try {
    const initialFacts = await personalQA._getUserFacts({ owner: bobId });
    assertEquals(initialFacts.length, 0, "Bob should have no facts initially.");

    const factResult = await personalQA.ingestFact({ owner: bobId, at: new Date(), content: "meditated for 10 mins", source: FactSource.BEHAVIOR });
    assertNotEquals("error" in factResult, true, "Fact ingestion should succeed.");
    const factId = (factResult as { fact: ID }).fact;
    assertExists(factId, "A fact ID should be returned.");

    const updatedFacts = await personalQA._getUserFacts({ owner: bobId });
    assertEquals(updatedFacts.length, 1, "Bob should now have 1 fact.");
    assertEquals(updatedFacts[0].content, "meditated for 10 mins", "Fact content should match.");
    assertEquals(updatedFacts[0].source, FactSource.BEHAVIOR, "Fact source should match.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: forgetFact enforces requirements (owner and requester match)", async () => {
  const [db, client] = await testDb();
  const personalQA = new PersonalQAConcept(db);

  try {
    // Ingest a fact for Alice
    const factResult = await personalQA.ingestFact({ owner: aliceId, at: new Date(), content: "ate spinach", source: FactSource.MEAL });
    const aliceFactId = (factResult as { fact: ID }).fact;

    // Test Case 1: Non-existent fact
    const nonExistentFactId = "fact:nonexistent" as ID;
    const error1 = await personalQA.forgetFact({ requester: aliceId, owner: aliceId, factId: nonExistentFactId });
    assertEquals("error" in error1, true, "Forgetting a non-existent fact should return an error.");
    assertEquals((error1 as { error: string }).error, `Fact with ID '${nonExistentFactId}' not found.`);

    // Test Case 2: Requester is not the owner
    const error2 = await personalQA.forgetFact({ requester: bobId, owner: aliceId, factId: aliceFactId });
    assertEquals("error" in error2, true, "Requester not being owner should return an error.");
    assertEquals((error2 as { error: string }).error, `Requester '${bobId}' is not the owner '${aliceId}' of fact ID '${aliceFactId}'.`);

    // Test Case 3: Fact is not owned by the specified owner
    const bobFactResult = await personalQA.ingestFact({ owner: bobId, at: new Date(), content: "ate salad", source: FactSource.MEAL });
    const bobFactId = (bobFactResult as { fact: ID }).fact;
    const error3 = await personalQA.forgetFact({ requester: aliceId, owner: aliceId, factId: bobFactId }); // Alice tries to forget Bob's fact, but specifies herself as owner
    assertEquals("error" in error3, true, "Fact not owned by specified owner should return an error.");
    assertEquals((error3 as { error: string }).error, `Fact with ID '${bobFactId}' is not owned by user '${aliceId}'.`);

    // Test Case 4: Valid deletion
    const initialAliceFacts = await personalQA._getUserFacts({ owner: aliceId });
    assertEquals(initialAliceFacts.length, 1, "Alice should have 1 fact before deletion.");
    const success = await personalQA.forgetFact({ requester: aliceId, owner: aliceId, factId: aliceFactId });
    assertEquals("error" in success, false, "Valid deletion should succeed.");

    const updatedAliceFacts = await personalQA._getUserFacts({ owner: aliceId });
    assertEquals(updatedAliceFacts.length, 0, "Alice should have 0 facts after deletion.");

  } finally {
    await client.close();
  }
});

Deno.test("Action: ask correctly generates answers and stores QAs", async () => {
  const [db, client] = await testDb();
  const personalQA = new PersonalQAConcept(db);

  try {
    // Ingest facts for Charlie
    const factA_Result = await personalQA.ingestFact({ owner: charlieId, at: new Date(), content: "high protein breakfasts lead to sustained energy", source: FactSource.INSIGHT });
    const factA_Id = (factA_Result as { fact: ID }).fact;
    const factB_Result = await personalQA.ingestFact({ owner: charlieId, at: new Date(), content: "avoiding sugar crashes prevents afternoon slump", source: FactSource.BEHAVIOR });
    const factB_Id = (factB_Result as { fact: ID }).fact;
    await personalQA.ingestFact({ owner: charlieId, at: new Date(), content: "ran 5k, felt refreshed", source: FactSource.CHECK_IN });

    // Scenario 1: Question with relevant facts
    const question1 = "What helps with energy?";
    const askResult1 = await personalQA.ask({ requester: charlieId, question: question1 });
    assertNotEquals("error" in askResult1, true, "Asking a question should not return an error.");
    assertExists(askResult1.answer, "An answer should be returned.");
    assertNotEquals(askResult1.citedFacts.length, 0, "Relevant facts should be cited.");
    assertEquals(askResult1.answer.includes(factA_Result.fact), false, "Answer text should not contain the Fact ID."); // Check for content, not ID directly
    assertEquals(askResult1.answer.includes("high protein breakfasts"), true);
    assertEquals(askResult1.answer.includes("avoiding sugar crashes"), true);
    assertEquals(askResult1.citedFacts.includes(factA_Id), true);
    assertEquals(askResult1.citedFacts.includes(factB_Id), true);

    const charlieQAs1 = await personalQA._getUserQAs({ owner: charlieId });
    assertEquals(charlieQAs1.length, 1, "One QA entry should be stored.");
    assertEquals(charlieQAs1[0].question, question1);
    assertEquals(charlieQAs1[0].answer, askResult1.answer);
    assertEquals(charlieQAs1[0].citedFacts.length, 2);

    // Scenario 2: Question with no directly relevant facts, but user has facts
    const question2 = "What should I eat for lunch?";
    const askResult2 = await personalQA.ask({ requester: charlieId, question: question2 });
    assertNotEquals("error" in askResult2, true, "Asking a question should not return an error.");
    assertExists(askResult2.answer, "An answer should be returned.");
    assertEquals(askResult2.citedFacts.length, 0, "No facts should be cited for an irrelevant question.");
    assertEquals(askResult2.answer.includes("couldn't find enough information"), true, "Answer should indicate lack of info.");
    assertEquals(askResult2.answer.includes("3 facts recorded for you"), true, "Answer should indicate number of facts available.");


    const charlieQAs2 = await personalQA._getUserQAs({ owner: charlieId });
    assertEquals(charlieQAs2.length, 2, "Two QA entries should be stored.");

    // Scenario 3: User with no facts asks a question
    const question3 = "Tell me about my sleep.";
    const askResult3 = await personalQA.ask({ requester: bobId, question: question3 });
    assertNotEquals("error" in askResult3, true, "Asking a question should not return an error.");
    assertExists(askResult3.answer, "An answer should be returned.");
    assertEquals(askResult3.citedFacts.length, 0, "No facts should be cited for a user with no facts.");
    assertEquals(askResult3.answer.includes("couldn't find enough information"), true, "Answer should indicate lack of info.");
    assertEquals(askResult3.answer.includes("0 facts recorded for you"), true, "Answer should indicate number of facts available.");

    const bobQAs = await personalQA._getUserQAs({ owner: bobId });
    assertEquals(bobQAs.length, 1, "One QA entry should be stored for Bob.");

  } finally {
    await client.close();
  }
});
```
