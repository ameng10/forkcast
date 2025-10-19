## SwapSuggestions Concept Changes (Oct 19, 2025)

### Interesting Moments
1. **Reconciling `Set` semantics with Mongo arrays** — Documented the decision to defer full set normalization while keeping deterministic equality checks. [Snapshot](../../../context/design/concepts/SwapSuggestions/implementation.md/steps/response.faf8bdaa.md)
2. **Owner-gated acceptance path** — Captured how enforcing `requester === owner` safeguards proposal integrity. [Snapshot](../../../context/design/concepts/SwapSuggestions/implementation.md/steps/response.faf8bdaa.md)
3. **Composite proposal lookup guardrails** — Recorded the composite filter that prevents stale or mismatched acceptances. [Snapshot](../../../context/design/concepts/SwapSuggestions/implementation.md/steps/response.faf8bdaa.md)
4. **Narrowing unknown errors in actions** — Explained the unified error handling pattern applied across async flows. [Snapshot](../../../context/design/concepts/SwapSuggestions/implementation.md/steps/response.faf8bdaa.md)
5. **Test database isolation pitfalls** — Highlighted the shared Mongo lifecycle that generated leak warnings and non-deterministic tests. [Snapshot](../../../context/design/concepts/SwapSuggestions/testing.md/steps/response.6c47249a.md)
6. **Observability helpers for proposals** — Noted the addition of internal queries for test visibility and future diagnostics. [Snapshot](../../../context/design/concepts/SwapSuggestions/implementation.md/steps/response.faf8bdaa.md)

### Current State
- `propose` and `accept` respect the spec, with composite lookups and owner checks guarding acceptance.
- Helper queries expose proposal state for both assertions and troubleshooting.
- Error responses follow a consistent `{ error: string }` envelope courtesy of the error-narrowing pattern.
