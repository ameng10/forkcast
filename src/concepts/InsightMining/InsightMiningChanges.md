## InsightMining Concept Changes (Oct 19, 2025)

### Interesting Moments
1. **Deterministic insight identifiers** — Introduced a stable `createInsightKey` so repeated signal sets collapse into one document. [Snapshot](../../../context/design/concepts/InsightMining/implementation.md/steps/file.24a42d4b.md)
2. **Grouping observations by signal sets** — Sorted and grouped signals plus metric to prevent duplicate aggregates. [Snapshot](../../../context/design/concepts/InsightMining/implementation.md/steps/file.24a42d4b.md)
3. **Effect and confidence heuristics** — Captured the initial formulas that keep results bounded and testable. [Snapshot](../../../context/design/concepts/InsightMining/implementation.md/steps/file.24a42d4b.md)
4. **Epsilon threshold for neutrality** — Added a small epsilon to ignore floating-point noise when classifying helpful vs harmful. [Snapshot](../../../context/design/concepts/InsightMining/testing.md/steps/response.223a761b.md)
5. **Always returning helpful/harmful arrays** — Ensured summary outputs always expose array fields for downstream destructuring. [Snapshot](../../../context/design/concepts/InsightMining/testing.md/steps/response.223a761b.md)
6. **Upsert flow for insight lifecycle** — Documented the Mongo upsert strategy that keeps updates idempotent. [Snapshot](../../../context/design/concepts/InsightMining/testing.md/steps/response.223a761b.md)

### Current State
- Insight aggregation is deterministic thanks to sorted signal grouping and stable IDs.
- Summary responses consistently include helpful/harmful arrays alongside effect/confidence heuristics.
- Mongo writes rely on upserts to keep read-modify-write cycles resilient.
