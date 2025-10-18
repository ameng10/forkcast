## InsightMining — Changes, fixes, and problems encountered (Oct 18, 2025)

Summary
-------
This documents the edits, issues, and design decisions encountered while implementing and testing the `InsightMining` concept. It compares the specification, the TypeScript implementation in `src/concepts/InsightMining/InsightMiningConcept.ts`, and the test expectations in `src/concepts/InsightMining/InsightMiningConcept.test.ts`.

Files inspected
- `design/concepts/InsightMining/implementation.md` (design + expected behavior)
- `src/concepts/InsightMining/InsightMiningSpecification.md` (formal spec)
- `src/concepts/InsightMining/InsightMiningConcept.ts` (TypeScript implementation)
- `src/concepts/InsightMining/InsightMiningConcept.test.ts` (tests)

Major fixes and changes made in implementation
- Deterministic insight IDs: implemented `createInsightKey(owner, signals, metric)` to upsert insights consistently (required by tests).
- Analysis grouping: grouped observations by sorted signals + metric to compute per-combination insights.
- Effect & confidence computation: implemented simple heuristics (effect = avg - 5, confidence = min(1, n/10)).
- Summarize: ensured `topHelpful` and `topHarmful` are always arrays (possibly empty) so tests that assert existence pass even when there are no helpful/harmful signals.

Problems encountered (and how they were resolved)
- Tests expect deterministic insight counts and values. Ensured grouping and sorting of signals before computing keys so the same combinations map to one insight.
- Floating point noise caused borderline zero-average signals to appear incorrectly; introduced an EPSILON (1e-9) threshold to treat near-zero averages as zero for helpful/harmful classification.
- Some earlier drafts returned `topHelpful`/`topHarmful` only when non-empty; tests expected an array to exist even when empty, so the implementation now always returns arrays.
- Report structure in tests expects `metricTrends` to be present and contain averages; ensured metric averaging logic includes all observations in the period.
- Concurrency/mongo upsert: used `updateOne(..., { upsert: true })` to create/update insights stably.
