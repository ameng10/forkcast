---
timestamp: 'Fri Oct 17 2025 14:14:09 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_141409.d4b0a09f.md]]'
content_id: c45eb8184a79478f1bac39931e6aa7e8457d091c99e0d7adc805451004242e82
---

# response:

```concept
concept QuickCheckIns [User, ExternalMetricID]

purpose Record simple self-reports to correlate with recent meals.

principle A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.

state
  a set of CheckIns with
    an owner User
    an at DateTime
    a metric ExternalMetricID
    a value Number

  a set of InternalMetrics with
    a name String

actions

  record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (checkIn: CheckIn)
    requires
      the InternalMetric 'metric' exists // refers to an InternalMetric whose _id matches 'metric'
    effects
      create a new CheckIn 'checkIn'
      set owner of 'checkIn' to 'owner'
      set at of 'checkIn' to 'at'
      set metric of 'checkIn' to 'metric'
      set value of 'checkIn' to 'value'
      return 'checkIn'

  defineMetric (name: String): (metric: ExternalMetricID)
    requires
      no InternalMetric with 'name' exists
    effects
      create a new InternalMetric 'metric' with a fresh ID
      set name of 'metric' to 'name'
      return the ID of the new 'metric'

  edit (checkIn: CheckIn, owner: User, metric?: ExternalMetricID, value?: Number): Empty
    requires
      the CheckIn 'checkIn' exists
      owner of 'checkIn' is 'owner'
      if 'metric' is provided, then the InternalMetric 'metric' exists
    effects
      if 'metric' is provided, update metric of 'checkIn' to 'metric'
      if 'value' is provided, update value of 'checkIn' to 'value'
```
