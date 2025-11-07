[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-state](../../background/detailed/concept-state.md)

[@QuickCheckInsImplementation](QuickCheckInsImplementation.md)

[@sync-background](../../tools/sync-background.md)

# implement: The QuickCheckIns concept specification based on the implementation and concept specification overview. If the action throws an error, add a throws section.

# response:

# response:

# concept: QuickCheckIns

**concept** QuickCheckIns [User, ExternalMetricID]

**purpose** To record simple, time-stamped, user-owned numeric self-reports against defined metrics.

**principle** If a user first defines a metric such as 'Energy Level', and then later records a check-in with a value of '8' for that metric, the system will store this data point, associating it with the user, the time, the metric, and the value, making it available for later retrieval and analysis.

**state**
```
a set of CheckIns with
  an owner User
  an at DateTime
  a metric ExternalMetricID
  a value Number

a set of InternalMetrics with
  a name String
```

**actions**

`record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): ({checkIn: CheckIn} | {error: string})`

*   **requires** The `InternalMetric` identified by `metric` exists.
*   **effects** On success, creates a new `CheckIn` `c`, sets its properties (`owner`, `at`, `metric`, `value`), and returns the ID of `c` as `checkIn`. On failure, returns an error.

`defineMetric (name: String): ({metric: ExternalMetricID} | {error: string})`

*   **requires** No `InternalMetric` with the given `name` already exists.
*   **effects** On success, creates a new `InternalMetric` `m` with a fresh ID, sets its name to `name`, and returns its ID as `metric`. On failure, returns an error.

`edit (checkIn: CheckIn, owner: User, metric?: ExternalMetricID, value?: Number): ({} | {error: string})`

*   **requires** The `CheckIn` identified by `checkIn` exists, its `owner` is the given `owner`, and if `metric` is provided, the `InternalMetric` identified by `metric` must exist.
*   **effects** On success, updates the provided fields (`metric` and/or `value`) of the specified `CheckIn`. On failure, returns an error.

`delete (checkIn: CheckIn, owner: User): ({} | {error: string})`

*   **requires** The `CheckIn` identified by `checkIn` exists and its `owner` is the given `owner`.
*   **effects** On success, permanently removes the `CheckIn` document. On failure, returns an error.

`deleteMetric (metric: ExternalMetricID): ({} | {error: string})`

*   **requires** The `InternalMetric` identified by `metric` exists and no `CheckIn` documents reference it.
*   **effects** On success, permanently removes the `InternalMetric` document. On failure, returns an error.

**queries**

`_getCheckIn (checkIn: CheckIn): (CheckIn)`

*   **effects** Returns the `CheckIn` document matching the given ID.

`_getMetricsByName (name: String): (InternalMetric)`

*   **effects** Returns the `InternalMetric` document matching the given name.

`_listCheckInsByOwner (owner: User): (CheckIn)`

*   **effects** Returns all `CheckIn` documents belonging to the specified `owner`.