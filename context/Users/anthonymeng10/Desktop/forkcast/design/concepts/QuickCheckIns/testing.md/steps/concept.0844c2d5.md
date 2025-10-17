---
timestamp: 'Fri Oct 17 2025 14:26:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_142600.4e6e0127.md]]'
content_id: 0844c2d5d0abd328ab9a38fbd6b263df48c6b57430f8c17b8bdc468f6f64fab5
---

# concept: QuickCheckIns

* **concept**: QuickCheckIns \[User, ExternalMetricID]
* **purpose**: Record simple self-reports to correlate with recent meals.
* **principle**: A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.
* **state**:
  * A set of `CheckIns` with
    * an `owner` User
    * an `at` DateTime
    * a `metric` ExternalMetricID
    * a `value` Number
  * A set of `InternalMetrics` with
    * a `name` String
* **actions**:
  * `record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (checkIn: CheckIn)`
    * **requires**: The InternalMetric 'metric' exists (refers to an InternalMetric whose `_id` matches 'metric').
    * **effects**: Creates a new CheckIn 'checkIn', sets its owner, `at` timestamp, metric, and value, then returns the ID of 'checkIn'.
  * `defineMetric (name: String): (metric: ExternalMetricID)`
    * **requires**: No InternalMetric with 'name' exists.
    * **effects**: Creates a new InternalMetric 'metric' with a fresh ID, sets its name, and returns the ID of the new 'metric'.
  * `edit (checkIn: CheckIn, owner: User, metric?: ExternalMetricID, value?: Number): Empty`
    * **requires**: The CheckIn 'checkIn' exists. The owner of 'checkIn' is 'owner'. If 'metric' is provided, then the InternalMetric 'metric' must exist.
    * **effects**: If 'metric' is provided, updates the metric of 'checkIn' to 'metric'. If 'value' is provided, updates the value of 'checkIn' to 'value'.
