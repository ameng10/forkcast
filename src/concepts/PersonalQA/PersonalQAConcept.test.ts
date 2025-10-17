import {
  assertArrayIncludes,
  assertEquals,
  assertExists,
  assertStringIncludes,
} from "@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import PersonalQAConcept, {
  FactSource,
} from "./PersonalQAConcept.ts";

const aliceId = "user:Alice" as ID;
const bobId = "user:Bob" as ID;
const charlieId = "user:Charlie" as ID;

Deno.test("Principle: assistant ingests facts and answers with citations", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);

  try {
    const energyFact = await concept.ingestFact({
      owner: aliceId,
      at: new Date("2024-01-10T08:00:00Z"),
      content: "Late-night fried food correlates with low morning energy.",
      source: FactSource.INSIGHT,
    });
    const hydrationFact = await concept.ingestFact({
      owner: aliceId,
      at: new Date("2024-01-11T08:00:00Z"),
      content: "Drinking 2L of water kept me focused.",
      source: FactSource.CHECK_IN,
    });

    const { answer, citedFacts } = await concept.ask({
      requester: aliceId,
      question: "What have my insights and check_in entries said about energy?",
    });

    assertStringIncludes(answer, "Late-night fried food correlates");
    assertStringIncludes(answer, "Drinking 2L of water kept me focused.");
    assertArrayIncludes(citedFacts, [energyFact.fact, hydrationFact.fact]);

    const storedQAs = await concept._getUserQAs({ owner: aliceId });
    assertEquals(storedQAs.length, 1);
    assertEquals(storedQAs[0].question,
      "What have my insights and check_in entries said about energy?");
    assertArrayIncludes(storedQAs[0].citedFacts, [
      energyFact.fact,
      hydrationFact.fact,
    ]);
  } finally {
    await client.close();
  }
});

Deno.test("Action: ingestFact stores fact for owner", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);

  try {
    const before = await concept._getUserFacts({ owner: bobId });
    assertEquals(before.length, 0);

    const result = await concept.ingestFact({
      owner: bobId,
      at: new Date("2024-02-01T09:30:00Z"),
      content: "Ate oatmeal with berries for breakfast.",
      source: FactSource.MEAL,
    });
    assertExists(result.fact);

    const after = await concept._getUserFacts({ owner: bobId });
    assertEquals(after.length, 1);
    assertEquals(after[0]._id, result.fact);
    assertEquals(after[0].source, FactSource.MEAL);
  } finally {
    await client.close();
  }
});

Deno.test("Action: forgetFact enforces ownership and removes fact", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);

  try {
    const aliceFact = await concept.ingestFact({
      owner: aliceId,
      at: new Date("2024-03-05T12:00:00Z"),
      content: "Tried a new salad recipe.",
      source: FactSource.MEAL,
    });

    const wrongOwner = await concept.forgetFact({
      requester: bobId,
      owner: aliceId,
      factId: aliceFact.fact,
    });
    assertEquals("error" in wrongOwner, true);

    const wrongFactOwner = await concept.forgetFact({
      requester: aliceId,
      owner: bobId,
      factId: aliceFact.fact,
    });
    assertEquals("error" in wrongFactOwner, true);

    const nonExistent = await concept.forgetFact({
      requester: aliceId,
      owner: aliceId,
      factId: "fact:missing" as ID,
    });
    assertEquals("error" in nonExistent, true);

    const success = await concept.forgetFact({
      requester: aliceId,
      owner: aliceId,
      factId: aliceFact.fact,
    });
    assertEquals("error" in success, false);

    const remaining = await concept._getUserFacts({ owner: aliceId });
    assertEquals(remaining.length, 0);
  } finally {
    await client.close();
  }
});

Deno.test("Action: ask returns relevant citations or guidance", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);

  try {
    const proteinFact = await concept.ingestFact({
      owner: charlieId,
      at: new Date("2024-04-02T07:00:00Z"),
      content: "High protein breakfasts keep energy stable.",
      source: FactSource.INSIGHT,
    });
    const sugarFact = await concept.ingestFact({
      owner: charlieId,
      at: new Date("2024-04-03T07:00:00Z"),
      content: "Avoiding sugar prevents afternoon slumps.",
      source: FactSource.BEHAVIOR,
    });

    const relevant = await concept.ask({
      requester: charlieId,
      question: "What behaviors help my energy levels?",
    });
    assertArrayIncludes(relevant.citedFacts, [
      proteinFact.fact,
      sugarFact.fact,
    ]);
    assertStringIncludes(relevant.answer, "High protein breakfasts keep energy stable.");
    assertStringIncludes(relevant.answer, "Avoiding sugar prevents afternoon slumps.");

    const noMatch = await concept.ask({
      requester: charlieId,
      question: "What should I cook for dinner tonight?",
    });
    assertEquals(noMatch.citedFacts.length, 0);
    assertStringIncludes(
      noMatch.answer,
      "I have 2 facts recorded for you, but none directly address",
    );

    const newUser = await concept.ask({
      requester: "user:New" as ID,
      question: "Do I have any facts?",
    });
    assertEquals(newUser.citedFacts.length, 0);
    assertStringIncludes(
      newUser.answer,
      "I couldn't find enough information",
    );
    assertStringIncludes(newUser.answer, "I have 0 facts recorded for you right now.");
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getUserFacts and _getUserQAs scope results to owner", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);

  try {
    const aliceFact = await concept.ingestFact({
      owner: aliceId,
      at: new Date("2024-05-01T10:00:00Z"),
      content: "Logged a refreshing morning run.",
      source: FactSource.CHECK_IN,
    });
    await concept.ingestFact({
      owner: bobId,
      at: new Date("2024-05-01T11:00:00Z"),
      content: "Experimented with a new smoothie recipe.",
      source: FactSource.MEAL,
    });

    await concept.ask({
      requester: aliceId,
      question: "What did I log about exercise?",
    });
    await concept.ask({
      requester: bobId,
      question: "Any notes on smoothies?",
    });

    const aliceFacts = await concept._getUserFacts({ owner: aliceId });
    assertEquals(aliceFacts.length, 1);
    assertEquals(aliceFacts[0]._id, aliceFact.fact);

    const bobFacts = await concept._getUserFacts({ owner: bobId });
    assertEquals(bobFacts.length, 1);
    assertStringIncludes(bobFacts[0].content, "smoothie");

    const aliceQAs = await concept._getUserQAs({ owner: aliceId });
    assertEquals(aliceQAs.length, 1);
    assertStringIncludes(aliceQAs[0].question, "exercise");

    const bobQAs = await concept._getUserQAs({ owner: bobId });
    assertEquals(bobQAs.length, 1);
    assertStringIncludes(bobQAs[0].question, "smoothies");
  } finally {
    await client.close();
  }
});
