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
  // Public auth endpoints (entry points)
  "/api/UserAuthentication/register": "public endpoint to create account",
  "/api/UserAuthentication/login": "public endpoint to start session",
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

  // InsightMining
  "/api/InsightMining/ingest",
  "/api/InsightMining/analyze",
  "/api/InsightMining/summarize",
  "/api/InsightMining/deactivate",
  "/api/InsightMining/_getObservationsForUser",
  "/api/InsightMining/_getInsightsForUser",
  "/api/InsightMining/_getReport",

  // MealLog (updated routes with underscores per server output)
  "/api/MealLog/submit",
  "/api/MealLog/edit",
  "/api/MealLog/delete",
  "/api/MealLog/_getMealById",
  "/api/MealLog/_getMealsByOwner",
  "/api/MealLog/_getMealOwner",

  // PersonalQA
  "/api/PersonalQA/ingestFact",
  "/api/PersonalQA/forgetFact",
  "/api/PersonalQA/ask",
  "/api/PersonalQA/askLLM",
  "/api/PersonalQA/setTemplate",
  "/api/PersonalQA/_getUserFacts",
  "/api/PersonalQA/_getUserQAs",
  "/api/PersonalQA/_getUserDrafts",

  // QuickCheckIns
  "/api/QuickCheckIns/record",
  "/api/QuickCheckIns/defineMetric",
  "/api/QuickCheckIns/edit",
  "/api/QuickCheckIns/delete",
  "/api/QuickCheckIns/deleteMetric",
  "/api/QuickCheckIns/_getCheckIn",
  "/api/QuickCheckIns/_getMetricsByName",
  "/api/QuickCheckIns/_listCheckInsByOwner",

  // SwapSuggestions
  "/api/SwapSuggestions/propose",
  "/api/SwapSuggestions/accept",
  "/api/SwapSuggestions/_getProposal",
  "/api/SwapSuggestions/_getProposalsByOwner",

  // Sessioning (route via syncs)
  "/api/Sessioning/create",
  "/api/Sessioning/delete",
  "/api/Sessioning/_getUser",

  // UserAuthentication (restrict potentially sensitive lookup)
  "/api/UserAuthentication/_getUserByUsername",
  "/api/UserAuthentication/register",
  "/api/UserAuthentication/login",
];
