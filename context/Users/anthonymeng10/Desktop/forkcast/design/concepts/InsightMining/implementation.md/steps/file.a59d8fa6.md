---
timestamp: 'Fri Nov 07 2025 00:55:28 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_005528.a0037f6e.md]]'
content_id: a59d8fa6248678cfd7cd3a0aa15e535ca1e4d80d5ef55d48639a26bbf76fd085
---

# file: src/InsightMining/InsightMiningConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "InsightMining" + ".";

// Generic types of this concept, branded as ID for type safety
type User = ID;
type Signal = ID;
type Metric = ID;
type Report = ID;

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

// State Interfaces for MongoDB Documents

/**
 * Corresponds to SSF:
 * a set of Observations with
 *   an owner User
 *   an at Date
 *   a signals set of Signal
 *   a metric Metric
 *   a value Number
 */
interface ObservationDoc {
  _id: ID;
  owner: User;
  at: Date;
  signals: Signal[];
  metric: Metric;
  value: number;
}

/**
 * Corresponds to SSF:
 * a set of Insights with
 *   an owner User
 *   a signals set of Signal
 *   a metric Metric
 *   an effect Number
 *   a confidence Number
 *   an active Flag
 */
interface InsightDoc {
  _id: ID;
  owner: User;
  signals: Signal[];
  metric: Metric;
  effect: number;
  confidence: number;
  active: boolean;
}

/**
 * Corresponds to SSF:
 * a set of MetricTrends with
 *   a metric Metric
 *   a value Number
 */
interface MetricTrend {
  metric: Metric;
  value: number;
}

/**
 * Corresponds to SSF:
 * a set of Reports with
 *   an owner User
 *   a period String
 *   a generatedAt Date
 *   a topHelpful set of Signal
 *   a topHarmful set of Signal
 *   an optional metricTrends set of MetricTrend
 */
interface ReportDoc {
  _id: Report;
  owner: User;
  period: string;
  generatedAt: Date;
  topHelpful: Signal[];
  topHarmful: Signal[];
  metricTrends?: MetricTrend[];
}

/**
 * @concept InsightMining
 * @purpose To identify correlations between user-reported signals and metrics, and to generate periodic summary reports of these insights.
 */
export default class InsightMiningConcept {
  observations: Collection<ObservationDoc>;
  insights: Collection<InsightDoc>;
  reports: Collection<ReportDoc>;

  constructor(private readonly db: Db) {
    this.observations = this.db.collection(PREFIX + "observations");
    this.insights = this.db.collection(PREFIX + "insights");
    this.reports = this.db.collection(PREFIX + "reports");
  }

  /**
   * ingest (owner: User, at: Date, signals: set of Signal, metric: Metric, value: Number)
   *
   * **requires** true
   *
   * **effects** Creates a new Observation document in the database.
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
      _id: freshID(),
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
   * analyze (owner: User, window: Number)
   *
   * **requires** At least one Observation exists for the owner within the specified time window (in hours).
   *
   * **effects** Creates new Insights or updates existing ones based on an analysis of the user's
   *           observations within the window. Insights are uniquely identified by a combination of
   *           owner, signals, and metric.
   */
  async analyze(
    { owner, window }: {
      owner: User;
      window: number; // In hours
    },
  ): Promise<Empty | { error: string }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - window * 60 * 60 * 1000);

    const recentObservations = await this.observations.find({
      owner,
      at: { $gte: windowStart, $lte: now },
    }).toArray();

    if (recentObservations.length === 0) {
      return {
        error: "No observations found for owner within the specified window.",
      };
    }

    const insightsData = new Map<ID, {
      signals: Signal[];
      metric: Metric;
      values: number[];
    }>();

    for (const obs of recentObservations) {
      const key = createInsightKey(owner, obs.signals, obs.metric);
      if (!insightsData.has(key)) {
        insightsData.set(key, {
          signals: obs.signals,
          metric: obs.metric,
          values: [],
        });
      }
      insightsData.get(key)!.values.push(obs.value);
    }

    const insightsToUpsert: InsightDoc[] = [];
    for (const [insightId, data] of insightsData.entries()) {
      const avgValue = data.values.reduce((sum, val) => sum + val, 0) /
        data.values.length;
      const numObservations = data.values.length;

      // Simplistic insight computation:
      // Effect: Deviation from a baseline (e.g., 5 is neutral).
      const effect = avgValue - 5;
      // Confidence: Increases with more observations, capping at 1.
      const confidence = Math.min(1, numObservations / 10);

      insightsToUpsert.push({
        _id: insightId,
        owner,
        signals: [...data.signals].sort(),
        metric: data.metric,
        effect,
        confidence,
        active: true,
      });
    }

    for (const insight of insightsToUpsert) {
      await this.insights.updateOne(
        { _id: insight._id },
        { $set: insight },
        { upsert: true },
      );
    }

    return {};
  }

  /**
   * summarize (owner: User, period: String): (report: Report)
   *
   * **requires** At least one observation exists for the owner within the specified period (e.g., "week").
   *
   * **effects** Creates a new Report document containing trends and insights for the period and returns its ID.
   */
  async summarize(
    { owner, period }: { owner: User; period: string },
  ): Promise<{ report: Report } | { error: string }> {
    const now = new Date();
    let periodStart: Date;

    if (period === "week") {
      periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      return { error: `Unsupported period: ${period}.` };
    }

    const observationsInPeriod = await this.observations.find({
      owner,
      at: { $gte: periodStart, $lte: now },
    }).toArray();

    if (observationsInPeriod.length === 0) {
      return {
        error: "No observations found for owner within the specified period.",
      };
    }

    const activeInsights = await this.insights.find({ owner, active: true })
      .toArray();

    const signalEffects: Map<Signal, { totalEffect: number; count: number }> = new Map();
    for (const insight of activeInsights) {
      for (const signal of insight.signals) {
        if (!signalEffects.has(signal)) {
          signalEffects.set(signal, { totalEffect: 0, count: 0 });
        }
        const current = signalEffects.get(signal)!;
        current.totalEffect += insight.effect;
        current.count += 1;
      }
    }

    const sortedSignals = Array.from(signalEffects.entries())
      .map(([signal, data]) => ({
        signal,
        avgEffect: data.totalEffect / data.count,
      }))
      .sort((a, b) => b.avgEffect - a.avgEffect);

    const topHelpful = sortedSignals
      .filter((s) => s.avgEffect > 0)
      .slice(0, 3)
      .map((s) => s.signal);

    const topHarmful = sortedSignals
      .filter((s) => s.avgEffect < 0)
      .reverse() // Most negative comes first
      .slice(0, 3)
      .map((s) => s.signal);

    const metricValues: Map<Metric, number[]> = new Map();
    for (const obs of observationsInPeriod) {
      if (!metricValues.has(obs.metric)) {
        metricValues.set(obs.metric, []);
      }
      metricValues.get(obs.metric)!.push(obs.value);
    }

    const metricTrends: MetricTrend[] = Array.from(metricValues.entries())
      .map(([metric, values]) => ({
        metric,
        value: values.reduce((sum, val) => sum + val, 0) / values.length,
      }));

    const report: ReportDoc = {
      _id: freshID(),
      owner,
      period,
      generatedAt: now,
      topHelpful,
      topHarmful,
      metricTrends,
    };

    await this.reports.insertOne(report);
    return { report: report._id };
  }

  /**
   * deactivate (requester: User, owner: User, signals: set of Signal, metric: Metric)
   *
   * **requires** The requester is the owner of the insight.
   * **requires** An active insight exists for the specified owner, signals, and metric.
   *
   * **effects** Sets the 'active' flag of the matching insight to false.
   */
  async deactivate(
    { requester, owner, signals, metric }: {
      requester: User;
      owner: User;
      signals: Signal[];
      metric: Metric;
    },
  ): Promise<Empty | { error: string }> {
    if (requester !== owner) {
      return { error: "Requester is not authorized to deactivate this insight." };
    }

    const insightId = createInsightKey(owner, signals, metric);
    const existingInsight = await this.insights.findOne({ _id: insightId, owner });

    if (!existingInsight) {
      return { error: "No matching insight found to deactivate." };
    }

    if (!existingInsight.active) {
      return { error: "Insight is already inactive." };
    }

    const result = await this.insights.updateOne(
      { _id: insightId, owner },
      { $set: { active: false } },
    );

    if (result.matchedCount === 0) {
      return { error: "Failed to deactivate insight (possibly concurrent modification)." };
    }

    return {};
  }

  // --- Concept Queries ---

  /**
   * _getObservationsForUser (owner: User): (observation: Observation)
   *
   * **requires** true
   *
   * **effects** Returns all observations for the given user.
   */
  async _getObservationsForUser(
    { owner }: { owner: User },
  ): Promise<ObservationDoc[]> {
    return await this.observations.find({ owner }).toArray();
  }

  /**
   * _getInsightsForUser (owner: User): (insight: Insight)
   *
   * **requires** true
   *
   * **effects** Returns all insights (active and inactive) for the given user.
   */
  async _getInsightsForUser(
    { owner }: { owner: User },
  ): Promise<InsightDoc[]> {
    return await this.insights.find({ owner }).toArray();
  }

  /**
   * _getReport (reportId: Report): (report: Report)
   *
   * **requires** true
   *
   * **effects** Returns the report matching the given ID, or an empty array if not found.
   */
  async _getReport(
    { reportId }: { reportId: Report },
  ): Promise<ReportDoc[]> {
    return await this.reports.find({ _id: reportId }).limit(1).toArray();
  }
}
```
