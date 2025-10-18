import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
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
const createInsightKey = (
  owner: User,
  signals: Signal[],
  metric: Metric,
): ID => {
  const sortedSignals = [...signals].sort().join("_");
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
      return {
        error: "No observations found for owner within the specified window.",
      };
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
        insightsData.set(key, {
          signals: obs.signals,
          metric: obs.metric,
          values: [],
          timestamps: [],
        });
      }
      const data = insightsData.get(key)!;
      data.values.push(obs.value);
      data.timestamps.push(obs.at);
    }

    const insightsToUpsert: InsightDoc[] = [];

    // Compute effect and confidence for each grouped insight
    for (const [insightId, data] of insightsData.entries()) {
      const avgValue = data.values.reduce((sum, val) => sum + val, 0) /
        data.values.length;
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
        signals: [...data.signals].sort(), // Ensure signals array is stored sorted
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
      return {
        error:
          `Unsupported period: ${period}. Only 'week' is supported for now.`,
      };
    }

    const observationsInPeriod = await this.observations.find({
      owner,
      at: { $gte: periodStart, $lte: now },
    }).toArray();

    // Requires: Exists observation for owner within the period
    if (observationsInPeriod.length === 0) {
      return {
        error: "No observations found for owner within the specified period.",
      };
    }

    // --- Compute topHelpful and topHarmful Signals ---
    // These are determined based on the 'effect' of active insights.
    const activeInsights = await this.insights.find({ owner, active: true })
      .toArray();

    const signalAverageEffects: Map<
      Signal,
      { totalEffect: number; count: number }
    > = new Map();

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
      .map(([signal, data]) => ({
        signal,
        avgEffect: data.totalEffect / data.count,
      }))
      .sort((a, b) => b.avgEffect - a.avgEffect); // Sort descending by average effect

    const TOP_N_SIGNALS = 3;
    const EPSILON = 1e-9; // Small number to account for floating point inaccuracies

    const topHelpful: Signal[] = sortedSignalsByEffect
      .filter((s) => s.avgEffect > EPSILON)
      .slice(0, TOP_N_SIGNALS)
      .map((s) => s.signal);

    const topHarmful: Signal[] = sortedSignalsByEffect
      .filter((s) => s.avgEffect < -EPSILON)
      .sort((a, b) => a.avgEffect - b.avgEffect) // Sort ascending for most harmful (lowest effect)
      .slice(0, TOP_N_SIGNALS)
      .map((s) => s.signal);

    // --- Compute metricTrends ---
    // This calculates the average value for each metric observed during the period.
    const metricValuesInPeriod: Map<Metric, number[]> = new Map();
    for (const obs of observationsInPeriod) {
      if (!metricValuesInPeriod.has(obs.metric)) {
        metricValuesInPeriod.set(obs.metric, []);
      }
      metricValuesInPeriod.get(obs.metric)!.push(obs.value);
    }

    const metricTrends: Array<{ metric: Metric; value: number }> = Array.from(
      metricValuesInPeriod.entries(),
    )
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
      // MODIFIED: Always return an array for topHelpful/topHarmful, even if empty,
      // to ensure consistency with `assertExists` in tests and the expectation of an "empty response".
      topHelpful: topHelpful,
      topHarmful: topHarmful,
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
      return {
        error:
          "Requester is not authorized to deactivate this insight: Only the owner can deactivate.",
      };
    }

    const insightId = createInsightKey(owner, signals, metric);

    // Check if the insight exists at all
    const existingInsight = await this.insights.findOne({
      _id: insightId,
      owner,
    });
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
      return {
        error:
          "Failed to deactivate insight (possibly concurrent modification).",
      };
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
  topHelpful: Signal[]; // Changed: Always an array, even if empty
  topHarmful: Signal[]; // Changed: Always an array, even if empty
  metricTrends?: Array<{ metric: Metric; value: number }>; // Optional: Average values for metrics over the period
}
