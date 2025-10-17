[@concept-design-brief](../../background/concept-design-brief.md)
[@concept-design-overview](../../background/concept-design-overview.md)
[@concept-specifications](../../background/concept-specifications.md)
[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-state](../../background/detailed/concept-state.md)

# implement: QuickCheckIns using the following framework. Make sure the specifications follow the concept framework. Fix any formatting and modularity issues and make sure the specification matches code made. Write the code in typescript. Use asyncs when needed.

### Concept: QuickCheckIns [User, Metric]

**purpose** Record simple self-reports to correlate with recent meals.

**principle** A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.

**state**

- A set of CheckIns with:
    - owner: User
    - at: Time
    - metric: Metric (e.g., energy, mood, gut_discomfort)
    - value: Number

**actions**

- `record(owner: User, at: Time, metric: Metric, value: Number): (checkIn: CheckIn)`

    - **requires:** owner exists and metric is allowed
    - **effects:** create a check-in and return it
- `defineMetric(metric: Metric)`

    - **effects:** register a new allowed metric
- `edit(checkIn: CheckIn, metric?: Metric, value?: Number)`

    - **requires:** checkIn exists and caller is the owner
    - **effects:** update provided fields (metric and/or value)

# response:
