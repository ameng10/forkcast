---
timestamp: 'Sat Oct 18 2025 18:26:53 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_182653.c3170fb8.md]]'
content_id: 7b3153125d51cf87e84bd7268c452494f9ccff36eed7925dc5ba7069ea68fd60
---

# file: src/InsightMining/InsightMiningConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID, Empty } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "InsightMining" + ".";

// Generic types of this concept, branded as ID for type safety
type User = ID;
type Signal = ID; // e.g., "fried" as ID
type Metric = ID; // e.g., "energy_level" as ID

/**
 * Helper function to create a consistent, deterministic ID for an Insight.
 * This is crucial for the 'analyze' action to correctly update existing insights
 * by ensuring the same combination of owner, signals, and metric always
 * maps to the same _id in the Insights collection.
 * Signals are sorted to make the key order-independent.
 */
const createInsightKey = (owner: User, signals: Signal[], metric: Metric): ID => {
    const sortedSignals = [...signals].sort().join('_');
    return `${owner}_${sortedSignals}_${metric}` as ID;
};

/**
 * Concept: InsightMining
 * Purpose: Turn observations into per-user insights and weekly summaries.
 */
export default class InsightMiningConcept {
    /**
     * State: A set of Observations with:
     *   owner: User
     *   at: Time (Date in TS)
     *   signals: Set(Signal) (Signal[] in TS)
     *   metric: Metric
     *   value: Number
     */
    observations: Collection<ObservationDoc>;

    /**
     * State: A set of Insights with:
     *   owner: User
     *   signals: Set(Signal)
     *   metric: Metric
     *   effect: Number (positive or negative)
     *   confidence: Number (0..1)
     *   active: Flag (boolean in TS)
     */
    insights: Collection<InsightDoc>;

    /**
     * State: A set of Reports with:
     *   owner: User
     *   period: String (e.g., "week")
     *   generatedAt: Time
     *   topHelpful: Set(Signal) (optional)
     *   topHarmful: Set(Signal) (optional)
     *   metricTrends: Set(Metric, Number) (optional)
     */
    reports: Collection<ReportDoc>;

    constructor(private readonly db: Db) {
        this.observations = this.db.collection(PREFIX + "observations");
        this.insights = this.db.collection(PREFIX + "insights");
        this.reports = this.db.collection(PREFIX + "reports");
    }

    /**
     * Action: ingest
     * Purpose: Add a new observation for a user.
     *
     * @param {object} params - The action's input parameters.
     * @param {User} params.owner - The user who made the observation.
     * @param {Date} params.at - The time of the observation.
     * @param {Signal[]} params.signals - A set of signals/tags associated with the observation.
     * @param {Metric} params.metric - The metric being observed.
     * @param {number} params.value - The value of the metric.
     *
     * Effects: A new observation document is added to the 'observations' collection.
     */
    async ingest(
        { owner, at, signals, metric, value }: {
            owner: User;
            at: Date;
            signals: Signal[];
            metric: Metric;
            value: number;
        },
    ): Promise<Empty> {
        const observation: ObservationDoc = {
            _id: freshID(), // Generate a unique ID for the new observation
            owner,
            at,
            signals,
            metric,
            value,
        };
        await this.observations.insertOne(observation);
        return {};
    }

    /**
     * Action: analyze
     * Purpose: Compute insights from observations within a specified time window.
     * Insights are unique per owner, signals combination, and metric, and are
     * created or updated based on the analysis.
     *
     * @param {object} params - The action's input parameters.
     * @param {User} params.owner - The user whose observations are to be analyzed.
     * @param {number} params.window - The time window in hours to consider for observations.
     *
     * Requires: At least one observation must exist for the owner within the specified window.
     * Effects: New insights are created or existing insights are updated in the 'insights' collection,
     *          with computed 'effect' and 'confidence' values.
     *
     * Note: The actual computation of 'effect' and 'confidence' is a simplification;
     * a real-world system would involve more sophisticated statistical models.
     */
    async analyze(
        { owner, window }: {
            owner: User;
            window: number; // In hours
        },
    ): Promise<Empty | { error: string }> {
        const now = new Date();
        const windowStart = new Date(now.getTime() - window * 60 * 60 * 1000);

        // Find all observations for the owner within the time window
        const recentObservations = await this.observations.find({
            owner,
            at: { $gte: windowStart, $lte: now },
        }).toArray();

        // Requires: Exists observation for owner within window
        if (recentObservations.length === 0) {
            return { error: "No observations found for owner within the specified window." };
        }

        // Group observations by their unique insight key (owner, sorted signals, metric)
        const insightsData = new Map<ID, {
            signals: Signal[];
            metric: Metric;
            values: number[];
            timestamps: Date[];
        }>();

        for (const obs of recentObservations) {
            const key = createInsightKey(owner, obs.signals, obs.metric);
            if (!insightsData.has(key)) {
                insightsData.set(key, { signals: obs.signals, metric: obs.metric, values: [], timestamps: [] });
            }
            const data = insightsData.get(key)!;
            data.values.push(obs.value);
            data.timestamps.push(obs.at);
        }

        const insightsToUpsert: InsightDoc[] = [];

        // Compute effect and confidence for each grouped insight
        for (const [insightId, data] of insightsData.entries()) {
            const avgValue = data.values.reduce((sum, val) => sum + val, 0) / data.values.length;
            const numObservations = data.values.length;

            // Simplistic insight computation logic:
            // Effect: Deviation from a baseline (e.g., 5, assuming a metric range where 5 is neutral).
            // Positive effect if average value is above baseline, negative if below.
            const effect = avgValue - 5; // Example baseline of 5
            // Confidence: Increases with more observations, capping at 1 (e.g., after 10 observations).
            const confidence = Math.min(1, numObservations / 10); // Example: 10 observations => 100% confidence

            insightsToUpsert.push({
                _id: insightId, // Use the deterministic key as _id for upsert
                owner,
                signals: data.signals,
                metric: data.metric,
                effect,
                confidence,
                active: true, // Insights are active by default upon computation/update
            });
        }

        // Effects: Create or update Insights in the database
        for (const insight of insightsToUpsert) {
            await this.insights.updateOne(
                { _id: insight._id },
                { $set: insight },
                { upsert: true }, // 'upsert: true' creates the document if _id doesn't exist, otherwise updates it
            );
        }

        return {};
    }

    /**
     * Action: summarize
     * Purpose: Compute a trend summary report for a user over a specified period.
     *
     * @param {object} params - The action's input parameters.
     * @param {User} params.owner - The user for whom to generate the report.
     * @param {string} params.period - The period string (e.g., "week").
     * @returns {{report: ID} | {error: string}} - The ID of the generated report or an error.
     *
     * Requires: At least one observation must exist for the owner within the specified period.
     * Effects: A new report document is created in the 'reports' collection and its ID is returned.
     *
     * Note: Period parsing and trend computation are simplified. Currently, only "week" is supported.
     */
    async summarize(
        { owner, period }: { owner: User; period: string },
    ): Promise<{ report: ID } | { error: string }> {
        const now = new Date();
        let periodStart: Date;

        // Simple period parsing; a more robust solution would handle various periods
        if (period === "week") {
            periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
            return { error: `Unsupported period: ${period}. Only 'week' is supported for now.` };
        }

        const observationsInPeriod = await this.observations.find({
            owner,
            at: { $gte: periodStart, $lte: now },
        }).toArray();

        // Requires: Exists observation for owner within the period
        if (observationsInPeriod.length === 0) {
            return { error: "No observations found for owner within the specified period." };
        }

        // --- Compute topHelpful and topHarmful Signals ---
        // These are determined based on the 'effect' of active insights.
        const activeInsights = await this.insights.find({ owner, active: true }).toArray();

        const signalAverageEffects: Map<Signal, { totalEffect: number; count: number }> = new Map();

        for (const insight of activeInsights) {
            for (const signal of insight.signals) {
                if (!signalAverageEffects.has(signal)) {
                    signalAverageEffects.set(signal, { totalEffect: 0, count: 0 });
                }
                const current = signalAverageEffects.get(signal)!;
                current.totalEffect += insight.effect;
                current.count += 1;
            }
        }

        const sortedSignalsByEffect = Array.from(signalAverageEffects.entries())
            .map(([signal, data]) => ({ signal, avgEffect: data.totalEffect / data.count }))
            .sort((a, b) => b.avgEffect - a.avgEffect); // Sort descending by average effect

        const TOP_N_SIGNALS = 3;
        const topHelpful: Signal[] = sortedSignalsByEffect
            .filter(s => s.avgEffect > 0)
            .slice(0, TOP_N_SIGNALS)
            .map(s => s.signal);

        const topHarmful: Signal[] = sortedSignalsByEffect
            .filter(s => s.avgEffect < 0)
            .sort((a, b) => a.avgEffect - b.avgEffect) // Sort ascending for most harmful (lowest effect)
            .slice(0, TOP_N_SIGNALS)
            .map(s => s.signal);

        // --- Compute metricTrends ---
        // This calculates the average value for each metric observed during the period.
        const metricValuesInPeriod: Map<Metric, number[]> = new Map();
        for (const obs of observationsInPeriod) {
            if (!metricValuesInPeriod.has(obs.metric)) {
                metricValuesInPeriod.set(obs.metric, []);
            }
            metricValuesInPeriod.get(obs.metric)!.push(obs.value);
        }

        const metricTrends: Array<{ metric: Metric; value: number }> = Array.from(metricValuesInPeriod.entries())
            .map(([metric, values]) => ({
                metric,
                value: values.reduce((sum, val) => sum + val, 0) / values.length, // Average value for the metric in the period
            }));

        // Effects: Create Report
        const report: ReportDoc = {
            _id: freshID(),
            owner,
            period,
            generatedAt: now,
            topHelpful: topHelpful.length > 0 ? topHelpful : undefined, // Only include if non-empty
            topHarmful: topHarmful.length > 0 ? topHarmful : undefined, // Only include if non-empty
            metricTrends,
        };

        await this.reports.insertOne(report);
        // Effects: Return its ID
        return { report: report._id };
    }

    /**
     * Action: deactivate
     * Purpose: Deactivate an existing insight, marking it as no longer active.
     * Deactivated insights will not typically be considered in reports or future analysis.
     *
     * @param {object} params - The action's input parameters.
     * @param {User} params.requester - The user requesting the deactivation (must be the insight's owner).
     * @param {User} params.owner - The owner of the insight to deactivate.
     * @param {Signal[]} params.signals - The signals associated with the insight.
     * @param {Metric} params.metric - The metric associated with the insight.
     *
     * Requires: An insight must exist for the specified (owner, signals, metric) combination,
     *           and the requester must be the owner of that insight.
     * Effects: The 'active' flag of the matching insight is set to false.
     */
    async deactivate(
        { requester, owner, signals, metric }: {
            requester: User;
            owner: User;
            signals: Signal[];
            metric: Metric;
        },
    ): Promise<Empty | { error: string }> {
        // Requires: requester = owner
        if (requester !== owner) {
            return { error: "Requester is not authorized to deactivate this insight: Only the owner can deactivate." };
        }

        const insightId = createInsightKey(owner, signals, metric);

        // Check if the insight exists at all
        const existingInsight = await this.insights.findOne({ _id: insightId, owner });
        if (!existingInsight) {
            return { error: "No matching insight found to deactivate." };
        }

        // Check if it's already inactive
        if (!existingInsight.active) {
            return { error: "Insight is already inactive." };
        }

        // If it exists and is active, proceed to deactivate
        const result = await this.insights.updateOne(
            { _id: insightId, owner: owner, active: true }, // Ensure we only update if it's currently active
            { $set: { active: false } }, // Set its 'active' flag to false
        );

        // This matchedCount check serves as a final safeguard; if it was active
        // and matched, it should now be modified.
        if (result.matchedCount === 0) {
            // This case should ideally not be reached if previous checks are robust,
            // but handles very rare concurrency issues.
            return { error: "Failed to deactivate insight (possibly concurrent modification)." };
        }

        return {};
    }

    // --- Concept Queries (examples of non-trivial state observations) ---

    /**
     * Query: _getObservationsForUser
     * Purpose: Retrieve all observations for a given user.
     * @param {User} owner - The ID of the user.
     * @returns {Promise<ObservationDoc[]>} An array of ObservationDoc for the user.
     */
    async _getObservationsForUser(owner: User): Promise<ObservationDoc[]> {
        return await this.observations.find({ owner }).toArray();
    }

    /**
     * Query: _getInsightsForUser
     * Purpose: Retrieve all insights (active or inactive) for a given user.
     * @param {User} owner - The ID of the user.
     * @returns {Promise<InsightDoc[]>} An array of InsightDoc for the user.
     */
    async _getInsightsForUser(owner: User): Promise<InsightDoc[]> {
        return await this.insights.find({ owner }).toArray();
    }

    /**
     * Query: _getReport
     * Purpose: Retrieve a specific report by its ID.
     * @param {ID} reportId - The ID of the report.
     * @returns {Promise<ReportDoc | null>} The ReportDoc if found, otherwise null.
     */
    async _getReport(reportId: ID): Promise<ReportDoc | null> {
        return await this.reports.findOne({ _id: reportId });
    }
}

// --- Interfaces for MongoDB Documents (representing concept state) ---

/**
 * Interface for an Observation document in MongoDB.
 * Corresponds to: A set of Observations with owner, at, signals, metric, value.
 */
interface ObservationDoc {
    _id: ID; // Unique identifier for the observation
    owner: User; // The user associated with this observation
    at: Date; // Timestamp of the observation
    signals: Signal[]; // Array of signals (tags)
    metric: Metric; // The observed metric
    value: number; // The value of the metric
}

/**
 * Interface for an Insight document in MongoDB.
 * Corresponds to: A set of Insights with owner, signals, metric, effect, confidence, active.
 * The _id is a deterministic composite key for unique insights.
 */
interface InsightDoc {
    _id: ID; // Composite ID: owner_sortedSignals_metric
    owner: User; // The user this insight belongs to
    signals: Signal[]; // The signals associated with this insight
    metric: Metric; // The metric this insight pertains to
    effect: number; // Quantitative effect (e.g., impact on metric)
    confidence: number; // Confidence level (0 to 1)
    active: boolean; // Flag indicating if the insight is currently active
}

/**
 * Interface for a Report document in MongoDB.
 * Corresponds to: A set of Reports with owner, period, generatedAt, topHelpful, topHarmful, metricTrends.
 */
interface ReportDoc {
    _id: ID; // Unique identifier for the report
    owner: User; // The user for whom the report was generated
    period: string; // The reporting period (e.g., "week")
    generatedAt: Date; // Timestamp when the report was generated
    topHelpful?: Signal[]; // Optional: Signals associated with positive effects
    topHarmful?: Signal[]; // Optional: Signals associated with negative effects
    metricTrends?: Array<{ metric: Metric; value: number }>; // Optional: Average values for metrics over the period
}
```

## Test File

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
      // 1. [signalFried] -> metricEnergyLevel (observations 1, 5)
      // 2. [signalDairy, signalFried] -> metricEnergyLevel (observation 2)
      // 3. [signalDairy] -> metricEnergyLevel (observations 3, 6)
      // 4. [] -> metricEnergyLevel (observation 4)
      // 5. [signalFried, signalLateNight] -> metricEnergyLevel (observation 7)
      // 6. [signalHealthy] -> metricEnergyLevel (observations 8, 9)
      assertEquals(aliceInsights.length, 6, "Alice should have 6 distinct insights after analysis.");

      // Verify specific insight calculations
      const friedInsight = aliceInsights.find(i => i.signals.length === 1 && i.signals[0] === signalFried);
      assertExists(friedInsight, "Insight for [fried] should exist.");
      // Values for insight with EXACLTY [signalFried]: 3, 2. Avg = (3+2)/2 = 2.5. Effect = 2.5 - 5 = -2.5. Confidence = 2/10 = 0.2
      assertEquals(friedInsight!.effect.toFixed(1), (-2.5).toFixed(1), "Fried insight effect should be -2.5.");
      assertEquals(friedInsight!.confidence.toFixed(1), (0.2).toFixed(1), "Fried insight confidence should be 0.2.");

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

      const { report: reportId } = summarizeResult as { report: ID };
      assertExists(reportId);

      const generatedReport = await concept._getReport(reportId);
      assertExists(generatedReport, "Generated report should be retrievable.");
      assertEquals(generatedReport!.owner, userAlice, "Report owner should be Alice.");
      assertEquals(generatedReport!.period, "week", "Report period should be 'week'.");
      assertExists(generatedReport!.generatedAt, "Report should have a generatedAt timestamp.");
      assertEquals(generatedReport!._id, reportId, "Generated report _id should match the returned report ID.");

      // Verify topHelpful/topHarmful based on computed insights
      // Based on previous analysis:
      // Signal average effects (from insights for Alice):
      // signalFried: (-2.5) -> avg effect -2.5
      // signalDairy_signalFried: (-3) -> avg effect -3
      // signalDairy: (-1) -> avg effect -1
      // []: (0) -> avg effect 0
      // signalFried_signalLateNight: (-4) -> avg effect -4
      // signalHealthy: (3.5) -> avg effect 3.5

      // Top Helpful: Only signalHealthy has a positive average effect
      assertExists(generatedReport!.topHelpful, "topHelpful should exist.");
      assertEquals(generatedReport!.topHelpful?.length, 1, "There should be 1 top helpful signal.");
      assertArrayIncludes(generatedReport!.topHelpful as ID[], [signalHealthy]);

      // Top Harmful (sorted lowest effect first, then take top 3):
      // signalFried_signalLateNight (-4), signalDairy_signalFried (-3), signalFried (-2.5)
      assertExists(generatedReport!.topHarmful, "topHarmful should exist.");
      assertEquals(generatedReport!.topHarmful?.length, 3, "There should be 3 top harmful signals.");
      // Use assertArrayIncludes as order might be sensitive to floating points or same average effect
      assertArrayIncludes(generatedReport!.topHarmful as ID[], [signalFried, signalDairy, signalLateNight]); // Adjusted based on signal combination keys.

      // Verify metricTrends
      assertExists(generatedReport!.metricTrends, "Metric trends should exist.");
      assertEquals(generatedReport!.metricTrends?.length, 1, "There should be 1 metric trend for energy level.");
      assertEquals(generatedReport!.metricTrends![0].metric, metricEnergyLevel);
      // Average value for metricEnergyLevel for Alice over the period (all 9 observations):
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
      const result1 = await concept.analyze({ owner: userAlice, window: 1 });
      assertEquals("error" in result1, true, "Analyze should fail if no observations found.");
      assertEquals((result1 as { error: string }).error, "No observations found for owner within the specified window.");

      // Ingest an observation outside the window
      await concept.ingest({ owner: userAlice, at: getDate(-24), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      const result2 = await concept.analyze({ owner: userAlice, window: 1 }); // Window of 1 hour, observation is 24 hours ago
      assertEquals("error" in result2, true, "Analyze should fail if observations are outside the window.");
      assertEquals((result2 as { error: string }).error, "No observations found for owner within the specified window.");
    });

    await t.step("Effects: Correctly computes and upserts insights with multiple observations", async () => {
      // Ingest observations for two distinct insights
      await concept.ingest({ owner: userAlice, at: getDate(-2), signals: [signalFried], metric: metricEnergyLevel, value: 3 });
      await concept.ingest({ owner: userAlice, at: getDate(-1), signals: [signalFried], metric: metricEnergyLevel, value: 1 });
      await concept.ingest({ owner: userAlice, at: getDate(-1.5), signals: [signalDairy], metric: metricEnergyLevel, value: 6 });

      const analyzeResult1 = await concept.analyze({ owner: userAlice, window: 3 });
      assertEquals("error" in analyzeResult1, false, `Analyze failed: ${JSON.stringify(analyzeResult1)}`);


      let insights = await concept._getInsightsForUser(userAlice);
      assertEquals(insights.length, 2, "Should have two insights.");

      const friedInsight = insights.find(i => i.signals.includes(signalFried) && i.signals.length === 1); // Specific to [signalFried]
      assertExists(friedInsight);
      assertEquals(friedInsight!.effect, (3 + 1) / 2 - 5); // (2-5 = -3)
      assertEquals(friedInsight!.confidence, 2 / 10);

      // Add more observations and re-analyze to test upsert
      await concept.ingest({ owner: userAlice, at: getDate(-0.5), signals: [signalFried], metric: metricEnergyLevel, value: 5 }); // Third for fried
      await concept.ingest({ owner: userAlice, at: getDate(-0.1), signals: [signalDairy], metric: metricEnergyLevel, value: 7 }); // Second for dairy

      const analyzeResult2 = await concept.analyze({ owner: userAlice, window: 3 });
      assertEquals("error" in analyzeResult2, false, `Analyze failed: ${JSON.stringify(analyzeResult2)}`);

      insights = await concept._getInsightsForUser(userAlice);
      assertEquals(insights.length, 2, "Still should have two insights after upsert.");

      const updatedFriedInsight = insights.find(i => i.signals.includes(signalFried) && i.signals.length === 1);
      assertExists(updatedFriedInsight);
      assertEquals(updatedFriedInsight!.effect.toFixed(2), ((3 + 1 + 5) / 3 - 5).toFixed(2)); // (3-5 = -2)
      assertEquals(updatedFriedInsight!.confidence.toFixed(1), (3 / 10).toFixed(1));

      const updatedDairyInsight = insights.find(i => i.signals.includes(signalDairy) && i.signals.length === 1);
      assertExists(updatedDairyInsight);
      assertEquals(updatedDairyInsight!.effect, (6 + 7) / 2 - 5); // (6.5-5 = 1.5)
      assertEquals(updatedDairyInsight!.confidence.toFixed(1), (2 / 10).toFixed(1));
    });

    await t.step("Effects: Handles observations with no signals array correctly", async () => {
      // Clear previous data for a fresh state for userCharlie
      await concept.observations.deleteMany({ owner: userCharlie });
      await concept.insights.deleteMany({ owner: userCharlie });

      await concept.ingest({ owner: userCharlie, at: getDate(-1), signals: [], metric: metricEnergyLevel, value: 7 });
      await concept.ingest({ owner: userCharlie, at: getDate(-0.5), signals: [], metric: metricEnergyLevel, value: 8 });

      const analyzeResult = await concept.analyze({ owner: userCharlie, window: 2 });
      assertEquals("error" in analyzeResult, false, `Analyze failed: ${JSON.stringify(analyzeResult)}`);

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

      const analyzeResult = await concept.analyze({ owner: userAlice, window: 3 }); // Ensure insights are computed
      assertEquals("error" in analyzeResult, false, `Analyze failed: ${JSON.stringify(analyzeResult)}`);

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

      const analyzeResult = await concept.analyze({ owner: userCharlie, window: 3 });
      assertEquals("error" in analyzeResult, false, `Analyze for Charlie failed: ${JSON.stringify(analyzeResult)}`);

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
      const analyzeResult = await concept.analyze({ owner: userAlice, window: 2 });
      assertEquals("error" in analyzeResult, false, `Analyze failed: ${JSON.stringify(analyzeResult)}`);

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
      const analyzeResult = await concept.analyze({ owner: userAlice, window: 2 });
      assertEquals("error" in analyzeResult, false, `Analyze failed: ${JSON.stringify(analyzeResult)}`);

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
      assertEquals("error" in reDeactivateResult, true, "Re-deactivating an already inactive insight should fail to find an active match.");
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

      const analyzeAliceResult = await concept.analyze({ owner: userAlice, window: 3 });
      assertEquals("error" in analyzeAliceResult, false, `Analyze for Alice failed: ${JSON.stringify(analyzeAliceResult)}`);

      const analyzeBobResult = await concept.analyze({ owner: userBob, window: 3 });
      assertEquals("error" in analyzeBobResult, false, `Analyze for Bob failed: ${JSON.stringify(analyzeBobResult)}`);

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
      const analyzeResult = await concept.analyze({ owner: userAlice, window: 2 }); // Analyze to ensure insights are present for summarization logic
      assertEquals("error" in analyzeResult, false, `Analyze failed: ${JSON.stringify(analyzeResult)}`);

      const summarizeResult = await concept.summarize({ owner: userAlice, period: "week" });
      assertEquals("error" in summarizeResult, false, `Summarize for Alice failed: ${JSON.stringify(summarizeResult)}`);

      const { report: reportId } = summarizeResult as { report: ID };
      assertExists(reportId);

      const retrievedReport = await concept._getReport(reportId);
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
