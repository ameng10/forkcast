---
timestamp: 'Fri Nov 07 2025 10:10:30 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_101030.1de12a09.md]]'
content_id: f7fc28e15d7263bc258b63c9be76ebd1b80fda81f76525cfcdd5db8ec503908d
---

# concept: QuickCheckIns

**concept** QuickCheckIns \[User, ExternalMetricID]

**purpose** Enable users to record timestamped, numeric data points for a predefined set of metrics.

**principle** After a metric such as 'Energy Level' is defined, a user can log a check-in at a specific time with a numeric value (e.g., a 7 out of 10). This recorded data point is associated with the user and can be retrieved later for analysis.

**state**

```
a set of CheckIns with
  an owner User
  an at DateTime
  a metric ExternalMetricID
  a value Number

a set of ExternalMetricIDs with
  a name String
```

**actions**

`defineMetric (name: String): (metric: ExternalMetricID)`

* **requires** No metric with the given `name` already exists.
* **effects** Creates a new metric identified by a fresh `ExternalMetricID`, sets its `name`, and returns the new ID.

`defineMetric (name: String): (error: String)`

* **requires** A metric with the given `name` already exists.
* **effects** Returns an error message.

`record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (checkIn: CheckIn)`

* **requires** A metric with the given `metric` ID exists.
* **effects** Creates a new `CheckIn` with a fresh ID, sets its `owner`, `at`, `metric`, and `value` properties, and returns the new `CheckIn` ID.

`record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (error: String)`

* **requires** No metric with the given `metric` ID exists.
* **effects** Returns an error message.

`edit (checkIn: CheckIn, owner: User, metric?: ExternalMetricID, value?: Number): ()`

* **requires**
  * The `CheckIn` identified by `checkIn` exists.
  * The owner of the `CheckIn` is `owner`.
  * If `metric` is provided, a metric with that ID must exist.
* **effects** Updates the `metric` and/or `value` fields of the specified `CheckIn`. If no fields are provided to update, the action succeeds with no change.

`edit (checkIn: CheckIn, owner: User, metric?: ExternalMetricID, value?: Number): (error: String)`

* **requires** The `checkIn` does not exist, the `owner` is not the owner of the `checkIn`, or the provided `metric` ID does not exist.
* **effects** Returns an error message.

`delete (checkIn: CheckIn, owner: User): ()`

* **requires** The `CheckIn` identified by `checkIn` exists and its owner is `owner`.
* **effects** Permanently removes the specified `CheckIn`.

`delete (checkIn: CheckIn, owner: User): (error: String)`

* **requires** The `checkIn` does not exist or the `owner` is not the owner of the `checkIn`.
* **effects** Returns an error message.

`deleteMetric (metric: ExternalMetricID): ()`

* **requires**
  * The metric with the given ID exists.
  * No `CheckIn` references this `metric`.
* **effects** Permanently removes the specified metric.

`deleteMetric (metric: ExternalMetricID): (error: String)`

* **requires** The metric does not exist, or at least one `CheckIn` references it.
* **effects** Returns an error message.

**queries**

`_getCheckIn (checkIn: CheckIn): (record: { _id: CheckIn, owner: User, at: DateTime, metric: ExternalMetricID, value: Number })`

* **effects** Returns the full record for the given check-in ID.

`_getMetricsByName (name: String): (record: { _id: ExternalMetricID, name: String })`

* **effects** Returns the full record for the metric with the given name.

`_listCheckInsByOwner (owner: User): (record: { _id: CheckIn, owner: User, at: DateTime, metric: ExternalMetricID, value: Number })`

* **effects** Returns all check-in records created by the specified owner.
