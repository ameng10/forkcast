/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // Feel free to delete these example inclusions
  "/api/LikertSurvey/_getSurveyQuestions": "this is a public query",
  "/api/LikertSurvey/_getSurveyResponses": "responses are public",
  "/api/LikertSurvey/_getRespondentAnswers": "answers are visible",
  "/api/LikertSurvey/submitResponse": "allow anyone to submit response",
  "/api/LikertSurvey/updateResponse": "allow anyone to update their response",
  "/api/InsightMining/ingest": "ingestion endpoint for external data",
  "/api/InsightMining/analyze": "analysis endpoint for user data",
  "/api/InsightMining/summarize": "summarization endpoint for user data",
  "/api/InsightMining/deactivate": "allow users to deactivate their insights",
  "/api/InsightMining/_getObservationsForUser":
    "observations are user-specific",
  "/api/InsightMining/_getInsightsForUser": "insights are user-specific",
  "/api/InsightMining/_getReport": "report is user-specific",
  // MealLog
  "/api/MealLog/connect": "allow users to connect their meal log",
  "/api/MealLog/disconnect": "allow users to disconnect their meal log",
  "/api/MealLog/getCollection": "allow users to get their meal log collection",
  "/api/MealLog/submit": "allow users to submit a meal log entry",
  "/api/MealLog/edit": "allow users to edit their meal log entry",
  "/api/MealLog/delete": "allow users to delete their meal log entry",
  "/api/MealLog/getMealsForOwner": "allow users to get their meal log entries",
  "/api/MealLog/getMealById": "allow users to get a specific meal log entry",
  // PersonalQA
  "/api/PersonalQA/ingestFact": "allow users to ingest a new fact",
  "/api/PersonalQA/forgetFact": "allow users to forget a fact",
  "/api/PersonalQA/ask": "allow users to ask a question",
  "/api/PersonalQA/askLLM": "allow users to ask a question using LLM",
  "/api/PersonalQA/setTemplate": "allow users to set a template",
  "/api/PersonalQA/_getUserFacts": "allow users to get their facts",
  "/api/PersonalQA/_getUserQAs": "allow users to get their QAs",
  "/api/PersonalQA/_getUserDrafts": "allow users to get their drafts",
  // QuickCheckIns
  "/api/QuickCheckIns/record": "allow users to record a check-in",
  "/api/QuickCheckIns/defineMetric": "allow users to define a new metric",
  "/api/QuickCheckIns/edit": "allow users to edit their check-in",
  "/api/QuickCheckIns/delete": "allow users to delete their check-in",
  "/api/QuickCheckIns/_getCheckIn": "allow users to get a specific check-in",
  "/api/QuickCheckIns/_getMetricsByName": "allow users to get metrics by name",
  "/api/QuickCheckIns/deleteMetric": "allow users to delete a metric",
  "/api/QuickCheckIns/_listCheckInsByOwner":
    "allow users to list their check-ins",
  // SwapSuggestions
  "/api/SwapSuggestions/propose": "allow users to propose a swap",
  "/api/SwapSuggestions/accept": "allow users to accept a swap",
  "/api/SwapSuggestions/_getProposal":
    "allow users to get a specific swap proposal",
  "/api/SwapSuggestions/_getProposalsByOwner":
    "allow users to get their swap proposals",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Feel free to delete these example exclusions
  "/api/LikertSurvey/createSurvey",
  "/api/LikertSurvey/addQuestion",
  // --- Excluded routes for syncing (non-LikertSurvey) ---
  // InsightMining
  // "/api/InsightMining/ingest",
  // "/api/InsightMining/analyze",
  // "/api/InsightMining/summarize",
  // "/api/InsightMining/deactivate",
  // "/api/InsightMining/_getObservationsForUser",
  // "/api/InsightMining/_getInsightsForUser",
  // "/api/InsightMining/_getReport",
  // // MealLog
  // "/api/MealLog/connect",
  // "/api/MealLog/disconnect",
  // "/api/MealLog/getCollection",
  // "/api/MealLog/submit",
  // "/api/MealLog/edit",
  // "/api/MealLog/delete",
  // "/api/MealLog/getMealsForOwner",
  // "/api/MealLog/getMealById",
  // // PersonalQA
  // "/api/PersonalQA/ingestFact",
  // "/api/PersonalQA/forgetFact",
  // "/api/PersonalQA/ask",
  // "/api/PersonalQA/askLLM",
  // "/api/PersonalQA/setTemplate",
  // "/api/PersonalQA/_getUserFacts",
  // "/api/PersonalQA/_getUserQAs",
  // "/api/PersonalQA/_getUserDrafts",
  // // QuickCheckIns
  // "/api/QuickCheckIns/record",
  // "/api/QuickCheckIns/defineMetric",
  // "/api/QuickCheckIns/edit",
  // "/api/QuickCheckIns/delete",
  // "/api/QuickCheckIns/_getCheckIn",
  // "/api/QuickCheckIns/_getMetricsByName",
  // "/api/QuickCheckIns/deleteMetric",
  // "/api/QuickCheckIns/_listCheckInsByOwner",
  // // SwapSuggestions
  // "/api/SwapSuggestions/propose",
  // "/api/SwapSuggestions/accept",
  // "/api/SwapSuggestions/_getProposal",
  // "/api/SwapSuggestions/_getProposalsByOwner",
];
