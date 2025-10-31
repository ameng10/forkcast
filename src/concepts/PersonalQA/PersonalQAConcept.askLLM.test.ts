import {
  assertArrayIncludes,
  assertEquals,
  assertStringIncludes,
} from "@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import PersonalQAConcept, { FactSource } from "./PersonalQAConcept.ts";

const user = "user:LLM" as ID;

Deno.test("askLLM: no facts -> conservative empty with low confidence", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);
  try {
    const res = await concept.askLLM({
      requester: user,
      question: "Do I have any insights?",
    });
    assertEquals(res.citedFacts.length, 0);
    assertEquals(res.confidence, 0.2);
    assertStringIncludes(res.answer, "Insufficient data");
    const qas = await concept._getUserQAs({ owner: user });
    assertEquals(qas.length, 1);
    assertEquals(qas[0].confidence, 0.2);
  } finally {
    await client.close();
  }
});

Deno.test("askLLM: fallback path without GOOGLE_API_KEY uses conservative summary and cites selection", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);
  try {
    // Ingest 3 facts; selection should include the most recent ones
    const _f1 = await concept.ingestFact({
      owner: user,
      at: new Date("2025-10-01T10:00:00Z"),
      content: "Ate oatmeal and berries.",
      source: FactSource.MEAL,
    });
    const f2 = await concept.ingestFact({
      owner: user,
      at: new Date("2025-10-02T13:30:00Z"),
      content: "Energy 6/10 in the afternoon.",
      source: FactSource.CHECK_IN,
    });
    const f3 = await concept.ingestFact({
      owner: user,
      at: new Date("2025-10-03T20:30:00Z"),
      content: "Late fried dinner.",
      source: FactSource.MEAL,
    });

    const res = await concept.askLLM({
      requester: user,
      question: "Are late fried dinners hurting energy?",
      k: 2,
    });

    // Low-confidence fallback
    assertEquals(res.confidence, 0.2);
    // Should include IDs from the top-K recent facts (f2, f3)
    assertArrayIncludes(res.citedFacts, [f2.fact, f3.fact]);
    // Answer should reference recent facts text block
    assertStringIncludes(res.answer, "Based on your recent facts");

    // Drafts are only created when an actual LLM call occurs; ensure none present
    const drafts = await concept._getUserDrafts({ owner: user });
    assertEquals(drafts.length, 0);
  } finally {
    await client.close();
  }
});

Deno.test("setTemplate: upserts a user template (no LLM call required)", async () => {
  const [db, client] = await testDb();
  const concept = new PersonalQAConcept(db);
  try {
    await concept.setTemplate({
      requester: user,
      name: "strict-json",
      template: "Return JSON only. Question: {{question}} Facts: {{facts}}",
    });
    // Indirect verification: call askLLM to ensure still works in fallback mode
    const res = await concept.askLLM({
      requester: user,
      question: "Template set?",
    });
    assertEquals(typeof res.answer, "string");
  } finally {
    await client.close();
  }
});
