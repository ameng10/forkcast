---
timestamp: 'Fri Nov 07 2025 10:19:38 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_101938.e60a0956.md]]'
content_id: 4d650cd22ac0f54972c4cdda1f1b5cbb509cf2739a788baa2fda107c65be9aa5
---

# concept: QuickCheckIns

**concept** QuickCheckIns \[User, ExternalMetricID]

**purpose** Record simple, timed, numeric self-reports against user-defined metrics.

**principle** A user first defines a custom metric, such as 'Energy Level'. Later, the user can record multiple check-ins for this metric, each with a specific time and a numeric value, building a history of their self-reported data.

**state**

```
a set of CheckIns with
  an owner User
  an at DateTime
  a metric ExternalMetricID
  a value Number

a set of Metrics with
  a name String
```

**actions**

```
defineMetric (name: String): (metric: ExternalMetricID)
```

* **requires** no Metric exists with the given `name`.
* **effects** creates a new Metric `m`; sets the name of `m` to `name`; returns the ID of `m` as `metric`.

```
defineMetric (name: String): (error: String)
```

* **requires** a Metric with the given `name` already exists.
* **effects** returns an error message.

```
record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (checkIn: CheckIn)
```

* **requires** a Metric with the ID `metric` exists.
* **effects** creates a new CheckIn `c`; sets the owner of `c` to `owner`, `at` to `at`, `metric` to `metric`, and `value` to `value`; returns the ID of `c` as `checkIn`.

```
record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (error: String)
```

* **requires** no Metric with the ID `metric` exists.
* **effects** returns an error message.

```
edit (checkIn: CheckIn, owner: User, metric: ExternalMetricID, value: Number)
```

* **requires** the CheckIn `checkIn` exists; the owner of `checkIn` is `owner`; a Metric with the ID `metric` exists.
* **effects** updates the metric of `checkIn` to `metric` and the value of `checkIn` to `value`.

```
edit (checkIn: CheckIn, owner: User, metric: ExternalMetricID)
```

* **requires** the CheckIn `checkIn` exists; the owner of `checkIn` is `owner`; a Metric with the ID `metric` exists.
* **effects** updates the metric of `checkIn` to `metric`.

```
edit (checkIn: CheckIn, owner: User, value: Number)
```

* **requires** the CheckIn `checkIn` exists; the owner of `checkIn` is `owner`.
* **effects** updates the value of `checkIn` to `value`.

```
edit (checkIn: CheckIn, owner: User, metric: ExternalMetricID, value: Number): (error: String)
```

* **requires** the CheckIn `checkIn` does not exist, or its owner is not `owner`, or a Metric with ID `metric` does not exist.
* **effects** returns an error message.

```
delete (checkIn: CheckIn, owner: User)
```

* **requires** the CheckIn `checkIn` exists and its owner is `owner`.
* **effects** removes the CheckIn `checkIn`.

```
delete (checkIn: CheckIn, owner: User): (error: String)
```

* **requires** the CheckIn `checkIn` does not exist or its owner is not `owner`.
* **effects** returns an error message.

```
deleteMetric (metric: ExternalMetricID)
```

* **requires** the Metric with ID `metric` exists and no CheckIn refers to it.
* **effects** removes the Metric `metric`.

```
deleteMetric (metric: ExternalMetricID): (error: String)
```

* **requires** the Metric with ID `metric` does not exist, or at least one CheckIn refers to it.
* **effects** returns an error message.

**queries**

```
_getCheckIn (checkIn: CheckIn): (checkIn: {_id: CheckIn, owner: User, at: DateTime, metric: ExternalMetricID, value: Number})
```

* **requires** the CheckIn `checkIn` exists.
* **effects** returns the properties of the CheckIn `checkIn`.

```
_getMetricsByName (name: String): (metric: {_id: ExternalMetricID, name: String})
```

* **requires** true.
* **effects** returns all Metrics with the given `name`.

```
_listCheckInsByOwner (owner: User): (checkIn: {_id: CheckIn, owner: User, at: DateTime, metric: ExternalMetricID, value: Number})
```

* **requires** true.
* **effects** returns all CheckIns with the given `owner`.
