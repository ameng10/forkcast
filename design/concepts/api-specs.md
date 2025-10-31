[@api-extraction-from-code](../tools/api-extraction-from-code.md)

[@api-extraction-from-spec](../tools/api-extraction-from-spec.md)


# API Specification (Canonical Endpoints)
Please extract an API for this app from the following 5 concepts. Fill in requirements and effects using the concept implementation the concept specs:

For implementation details, see the linked specification and code per concept.

---

## PersonalQA — Base: `/api/PersonalQA`

Spec: [@PersonalQASpecification](/src/concepts/PersonalQA/PersonalQASpecification.md)
Code: [@PersonalQAConcept.ts](/src/concepts/PersonalQA/PersonalQAConcept.ts)

Endpoints:
- POST `/api/PersonalQA/ingestFact`
- POST `/api/PersonalQA/forgetFact`
- POST `/api/PersonalQA/ask`
- POST `/api/PersonalQA/_getUserFacts`
- POST `/api/PersonalQA/_getUserQAs`

### PersonalQA (extended LLM endpoints)
- POST `/api/PersonalQA/setTemplate`
  - body: { requester: ID, name: string, template: string }
  - returns: {}
- POST `/api/PersonalQA/askLLM`
  - body: { requester: ID, question: string, k?: number, model?: string }
  - returns: { answer: string, citedFacts: ID[], confidence: number }
- POST `/api/PersonalQA/_getUserDrafts`
  - body: { owner: ID }
  - returns: Draft[] where Draft = { _id: ID, owner: ID, question: string, rawText: string, rawJson: unknown, validated: boolean }

---

## InsightMining — Base: `/api/InsightMining`

Spec: [@InsightMiningSpecification](/src/concepts/InsightMining/InsightMiningSpecification.md)
Code: [@InsightMiningConcept.ts](/src/concepts/InsightMining/InsightMiningConcept.ts)

Endpoints:
- POST `/api/InsightMining/ingest`
- POST `/api/InsightMining/analyze`
- POST `/api/InsightMining/summarize`
- POST `/api/InsightMining/deactivate`
- POST `/api/InsightMining/_getObservationsForUser`
[@api-extraction-from-code](../tools/api-extraction-from-code.md)

[@api-extraction-from-spec](../tools/api-extraction-from-spec.md)


# API Specification (canonical endpoints and JSON shapes)
For each concept below, these are the POST routes and the exact request/response bodies as implemented in code.

Note: All IDs are branded strings (type `ID`). `Date` fields should be sent as ISO 8601 strings; the server converts them to `Date`.

---

## PersonalQA — Base: `/api/PersonalQA`

Spec: [spec](/src/concepts/PersonalQA/PersonalQASpecification.md)
Code: [code](/src/concepts/PersonalQA/PersonalQAConcept.ts)

Endpoints
- POST `/api/PersonalQA/ingestFact`
  - Request:
    { "owner": "ID", "at": "ISO-8601", "content": "string", "source": "meal|check_in|insight|behavior" }
  - Response (200):
    { "fact": "ID" }

- POST `/api/PersonalQA/forgetFact`
  - Request:
    { "requester": "ID", "owner": "ID", "factId": "ID" }
  - Response (200): {}
  - Or (200): { "error": "string" }

- POST `/api/PersonalQA/ask`
  - Request:
    { "requester": "ID", "question": "string" }
  - Response (200):
    { "answer": "string", "citedFacts": ["ID"] }

- POST `/api/PersonalQA/_getUserFacts`
  - Request:
    { "owner": "ID" }
  - Response (200): Array of FactDoc
    [ { "_id": "ID", "owner": "ID", "at": "ISO-8601", "content": "string", "source": "meal|check_in|insight|behavior" } ]

- POST `/api/PersonalQA/_getUserQAs`
  - Request:
    { "owner": "ID" }
  - Response (200): Array of QADoc
    [ { "_id": "ID", "owner": "ID", "question": "string", "answer": "string", "citedFacts": ["ID"] } ]

---

## InsightMining — Base: `/api/InsightMining`

Spec: [spec](/src/concepts/InsightMining/InsightMiningSpecification.md)
Code: [code](/src/concepts/InsightMining/InsightMiningConcept.ts)

Endpoints
- POST `/api/InsightMining/ingest`
  - Request:
    { "owner": "ID", "at": "ISO-8601", "signals": ["ID"], "metric": "ID", "value": 0 }
  - Response (200): {}

- POST `/api/InsightMining/analyze`
  - Request:
    { "owner": "ID", "window": 24 }
  - Response (200): {}
  - Or (200): { "error": "string" }

- POST `/api/InsightMining/summarize`
  - Request:
    { "owner": "ID", "period": "week" }
  - Response (200): { "report": "ID" }
  - Or (200): { "error": "string" }

- POST `/api/InsightMining/deactivate`
  - Request:
    { "requester": "ID", "owner": "ID", "signals": ["ID"], "metric": "ID" }
  - Response (200): {}
  - Or (200): { "error": "string" }

- POST `/api/InsightMining/_getObservationsForUser`
  - Request:
    { "owner": "ID" }
  - Response (200): Array of ObservationDoc
    [ { "_id": "ID", "owner": "ID", "at": "ISO-8601", "signals": ["ID"], "metric": "ID", "value": 0 } ]

- POST `/api/InsightMining/_getInsightsForUser`
  - Request:
    { "owner": "ID" }
  - Response (200): Array of InsightDoc
    [ { "_id": "ID", "owner": "ID", "signals": ["ID"], "metric": "ID", "effect": 0, "confidence": 0, "active": true } ]

- POST `/api/InsightMining/_getReport`
  - Request:
    { "reportId": "ID" }
  - Response (200): ReportDoc | null
    { "_id": "ID", "owner": "ID", "period": "string", "generatedAt": "ISO-8601", "topHelpful": ["ID"], "topHarmful": ["ID"], "metricTrends": [{ "metric": "ID", "value": 0 }] }

---

## QuickCheckIns — Base: `/api/QuickCheckIns`

Spec: [spec](/src/concepts/QuickCheckIns/QuickCheckInsSpecification.md)
Code: [code](/src/concepts/QuickCheckIns/QuickCheckInsConcept.ts)

Endpoints
- POST `/api/QuickCheckIns/record`
  - Request:
    { "owner": "ID", "at": "ISO-8601", "metric": "ID", "value": 0 }
  - Response (200): { "checkIn": "ID" } or { "error": "string" }

- POST `/api/QuickCheckIns/defineMetric`
  - Request:
    { "name": "string" }
  - Response (200): { "metric": "ID" } or { "error": "string" }

- POST `/api/QuickCheckIns/edit`
  - Request:
    { "checkIn": "ID", "owner": "ID", "metric": "ID(optional)", "value": 0(optional) }
  - Response (200): {} or { "error": "string" }

- POST `/api/QuickCheckIns/delete`
  - Request:
    { "checkIn": "ID", "owner": "ID" }
  - Response (200): {} or { "error": "string" }

- POST `/api/QuickCheckIns/_getCheckIn`
  - Request:
    { "checkIn": "ID" }
  - Response (200): CheckInDocument | null
    { "_id": "ID", "owner": "ID", "at": "ISO-8601", "metric": "ID", "value": 0 }

- POST `/api/QuickCheckIns/_getMetricsByName`
  - Request:
    { "name": "string" }
  - Response (200): InternalMetricDocument | null
    { "_id": "ID", "name": "string" }

- POST `/api/QuickCheckIns/_listCheckInsByOwner`
  - Request:
    { "owner": "ID" }
  - Response (200): Array of CheckInDocument
    [ { "_id": "ID", "owner": "ID", "at": "ISO-8601", "metric": "ID", "value": 0 } ]

- POST `/api/QuickCheckIns/deleteMetric`
  - Request:
    { "metric": "ID" }
  - Response (200): {} or { "error": "string" }

---

## MealLog — Base: `/api/MealLog`

Spec: [spec](/src/concepts/MealLog/MealLogSpecification.md)
Code: [code](/src/concepts/MealLog/MealLogConcept.ts)

Endpoints
- POST `/api/MealLog/connect`
  - Request: {}
  - Response (200): {}

- POST `/api/MealLog/disconnect`
  - Request: {}
  - Response (200): {}

- POST `/api/MealLog/getCollection`
  - Request: {}
  - Response (200): { "name": "Meals" }

- POST `/api/MealLog/_getMealDocumentById`
  - Request:
    { "mealId": "ID" }
  - Response (200): MealDocument | null
    { "_id": "ID", "ownerId": "ID", "at": "ISO-8601", "items": [{ "id": "string", "name": "string" }], "notes": "string(optional)", "status": "active|deleted" }

- POST `/api/MealLog/_getMealObjectById`
  - Request:
    { "mealId": "ID" }
  - Response (200): Meal | undefined
    { "id": "ID", "owner": { "id": "ID" }, "at": "ISO-8601", "items": [{ "id": "string", "name": "string" }], "notes": "string(optional)", "status": "active|deleted" }

- POST `/api/MealLog/submit`
  - Request:
    { "ownerId": "ID", "at": "ISO-8601", "items": [{ "id": "string", "name": "string" }], "notes": "string(optional)" }
  - Response (200): Meal
    { "id": "ID", "owner": { "id": "ID" }, "at": "ISO-8601", "items": [{ "id": "string", "name": "string" }], "notes": "string(optional)", "status": "active" }

- POST `/api/MealLog/edit`
  - Request:
  { "callerId": "ID", "mealId": "ID", "items": [{ "id": "string", "name": "string" }](optional), "notes": "string(optional)", "at": "ISO-8601(optional)" }
  - Response (200): {} or { "error": "string" }

- POST `/api/MealLog/delete`
  - Request:
    { "callerId": "ID", "mealId": "ID" }
  - Response (200): {} or { "error": "string" }

- POST `/api/MealLog/getMealsForOwner`
  - Request:
    { "ownerId": "ID", "includeDeleted": false(optional) }
  - Response (200): Array of Meal
    [ { "id": "ID", "owner": { "id": "ID" }, "at": "ISO-8601", "items": [{ "id": "string", "name": "string" }], "notes": "string(optional)", "status": "active|deleted" } ]

- POST `/api/MealLog/getMealById`
  - Request:
    { "mealId": "ID", "callerId": "ID(optional)" }
  - Response (200): Meal | { "error": "string" } | undefined

---

## SwapSuggestions — Base: `/api/SwapSuggestions`

Spec: [spec](/src/concepts/SwapSuggestions/SwapSuggestionsSpecification.md)
Code: [code](/src/concepts/SwapSuggestions/SwapSuggestionsConcept.ts)

Endpoints
- POST `/api/SwapSuggestions/propose`
  - Request:
    { "owner": "ID", "risky": ["ID"], "alternatives": ["ID"], "rationale": "string" }
  - Response (200): {} or { "error": "string" }

- POST `/api/SwapSuggestions/accept`
  - Request:
    { "requester": "ID", "owner": "ID", "risky": ["ID"], "alternatives": ["ID"] }
  - Response (200): {} or { "error": "string" }

- POST `/api/SwapSuggestions/_getProposal`
  - Request:
    { "proposalId": "ID" }
  - Response (200): Proposal | null
    { "_id": "ID", "owner": "ID", "risky": ["ID"], "alternatives": ["ID"], "rationale": "string", "accepted": true }

- POST `/api/SwapSuggestions/_getProposalsByOwner`
  - Request:
    { "owner": "ID" }
  - Response (200): Array of Proposal
    [ { "_id": "ID", "owner": "ID", "risky": ["ID"], "alternatives": ["ID"], "rationale": "string", "accepted": false } ]
