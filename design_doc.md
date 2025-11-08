• Initially planned to feed meals directly into the LLM wrapper, but that approach wasn’t modular.
	- Shifted to having the user provide explicit facts to the LLM instead.

• Ran into data privacy issues: switching users surfaced the same data.
	- Standardized concepts to accept an owner field.
	- Added Sessioning and Authentication to enforce per-user isolation.
	- Earlier work: no auth in assignment 2; a frontend-only auth in 4b.
	- Converting auth into a concept enabled proper sessioning and true data privacy.

• Sync generation was a major pain point (see Meal Log syncs: [meallogsync](/design/brainstorming/meallogsync.md)).
	- Created a base sync pattern across all syncs and refined it with Copilot.
	- Learned I needed to improve prompting; refactored concept implementations accordingly.
	- Example refactor note: [Concept State.28ab7cd0](/context/design/concepts/MealLog/implementation.md/steps/Concept%20State.28ab7cd0.md).

• Deferred concepts: SwapSuggestions and InsightMining.
	- Determined they weren’t essential to the core app experience.

• Current status: assignment 4c is solid.

## Issues & Fixes

• Non‑modular LLM input design
	- Issue: Tried feeding meals directly into the LLM wrapper; tightly coupled and hard to extend.
	- Fix: Switched to user‑provided facts as inputs, keeping the LLM layer modular.

• Data privacy leaks when switching users
	- Issue: Different users saw the same data.
	- Fix: Added owner to all concepts; introduced Sessioning and Authentication concepts to enforce per‑user data boundaries.

• Frontend‑only auth wasn’t sufficient
	- Issue: Early assignments relied on client‑side auth, which didn’t create true sessions.
	- Fix: Implemented auth as a first‑class concept; enabled server‑side sessioning and proper access control.

• MealLog sync timeouts (no responses)
	- Issue: /MealLog/submit and underscore queries timed out due to missing exact matches and responders.
	- Fix: Rewrote MealLog syncs to mirror Auth style with exact paths, separate request/success/error responders, and explicit Requesting.respond in all paths (including errors). Also normalized path casing.

• Path casing/normalization errors across syncs
	- Issue: Mismatched routes (e.g., /personalqa vs /PersonalQA) caused misses.
	- Fix: Standardized exact path casing and ensured every when included a bound { request }.

• Type and lint friction
	- Issue: Implicit any, brittle type guards, and frame handling edge cases.
	- Fix: Removed any, tightened guards, and ensured empty results still produce explicit error/empty responses.

• Lockfile and task failures
	- Issue: Corrupted deno.lock and malformed deno.json (duplicates/trailing commas) broke build/start.
	- Fix: Regenerated deno.lock with deno cache; cleaned deno.json; wired build to run the import task.

• Git pull blocked by divergent branches
	- Issue: Pull aborted with “Need to specify how to reconcile divergent branches.”
	- Fix: Use an explicit strategy (rebase/merge/ff‑only) and/or set a default via git config; resolved locally before pushing.

• Prompting quality slowed iteration
	- Issue: Inconsistent outputs while generating syncs and concept scaffolds.
	- Fix: Created a reusable base sync pattern; refined with Copilot; refactored concept implementations to align with the pattern.
