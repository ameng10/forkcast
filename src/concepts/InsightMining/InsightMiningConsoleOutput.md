Principle: System ingests, analyzes, and summarizes observations ...
  Phase 1: Ingest observations ... ok (241ms)
  Phase 2: Analyze observations ... ok (158ms)
  Phase 3: Summarize observations and insights into a report ... ok (85ms)
Principle: System ingests, analyzes, and summarizes observations ... ok (1s)
Action: ingest - Adds observation correctly and handles empty signals ...
  Ingest with signals ... ok (52ms)
  Ingest with empty signals ... ok (38ms)
Action: ingest - Adds observation correctly and handles empty signals ... ok (689ms)
Action: analyze - Requires observations in window and calculates correctly ...
  Requires: No observations in window ... ok (207ms)
  Effects: Correctly computes and upserts insights with multiple observations ... ok (266ms)
  Effects: Handles observations with no signals array correctly ... ok (97ms)
Action: analyze - Requires observations in window and calculates correctly ... ok (1s)
Action: summarize - Requirements and effects on report content ...
  Requires: No observations in period ... ok (20ms)
  Requires: Unsupported period string ... ok (36ms)
  Effects: Generates report with topHelpful/topHarmful and metricTrends ... ok (326ms)
  Effects: Handles cases where no signals are helpful/harmful ... ok (223ms)
Action: summarize - Requirements and effects on report content ... ok (1s)
Action: deactivate - Requires insight to exist and correct requester ...
  Setup: Ingest and analyze to create an insight ... ok (99ms)
  Requires: Unauthorized requester ... ok (1ms)
  Requires: Non-existent insight ... ok (33ms)
Action: deactivate - Requires insight to exist and correct requester ... ok (678ms)
Action: deactivate - Successfully deactivates insight and handles re-deactivation ...
  Setup: Create an active insight ... ok (194ms)
  Effects: Successfully deactivates an insight ... ok (60ms)
  Edge Case: Attempt to deactivate an already inactive insight ... ok (20ms)
Action: deactivate - Successfully deactivates insight and handles re-deactivation ... ok (894ms)
Queries: Retrieval functions work correctly ...
  _getObservationsForUser ... ok (110ms)
  _getInsightsForUser ... ok (471ms)
  _getReport ... ok (477ms)
Queries: Retrieval functions work correctly ... ok (2s)
