---
timestamp: 'Sat Oct 18 2025 18:05:54 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_180554.0f659188.md]]'
content_id: 47c172ecf35c1401e6d44349c0c2835b82beaa545d63ec6fa1c0de1a547c8c79
---

# fix the following errors:

Conversion of type '{ report: ReportDoc; } | { error: string; }' to type '{ report: ID; }' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
Property 'report' is missing in type '{ error: string; }' but required in type '{ report: ID; }'.deno-ts(2352)
InsightMiningConcept.test.ts(204, 49): 'report' is declared here.

Property '\_id' does not exist on type 'ID'.deno-ts(2339)
