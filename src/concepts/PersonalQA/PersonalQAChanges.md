## PersonalQA Concept & Specification Changes (Oct 16, 2025)

### Specification Changes
- No major changes to the conceptual specification in `PersonalQASpecification.md`. The concept still models facts and QAs, and supports ingesting facts, forgetting facts, and answering questions with citations.

### Concept Implementation Changes (`PersonalQAConcept.ts`)
- **Type Fixes:** Used branded `ID` type for user and entity IDs for stronger typing.
- **Export Fixes:** Exported `FactSource` enum for use in tests.
- **MongoDB Connection:** Used collection prefix for namespacing facts and QAs.
- **Fact Ingestion:** Implemented `ingestFact` to add facts to the database.
- **Fact Removal:** Implemented `forgetFact` with checks for ownership and existence.
- **Question Answering:** Implemented `ask` to generate answers based on user facts, with citation logic and QA storage.
- **Queries:** Added internal queries to fetch all facts and QAs for a user.
## PersonalQA Concept Updates

- Exported the `FactSource` enum and tightened the zero-fact fallback so `ask` always reports the user’s fact count.
- Refined the `ask` relevance filter to strip punctuation and ignore tokens shorter than three characters, preventing incidental matches on words like “to” or “my”.
- Rebuilt the test suite with five focused Deno tests covering the principle, each action, and the query helpers while reusing the shared enum and branded IDs.

## Issues Encountered

- The initial relevance filter treated every word in the question literally, so even two-letter tokens triggered matches and caused the “no relevant facts” assertions to fail. The fix was to normalize tokens and require a minimum length before matching.
- Local test runs still require a reachable MongoDB instance; sandboxed environments without network access cause the suite to fail before executing assertions.
