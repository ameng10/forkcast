---
timestamp: 'Sat Oct 18 2025 18:12:52 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_181252.4a552a7c.md]]'
content_id: 06506926ad83bcee849944de96f640d63a7e510b0c3423dbf7436bd3829952da
---

# file: src/InsightMining/InsightMiningConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import InsightMiningConcept from "./InsightMiningConcept.ts";

// --- Mock IDs for testing ---
const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;
const userCharlie = "user:Charlie" as ID;

const signalFried = "signal:fried" as ID;
const signalDairy = "signal:dairy" as ID;
const signalLateNight = "signal:late_night" as ID;
const signalHealthy = "signal:healthy" as ID;

const metricEnergyLevel = "metric:energy_level" as ID;
const metricMood = "metric:mood" as ID;
const metricProductivity = "metric:productivity" as ID;

// Helper to create a date relative to 'now' for consistent testing windows
const getDate = (offsetHours: number): Date => {
  const now = new Date();
  return new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
};

// --- Test Suite for InsightMiningConcept ---

Deno.test("Principle: System ingests, analyzes, and summarizes observations", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    // 1. Ingest observations for user Alice
    await t.step("Phase 1: Ingest observations", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-10), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.ingest({ owner: userAlice, at: getDate(-9), signals: [signalFried, signalDairy], metric: metricEnergyLevel, value: 2 });
      await concept.ingest({ owner: userAlice, at: getDate(-8), signals: [signalDairy], metric: metricEnergyLevel, value: 4 });
      await concept.ingest({ owner: userAlice, at: getDate(-7), signals: [], metric: metricEnergyLevel, value: 5 }); // Neutral meal, no signals
      await concept.ingest({ owner: userAlice, at: getDate(-6), signals: [signalFried], metric: metricEnergyLevel, value: 2 });
      await concept.ingest({ owner: userAlice, at: getDate(-5), signals: [signalDairy], metric: metricEnergyLevel, value: 4 });
      await concept.ingest({ owner: userAlice, at: getDate(-4), signals: [signalFried, signalLateNight], metric: metricEnergyLevel, value: 1 }); // Very negative combo
      await concept.ingest({ owner: userAlice, at: getDate(-3), signals: [signalHealthy], metric: metricEnergyLevel, value: 9 }); // Positive signal
      await concept.ingest({ owner: userAlice, at: getDate(-2), signals: [signalHealthy], metric: metricEnergyLevel, value: 8 }); // Positive signal

      const aliceObservations = await concept._getObservationsForUser(userAlice);
      assertEquals(aliceObservations.length, 9, "Alice should have 9 observations.");

      // Ingest for another user to ensure isolation later
      await concept.ingest({ owner: userBob, at: getDate(-1), signals: [signalFried], metric: metricMood, value: 7 });
    });

    // 2. Analyze observations for Alice
    await t.step("Phase 2: Analyze observations", async () => {
      // Use a window covering all Alice's observations (e.g., 12 hours)
      const analyzeResult = await concept.analyze({ owner: userAlice, window: 12 });
      assertEquals("error" in analyzeResult, false, `Analysis for Alice failed: ${JSON.stringify(analyzeResult)}`);

      const aliceInsights = await concept._getInsightsForUser(userAlice);
      // Expected distinct insights based on (owner, sortedSignals, metric):
      // 1. [signalFried] -> metricEnergyLevel
      // 2. [signalFried, signalDairy] -> metricEnergyLevel
      // 3. [signalDairy] -> metricEnergyLevel
      // 4. [] -> metricEnergyLevel (neutral meal, empty signals)
      // 5. [signalFried, signalLateNight] -> metricEnergyLevel
      // 6. [signalHealthy] -> metricEnergyLevel
      assertEquals(aliceInsights.length, 6, "Alice should have 6 distinct insights after analysis.");

      // Verify specific insight calculations
      const friedInsight = aliceInsights.find(i => i.signals.length === 1 && i.signals[0] === signalFried);
      assertExists(friedInsight, "Insight for [fried] should exist.");
      // Values for [fried]: 3, 2, 2. Avg = 7/3 = 2.33. Effect = 2.33 - 5 = -2.67. Confidence = 3/10 = 0.3
      assertEquals(friedInsight!.effect.toFixed(2), (-2.67).toFixed(2));
      assertEquals(friedInsight!.confidence.toFixed(1), (0.3).toFixed(1));
      assertEquals(friedInsight!.active, true, "New insights should be active.");

      const healthyInsight = aliceInsights.find(i => i.signals.length === 1 && i.signals[0] === signalHealthy);
      assertExists(healthyInsight, "Insight for [healthy] should exist.");
      // Values for [healthy]: 9, 8. Avg = 17/2 = 8.5. Effect = 8.5 - 5 = 3.5. Confidence = 2/10 = 0.2
      assertEquals(healthyInsight!.effect.toFixed(1), (3.5).toFixed(1));
      assertEquals(healthyInsight!.confidence.toFixed(1), (0.2).toFixed(1));

      const emptySignalsInsight = aliceInsights.find(i => i.signals.length === 0);
      assertExists(emptySignalsInsight, "Insight for [] (no signals) should exist.");
      // Values for []: 5. Avg = 5. Effect = 5 - 5 = 0. Confidence = 1/10 = 0.1
      assertEquals(emptySignalsInsight!.effect, 0, "Effect for [] should be 0.");
      assertEquals(emptySignalsInsight!.confidence.toFixed(1), (0.1).toFixed(1));
    });

    // 3. Summarize for Alice
    await t.step("Phase 3: Summarize observations and insights into a report", async () => {
      const summarizeResult = await concept.summarize({ owner: userAlice, period: "week" });
      assertEquals("error" in summarizeResult, false, `Summarize for Alice failed: ${JSON.stringify(summarizeResult)}`);

      // The concept.summarize now returns { report: ID }
      const { report: reportId } = summarizeResult as { report: ID };
      assertExists(reportId);

      const generatedReport = await concept._getReport(reportId); // Pass the ID directly
      assertExists(generatedReport, "Generated report should be retrievable.");
      assertEquals(generatedReport!.owner, userAlice, "Report owner should be Alice.");
      assertEquals(generatedReport!.period, "week", "Report period should be 'week'.");
      assertExists(generatedReport!.generatedAt, "Report should have a generatedAt timestamp.");
      assertEquals(generatedReport!._id, reportId, "Generated report _id should match the returned report ID.");

      // Verify topHelpful/topHarmful based on computed insights
      // Insights (Effect):
      // [fried]: -2.67
      // [fried, dairy]: -3
      // [dairy]: -1
      // []: 0
      // [fried, late_night]: -4
      // [healthy]: 3.5

      // Signal average effects (calculated in summarize, re-simulated for verification):
      // signalHealthy: 3.5 (from [healthy] insight)
      // signalDairy: (-3 + -1) / 2 = -2 (from [fried, dairy] and [dairy] insights)
      // signalFried: (-2.67 + -3 + -4) / 3 = -3.22 (from [fried], [fried, dairy], [fried, late_night] insights)
      // signalLateNight: -4 (from [fried, late_night] insight)

      // Top Helpful: Only signalHealthy has a positive average effect
      assertExists(generatedReport!.topHelpful, "topHelpful should exist.");
      assertEquals(generatedReport!.topHelpful?.length, 1, "There should be 1 top helpful signal.");
      assertArrayIncludes(generatedReport!.topHelpful as ID[], [signalHealthy]);

      // Top Harmful: Based on current logic, most negative effects from [-4, -3.22, -2] (late_night, fried, dairy)
      assertExists(generatedReport!.topHarmful, "topHarmful should exist.");
      assertEquals(generatedReport!.topHarmful?.length, 3, "There should be 3 top harmful signals.");
      assertArrayIncludes(generatedReport!.topHarmful as ID[], [signalFried, signalDairy, signalLateNight]);

      // Verify metricTrends
      assertExists(generatedReport!.metricTrends, "Metric trends should exist.");
      assertEquals(generatedReport!.metricTrends?.length, 1, "There should be 1 metric trend for energy level.");
      assertEquals(generatedReport!.metricTrends![0].metric, metricEnergyLevel);
      // Average value for metricEnergyLevel for Alice over the period:
      // (3+2+4+5+2+4+1+9+8) / 9 = 38 / 9 = 4.222...
      assertEquals(generatedReport!.metricTrends![0].value.toFixed(3), (4.222).toFixed(3), "Metric trend value should be the average of observations in period.");
    });
  } finally {
    await client.close();
  }
});

Deno.test("Action: ingest - Adds observation correctly and handles empty signals", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    const atTime = getDate(-1);
    await t.step("Ingest with signals", async () => {
      const result = await concept.ingest({ owner: userAlice, at: atTime, signals: [signalDairy], metric: metricMood, value: 7 });
      assertEquals("error" in result, false, `Ingest failed: ${JSON.stringify(result)}`);

      const observations = await concept._getObservationsForUser(userAlice);
      assertEquals(observations.length, 1, "One observation should be added.");
      assertEquals(observations[0].owner, userAlice);
      assertEquals(observations[0].at.getTime(), atTime.getTime());
      assertArrayIncludes(observations[0].signals, [signalDairy]);
      // Corrected: Compare IDs directly
      assertEquals(observations[0].metric, metricMood);
      assertEquals(observations[0].value, 7);
    });

    await t.step("Ingest with empty signals", async () => {
      const emptySignalsTime = getDate(-0.5);
      const result = await concept.ingest({ owner: userAlice, at: emptySignalsTime, signals: [], metric: metricProductivity, value: 10 });
      assertEquals("error" in result, false, `Ingest failed: ${JSON.stringify(result)}`);

      const observations = await concept._getObservationsForUser(userAlice);
      assertEquals(observations.length, 2, "Two observations should be added.");
      const emptyObs = observations.find(o => o.metric === metricProductivity);
      assertExists(emptyObs);
      assertEquals(emptyObs!.signals.length, 0, "Signals array should be empty.");
      assertEquals(emptyObs!.value, 10);
    });
  } finally {
    await client.close();
  }
});

Deno.test("Action: analyze - Requires observations in window and calculates correctly", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    await t.step("Requires: No observations in window", async () => {
      const result = await concept.analyze({ owner: userAlice, window: 1 });
      assertEquals("error" in result, true, "Analyze should fail if no observations found.");
      assertEquals((result as { error: string }).error, "No observations found for owner within the specified window.");

      // Ingest an observation outside the window
      await concept.ingest({ owner: userAlice, at: getDate(-24), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      const result2 = await concept.analyze({ owner: userAlice, window: 1 }); // Window of 1 hour, observation is 24 hours old
      assertEquals("error" in result2, true, "Analyze should fail if observations are outside the window.");
      assertEquals((result2 as { error: string }).error, "No observations found for owner within the specified window.");
    });

    await t.step("Effects: Correctly computes and upserts insights with multiple observations", async () => {
      // Ingest observations for two distinct insights
      await concept.ingest({ owner: userAlice, at: getDate(-2), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalFried], metric: metricEnergyLevel, value: 1 });
      await concept.ingest({ owner: userAlice, at: getDate(-1.5), signals: [signalDairy], metric: metricEnergyLevel, value: 6 });

      await concept.analyze({ owner: userAlice, window: 3 });

      let insights = await concept._getInsightsForUser(userAlice);
      assertEquals(insights.length, 2, "Should have two insights.");

      const friedInsight = insights.find(i => i.signals.includes(signalFried));
      assertExists(friedInsight);
      assertEquals(friedInsight!.effect, (3 + 1) / 2 - 5); // (2-5 = -3)
      assertEquals(friedInsight!.confidence, 2 / 10);

      const dairyInsight = insights.find(i => i.signals.includes(signalDairy));
      assertExists(dairyInsight);
      assertEquals(dairyInsight!.effect, (6) / 1 - 5); // (6-5 = 1)
      assertEquals(dairyInsight!.confidence, 1 / 10);

      // Add more observations and re-analyze to test upsert
      await concept.ingest({ owner: userAlice, at: getDate(-0.5), signals: [signalFried], metric: metricEnergyLevel, value: 5 }); // Third for fried
      await concept.ingest({ owner: userAlice, at: getDate(-0.1), signals: [signalDairy], metric: metricEnergyLevel, value: 7 }); // Second for dairy

      await concept.analyze({ owner: userAlice, window: 3 });

      insights = await concept._getInsightsForUser(userAlice);
      assertEquals(insights.length, 2, "Still should have two insights after upsert.");

      const updatedFriedInsight = insights.find(i => i.signals.includes(signalFried));
      assertExists(updatedFriedInsight);
      assertEquals(updatedFriedInsight!.effect.toFixed(2), ((3 + 1 + 5) / 3 - 5).toFixed(2)); // (3-5 = -2)
      assertEquals(updatedFriedInsight!.confidence.toFixed(1), (3 / 10).toFixed(1));

      const updatedDairyInsight = insights.find(i => i.signals.includes(signalDairy));
      assertExists(updatedDairyInsight);
      assertEquals(updatedDairyInsight!.effect, (6 + 7) / 2 - 5); // (6.5-5 = 1.5)
      assertEquals(updatedDairyInsight!.confidence.toFixed(1), (2 / 10).toFixed(1));
    });

    await t.step("Effects: Handles observations with no signals array correctly", async () => {
      await concept.ingest({ owner: userCharlie, at: getDate(-1), signals: [], metric: metricEnergyLevel, value: 7 });
      await concept.ingest({ owner: userCharlie, at: getDate(-0.5), signals: [], metric: metricEnergyLevel, value: 8 });

      await concept.analyze({ owner: userCharlie, window: 2 });

      const insights = await concept._getInsightsForUser(userCharlie);
      assertEquals(insights.length, 1, "Should have one insight for empty signals.");

      const emptySignalsInsight = insights.find(i => i.signals.length === 0);
      assertExists(emptySignalsInsight);
      assertEquals(emptySignalsInsight!.effect, (7 + 8) / 2 - 5, "Effect for empty signals should be correct (2.5).");
      assertEquals(emptySignalsInsight!.confidence.toFixed(1), (0.2).toFixed(1));
    });
  } finally {
    await client.close();
  }
});

Deno.test("Action: summarize - Requirements and effects on report content", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    await t.step("Requires: No observations in period", async () => {
      const result1 = await concept.summarize({ owner: userAlice, period: "week" });
      assertEquals("error" in result1, true, "Summarize should fail if no observations found in period.");
      assertEquals((result1 as { error: string }).error, "No observations found for owner within the specified period.");
    });

    await t.step("Requires: Unsupported period string", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [], metric: metricEnergyLevel, value: 5 });
      const result2 = await concept.summarize({ owner: userAlice, period: "month" });
      assertEquals("error" in result2, true, "Summarize should fail for unsupported period.");
      assertEquals((result2 as { error: string }).error, "Unsupported period: month. Only 'week' is supported for now.");
    });

    await t.step("Effects: Generates report with topHelpful/topHarmful and metricTrends", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-2), signals: [signalHealthy], metric: metricEnergyLevel, value: 9 });
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalFried], metric: metricEnergyLevel, value: 2 });
      await concept.ingest({ owner: userAlice, at: getDate(-0.5), signals: [signalHealthy], metric: metricEnergyLevel, value: 8 });
      await concept.ingest({ owner: userAlice, at: getDate(-0.1), signals: [signalFried], metric: metricEnergyLevel, value: 1 });

      await concept.analyze({ owner: userAlice, window: 3 }); // Ensure insights are computed

      const summarizeResult = await concept.summarize({ owner: userAlice, period: "week" });
      assertEquals("error" in summarizeResult, false, `Summarize for Alice failed: ${JSON.stringify(summarizeResult)}`);
      const { report: reportId } = summarizeResult as { report: ID };
      const generatedReport = await concept._getReport(reportId);

      assertExists(generatedReport);
      // Insights: [healthy]: effect (9+8)/2 - 5 = 3.5, [fried]: effect (2+1)/2 - 5 = -3.5
      assertEquals(generatedReport!.topHelpful?.length, 1);
      assertArrayIncludes(generatedReport!.topHelpful as ID[], [signalHealthy]);

      assertEquals(generatedReport!.topHarmful?.length, 1);
      assertArrayIncludes(generatedReport!.topHarmful as ID[], [signalFried]);

      assertExists(generatedReport!.metricTrends);
      assertEquals(generatedReport!.metricTrends?.length, 1);
      // Avg observations for energy level: (9+2+8+1)/4 = 20/4 = 5
      assertEquals(generatedReport!.metricTrends![0].metric, metricEnergyLevel);
      assertEquals(generatedReport!.metricTrends![0].value, 5);
    });

    await t.step("Effects: Handles cases where no signals are helpful/harmful", async () => {
      // Clear previous data for a fresh state for userCharlie
      await concept.observations.deleteMany({ owner: userCharlie });
      await concept.insights.deleteMany({ owner: userCharlie });
      await concept.reports.deleteMany({ owner: userCharlie });

      await concept.ingest({ owner: userCharlie, at: getDate(-2), signals: [], metric: metricMood, value: 5 }); // Neutral, no signals
      await concept.ingest({ owner: userCharlie, at: getDate(-1), signals: [], metric: metricMood, value: 5 }); // Neutral, no signals

      await concept.analyze({ owner: userCharlie, window: 3 });

      const summarizeResult = await concept.summarize({ owner: userCharlie, period: "week" });
      assertEquals("error" in summarizeResult, false, `Summarize for Charlie failed: ${JSON.stringify(summarizeResult)}`);
      const { report: reportId } = summarizeResult as { report: ID };
      const generatedReport = await concept._getReport(reportId);

      assertExists(generatedReport);
      assertEquals(generatedReport!.topHelpful, undefined, "topHelpful should be undefined if no signals have positive effect.");
      assertEquals(generatedReport!.topHarmful, undefined, "topHarmful should be undefined if no signals have negative effect.");
      assertExists(generatedReport!.metricTrends);
      assertEquals(generatedReport!.metricTrends?.length, 1);
    });
  } finally {
    await client.close();
  }
});

Deno.test("Action: deactivate - Requires insight to exist and correct requester", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    await t.step("Setup: Ingest and analyze to create an insight", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.analyze({ owner: userAlice, window: 2 });
      const initialInsights = await concept._getInsightsForUser(userAlice);
      assertEquals(initialInsights.length, 1);
      assertEquals(initialInsights[0].active, true, "Insight should be active initially.");
    });

    await t.step("Requires: Unauthorized requester", async () => {
      const unauthorizedResult = await concept.deactivate({
        requester: userBob,
        owner: userAlice,
        signals: [signalFried],
        metric: metricEnergyLevel,
      });
      assertEquals("error" in unauthorizedResult, true, "Deactivation by unauthorized user should fail.");
      assertEquals((unauthorizedResult as { error: string }).error, "Requester is not authorized to deactivate this insight: Only the owner can deactivate.");
    });

    await t.step("Requires: Non-existent insight", async () => {
      const nonExistentResult = await concept.deactivate({
        requester: userAlice,
        owner: userAlice,
        signals: [signalDairy], // This insight doesn't exist for Alice
        metric: metricEnergyLevel,
      });
      assertEquals("error" in nonExistentResult, true, "Deactivation of non-existent insight should fail.");
      assertEquals((nonExistentResult as { error: string }).error, "No matching insight found to deactivate.");
    });
  } finally {
    await client.close();
  }
});

Deno.test("Action: deactivate - Successfully deactivates insight and handles re-deactivation", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    await t.step("Setup: Create an active insight", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.analyze({ owner: userAlice, window: 2 });
      const initialInsights = await concept._getInsightsForUser(userAlice);
      assertEquals(initialInsights.length, 1);
      assertEquals(initialInsights[0].active, true, "Insight should be active initially.");
    });

    await t.step("Effects: Successfully deactivates an insight", async () => {
      const deactivateResult = await concept.deactivate({
        requester: userAlice,
        owner: userAlice,
        signals: [signalFried],
        metric: metricEnergyLevel,
      });
      assertEquals("error" in deactivateResult, false, `Deactivation failed: ${JSON.stringify(deactivateResult)}`);

      const insightsAfterDeactivation = await concept._getInsightsForUser(userAlice);
      assertEquals(insightsAfterDeactivation.length, 1);
      assertEquals(insightsAfterDeactivation[0].active, false, "Insight should be deactivated.");
    });

    await t.step("Edge Case: Attempt to deactivate an already inactive insight", async () => {
      const reDeactivateResult = await concept.deactivate({
        requester: userAlice,
        owner: userAlice,
        signals: [signalFried],
        metric: metricEnergyLevel,
      });
      // The updated implementation now differentiates between not found and already inactive.
      assertEquals("error" in reDeactivateResult, true, "Re-deactivating an already inactive insight should fail.");
      assertEquals((reDeactivateResult as { error: string }).error, "Insight is already inactive.");
    });
  } finally {
    await client.close();
  }
});

Deno.test("Queries: Retrieval functions work correctly", async (t) => {
  const [db, client] = await testDb();
  const concept = new InsightMiningConcept(db);

  try {
    await t.step("_getObservationsForUser", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-2), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalDairy], metric: metricEnergyLevel, value: 4 });
      await concept.ingest({ owner: userBob, at: getDate(-1), signals: [signalLateNight], metric: metricMood, value: 8 });

      const aliceObservations = await concept._getObservationsForUser(userAlice);
      assertEquals(aliceObservations.length, 2);
      assertEquals(aliceObservations.some(o => o.signals.includes(signalFried)), true);
      assertEquals(aliceObservations.some(o => o.signals.includes(signalDairy)), true);

      const bobObservations = await concept._getObservationsForUser(userBob);
      assertEquals(bobObservations.length, 1);
      assertEquals(bobObservations[0].owner, userBob);
    });

    await t.step("_getInsightsForUser", async () => {
      await concept.ingest({ owner: userAlice, at: getDate(-2), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalFried], metric: metricEnergyLevel, value: 1 });
      await concept.ingest({ owner: userBob, at: getDate(-1), signals: [signalLateNight], metric: metricMood, value: 8 });
      await concept.analyze({ owner: userAlice, window: 3 });
      await concept.analyze({ owner: userBob, window: 3 });

      const aliceInsights = await concept._getInsightsForUser(userAlice);
      assertEquals(aliceInsights.length, 1);
      assertEquals(aliceInsights[0].owner, userAlice);

      const bobInsights = await concept._getInsightsForUser(userBob);
      assertEquals(bobInsights.length, 1);
      assertEquals(bobInsights[0].owner, userBob);
    });

    await t.step("_getReport", async () => {
      // Ensure there are observations to summarize
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalHealthy], metric: metricProductivity, value: 7 });
      await concept.analyze({ owner: userAlice, window: 2 }); // Analyze to ensure insights are present for summarization logic

      const summarizeResult = await concept.summarize({ owner: userAlice, period: "week" });
      assertEquals("error" in summarizeResult, false, `Summarize for Alice failed: ${JSON.stringify(summarizeResult)}`);

      const { report: reportId } = summarizeResult as { report: ID }; // Now 'report' is directly the ID
      assertExists(reportId);

      const retrievedReport = await concept._getReport(reportId); // Pass the ID directly
      assertExists(retrievedReport);
      assertEquals(retrievedReport!._id, reportId);
      assertEquals(retrievedReport!.owner, userAlice);

      const nonExistentReport = await concept._getReport("report:fake" as ID);
      assertEquals(nonExistentReport, null, "Should return null for a non-existent report ID.");
    });
  } finally {
    await client.close();
  }
});
```
