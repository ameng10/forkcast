# Backend Major Changes Log

## October 2025

### PersonalQA
- **Gemini LLM Integration:**
  - Replaced previous LLM logic with a robust Gemini API wrapper (`GeminiLLM` in `src/utils/gemini.ts`).
  - Now always uses Gemini for answering questions if an API key is present, with fallback to a conservative summary if not.
  - Added support for model fallback: tries primary and fallback models in order, improving reliability during API overloads or model unavailability.
  - Minimal, facts-only prompt enforced: answers are always based strictly on user facts, with little instruction and no conversation memory.
  - Web search fallback: if Gemini cannot answer from facts, performs a quick web search (DuckDuckGo Instant Answer API); if no answer, responds "I don't know".
  - Improved error handling and diagnostics for API/model errors.
  - Environment variables: `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `PERSONALQA_FORCE_GEMINI` control LLM usage and fallback.

### QuickCheckIns
- **API and Data Model Refinements:**
  - Adopted branded `ID` types for users, metrics, and check-ins to prevent string mix-ups.
  - All MongoDB collections now prefixed with `QuickCheckIns.` to avoid collisions.
  - Date handling clarified: uses native `Date` objects for check-in timestamps.
  - Structured return contracts: all actions return explicit `{ checkIn: ID }` or `{ error: string }` objects, never throw.
  - Guarded metric references: all mutations validate metric existence before updating state.
  - Negative-path test coverage improved: tests now cover duplicate metrics, unauthorized edits, and no-op updates.
- **New delete action:**
  - Added a `delete` method to allow users to remove their own check-ins, with ownership and existence checks for safety.

### Gemini Wrapper (`src/utils/gemini.ts`)
- **New GeminiLLM Class:**
  - Centralizes all Gemini API calls with retry, timeout, and model fallback logic.
  - Configurable via `primaryModel` and `fallbackModels`.
  - Handles API errors, timeouts, and empty responses gracefully.


### MealLog
- **Date Editing Fix:**
  - Fixed the date editing feature to ensure meal log entries can be updated with correct timestamps.

---
