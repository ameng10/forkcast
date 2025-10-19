## PersonalQA Concept Changes (Oct 19, 2025)

### Interesting Moments
1. **Branded IDs and exposed enums** — Tests rely on the branded `ID` type and exported `FactSource` enum when exercising the concept. [Snapshot](../../../context/design/concepts/PersonalQA/testing.md/steps/file.e02f7094.md)
2. **Fact ingestion guardrails** — Captured the ingestion flow, including acknowledged writes and ownership validation. [Snapshot](../../../context/design/concepts/PersonalQA/implementation.md/steps/_.d72bfb53.md)
3. **Refining the relevance filter** — Documented the keyword extraction logic that ignores tokens shorter than three characters. [Snapshot](../../../context/design/concepts/PersonalQA/implementation.md/steps/_.d72bfb53.md)
4. **Answer and citation workflow** — Showed how answers are generated, stored, and returned with cited facts. [Snapshot](../../../context/design/concepts/PersonalQA/implementation.md/steps/_.d72bfb53.md)
5. **Query helpers for observability** — Recorded utility methods that list a user’s facts and QAs for diagnostics. [Snapshot](../../../context/design/concepts/PersonalQA/implementation.md/steps/_.d72bfb53.md)
6. **Mongo collection namespacing** — Highlighted the `PREFIX` convention that isolates PersonalQA collections. [Snapshot](../../../context/design/concepts/PersonalQA/testing.md/steps/file.9b7d0f8e.md)

### Current State
- Core actions (`ingestFact`, `forgetFact`, `ask`) run with branded IDs and consistently stored citations.
- Query helpers expose the stored facts and QA history for both tests and diagnostics.
- Namespaced collections keep PersonalQA data isolated in shared Mongo deployments.
