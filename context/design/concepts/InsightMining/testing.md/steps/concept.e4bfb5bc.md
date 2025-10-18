---
timestamp: 'Sat Oct 18 2025 18:07:21 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_180721.d0d228c5.md]]'
content_id: e4bfb5bcd0b9ca75a45ef2bbd0a02503a48a7091404b1ab2488c3ea93a05361c
---

# concept: InsightMining (No changes here, as it was already provided and well-formed)

**concept** InsightMining \[User, Signal, Metric]

**purpose** Turn observations into per-user insights and weekly summaries.

**principle** The system ingests observations (signals and metric values over time), analyzes them to publish insights with effect and confidence, and can summarize trends over a period.

**state**

* A set of Observations with:
  * owner: User
  * at: Time
  * signals: Set(Signal)
  * metric: Metric
  * value: Number
* A set of Insights with:
  * owner: User
  * signals: Set(Signal)
  * metric: Metric
  * effect: Number (positive or negative)
  * confidence: Number (0..1)
  * active: Flag
* A set of Reports with:
  * owner: User
  * period: String (e.g., "week")
  * generatedAt: Time
  * topHelpful: Set(Signal) (optional)
  * topHarmful: Set(Signal) (optional)
  * metricTrends: Set(Metric, Number) (optional)

**actions**

* `ingest(owner: User, at: Time, signals: Set(Signal), metric: Metric, value: Number)`
  * **effects:** add an observation for owner
* `analyze(owner: User, window: Hours)`
  * **requires:** exists observation for owner within window
  * **effects:** compute insights from those observations; create or update Insights with effect and confidence
* `summarize(owner: User, period: String): (report: Report)`
  * **requires:** exists observation for owner within the period
  * **effects:** compute a trend summary; create Report; return it
* `deactivate(requester: User, owner: User, signals: Set(Signal), metric: Metric)`
  * **requires:** insight exists for (owner, signals, metric) and requester = owner
  * **effects:** set that insight’s active = false

***
