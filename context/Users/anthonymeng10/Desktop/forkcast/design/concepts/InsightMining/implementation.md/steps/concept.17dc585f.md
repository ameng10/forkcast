---
timestamp: 'Fri Nov 07 2025 00:55:28 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_005528.a0037f6e.md]]'
content_id: 17dc585fdc3b38701a1af8b00e831187584c10cffa911d3c3b9ab9b5edc721fa
---

# concept: InsightMining

**concept** InsightMining \[User, Signal, Metric]

**purpose** To identify correlations between user-reported signals and metrics, and to generate periodic summary reports of these insights.

**principle** A user regularly ingests observations (e.g., "ate fried food", "energy level: 2"). After a period, the user runs an analysis which identifies that "fried food" has a negative effect on their "energy level". Later, a weekly summary report highlights "fried food" as a top harmful signal for that metric. The user can then choose to deactivate this insight if they find it unhelpful.

**state**

```ssf
a set of Observations with
  an owner User
  an at Date
  a signals set of Signal
  a metric Metric
  a value Number

a set of Insights with
  an owner User
  a signals set of Signal
  a metric Metric
  an effect Number
  a confidence Number
  an active Flag

a set of Reports with
  an owner User
  a period String
  a generatedAt Date
  a topHelpful set of Signal
  a topHarmful set of Signal
  an optional metricTrends set of MetricTrend

a set of MetricTrends with
  a metric Metric
  a value Number
```

**actions**

```
ingest (owner: User, at: Date, signals: set of Signal, metric: Metric, value: Number)

analyze (owner: User, window: Number)
  requires at least one Observation for owner within the window
  effects creates or updates Insights based on Observations in the window

summarize (owner: User, period: String): (report: Report)
  requires at least one Observation for owner within the period
  effects creates a new Report summarizing active Insights and metric trends for the period

deactivate (requester: User, owner: User, signals: set of Signal, metric: Metric)
  requires requester is owner; an active Insight exists for the given owner, signals, and metric
  effects sets the 'active' flag of the matching Insight to false
```

**queries**

```
_getObservationsForUser (owner: User): (observation: Observation)
_getInsightsForUser (owner: User): (insight: Insight)
_getReport (reportId: Report): (report: Report)
```
