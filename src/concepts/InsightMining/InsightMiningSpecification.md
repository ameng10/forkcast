# concept: InsightMining

**concept** InsightMining [User, Signal, Metric, Report]

**purpose** To identify correlations between user-reported signals and metrics, and to generate periodic summary reports of these insights.

**principle** A user ingests multiple observations over time, each linking a set of signals to a metric value. After enough data is collected, the user triggers an analysis, which generates insights about the correlation between signal combinations and metric outcomes. Subsequently, the user can request a summary report for a period, which presents the most positively and negatively correlated signals based on the active insights.

**state**
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

**actions**
ingest (owner: User, at: Date, signals: set of Signal, metric: Metric, value: Number)
  **requires** true
  **effects** Creates a new Observation with the provided data.

analyze (owner: User, window: Number)
  **requires** At least one Observation exists for the owner within the specified time window.
  **effects** Aggregates the owner's observations within the window to compute correlations. For each unique combination of signals and metric, creates a new Insight or updates an existing one, setting its `effect` and `confidence` values and marking it as `active`.

summarize (owner: User, period: String): (report: Report)
  **requires** At least one Observation exists for the owner within the specified period.
  **effects** Creates a summary Report for the owner over the given period. The report includes the top helpful and harmful signals based on all active insights for the owner, and trends for each metric based on observations within the period. Returns the ID of the new Report.

deactivate (requester: User, owner: User, signals: set of Signal, metric: Metric)
  **requires** `requester` is the same as `owner`. An active Insight exists for the given `owner`, `signals`, and `metric`.
  **effects** Sets the `active` flag of the specified Insight to false, effectively excluding it from future summary reports.

**queries**
_getObservationsForUser (owner: User): (observation: Observation)
  **requires** true
  **effects** Returns all Observations created by the specified `owner`.

_getInsightsForUser (owner: User): (insight: Insight)
  **requires** true
  **effects** Returns all Insights (both active and inactive) for the specified `owner`.

_getReport (reportId: Report): (report: Report)
  **requires** true
  **effects** Returns the Report matching the given `reportId`.
