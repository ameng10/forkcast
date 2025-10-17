[@testing](../LikertSurvey/testing.md)

[@testing-concepts](../../background/testing-concepts.md)

[@implementation](implementation.md)

[@MealLogConsoleOutput](../../../src/concepts/MealLog/MealLogConsoleOutput.md)

# test: QuickCheckIns

Use the context to create tests similar to the tests in LikertSurvey testing. It should be in typescript. I want many tests with all the tests being modular and testing different aspects. There should also be edge cases. Try to make my implementation fail. The tests should cover similar cases as MealLogConsoleOutput.


# concept: QuickCheckIns

*   **concept**: QuickCheckIns \[User, ExternalMetricID]
*   **purpose**: Record simple self-reports to correlate with recent meals.
*   **principle**: A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.
*   **state**:
    *   A set of `CheckIns` with
        *   an `owner` User
        *   an `at` DateTime
        *   a `metric` ExternalMetricID
        *   a `value` Number
    *   A set of `InternalMetrics` with
        *   a `name` String
*   **actions**:
    *   `record (owner: User, at: DateTime, metric: ExternalMetricID, value: Number): (checkIn: CheckIn)`
        *   **requires**: The InternalMetric 'metric' exists (refers to an InternalMetric whose `_id` matches 'metric').
        *   **effects**: Creates a new CheckIn 'checkIn', sets its owner, `at` timestamp, metric, and value, then returns the ID of 'checkIn'.
    *   `defineMetric (name: String): (metric: ExternalMetricID)`
        *   **requires**: No InternalMetric with 'name' exists.
        *   **effects**: Creates a new InternalMetric 'metric' with a fresh ID, sets its name, and returns the ID of the new 'metric'.
    *   `edit (checkIn: CheckIn, owner: User, metric?: ExternalMetricID, value?: Number): Empty`
        *   **requires**: The CheckIn 'checkIn' exists. The owner of 'checkIn' is 'owner'. If 'metric' is provided, then the InternalMetric 'metric' must exist.
        *   **effects**: If 'metric' is provided, updates the metric of 'checkIn' to 'metric'. If 'value' is provided, updates the value of 'checkIn' to 'value'.

# file: src/QuickCheckIns/QuickCheckInsConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "QuickCheckIns" + ".";

// Generic types of this concept (User and ExternalMetricID are IDs, not objects with properties known by this concept)
type User = ID;
type ExternalMetricID = ID; // The ID type for metrics managed externally/globally

// Internal entity types defined by the state of this concept
type CheckIn = ID; // CheckIn is an internal ID managed by this concept

/**
 * @state a set of CheckIns with
 *   an owner User
 *   an at DateTime
 *   a metric ExternalMetricID
 *   a value Number
 */
interface CheckInDocument {
  _id: CheckIn;
  owner: User;
  at: Date; // Using JavaScript's Date object for DateTime
  metric: ExternalMetricID;
  value: number;
}

/**
 * @state a set of InternalMetrics with
 *   a name String
 * // Note: The _id of InternalMetrics will be of type ExternalMetricID
 */
interface InternalMetricDocument {
  _id: ExternalMetricID; // The ID of the metric, which is of the generic type ExternalMetricID
  name: string;
}

/**
 * @concept QuickCheckIns [User, ExternalMetricID]
 * @purpose Record simple self-reports to correlate with recent meals.
 * @principle A user logs outcomes such as energy, mood, or gut comfort as numeric values at times; this concept stores facts only.
 */
export default class QuickCheckInsConcept {
  checkIns: Collection<CheckInDocument>;
  internalMetrics: Collection<InternalMetricDocument>;

  constructor(private readonly db: Db) {
    this.checkIns = this.db.collection(PREFIX + "checkIns");
    this.internalMetrics = this.db.collection(PREFIX + "internalMetrics");
  }

  /**
   * @action record
   * @param {object} args - The action arguments.
   * @param {User} args.owner - The user who owns this check-in.
   * @param {Date} args.at - The date and time of the check-in.
   * @param {ExternalMetricID} args.metric - The ID of the metric being reported (e.g., energy, mood).
   * @param {number} args.value - The numeric value for the metric.
   * @returns {Promise<{checkIn: CheckIn} | {error: string}>} The ID of the newly created check-in or an error message.
   *
   * @requires the InternalMetric 'metric' exists
   * @effects create a new CheckIn 'checkIn', set its properties, and return its ID.
   */
  async record(
    { owner, at, metric, value }: {
      owner: User;
      at: Date;
      metric: ExternalMetricID;
      value: number;
    },
  ): Promise<{ checkIn: CheckIn } | { error: string }> {
    // Requires: the InternalMetric 'metric' exists
    const existingMetric = await this.internalMetrics.findOne({ _id: metric });
    if (!existingMetric) {
      return { error: `Metric with ID '${metric}' is not defined.` };
    }

    // Effects: create a new CheckIn 'checkIn', set its properties, and return its ID.
    const newCheckInId = freshID() as CheckIn;
    const result = await this.checkIns.insertOne({
      _id: newCheckInId,
      owner,
      at,
      metric,
      value,
    });

    if (!result.acknowledged) {
      return { error: "Failed to create check-in." };
    }

    return { checkIn: newCheckInId };
  }

  /**
   * @action defineMetric
   * @param {object} args - The action arguments.
   * @param {string} args.name - The descriptive name for the new metric.
   * @returns {Promise<{metric: ExternalMetricID} | {error: string}>} The ID of the newly defined metric or an error message.
   *
   * @requires no InternalMetric with 'name' exists
   * @effects create a new InternalMetric 'metric' with a fresh ID, set its name, and return its ID.
   */
  async defineMetric(
    { name }: { name: string },
  ): Promise<{ metric: ExternalMetricID } | { error: string }> {
    // Requires: no InternalMetric with 'name' exists
    const existingMetric = await this.internalMetrics.findOne({ name: name });
    if (existingMetric) {
      return { error: `Metric with name '${name}' already exists with ID '${existingMetric._id}'.` };
    }

    // Effects: create a new InternalMetric 'metric' with a fresh ID, set its name, and return its ID.
    const newMetricId = freshID() as ExternalMetricID;
    const result = await this.internalMetrics.insertOne({
      _id: newMetricId,
      name: name,
    });

    if (!result.acknowledged) {
      return { error: "Failed to define metric." };
    }

    return { metric: newMetricId };
  }

  /**
   * @action edit
   * @param {object} args - The action arguments.
   * @param {CheckIn} args.checkIn - The ID of the check-in to edit.
   * @param {User} args.owner - The user attempting to edit (must be the owner of the check-in).
   * @param {ExternalMetricID} [args.metric] - Optional new metric ID to update.
   * @param {number} [args.value] - Optional new numeric value to update.
   * @returns {Promise<Empty | {error: string}>} An empty object on success or an error message.
   *
   * @requires the CheckIn 'checkIn' exists, owner of 'checkIn' is 'owner', and if 'metric' is provided, then the InternalMetric 'metric' exists.
   * @effects update provided fields (metric and/or value) of 'checkIn'.
   */
  async edit(
    { checkIn, owner, metric, value }: {
      checkIn: CheckIn;
      owner: User;
      metric?: ExternalMetricID;
      value?: number;
    },
  ): Promise<Empty | { error: string }> {
    // Requires: the CheckIn 'checkIn' exists
    const existingCheckIn = await this.checkIns.findOne({ _id: checkIn });
    if (!existingCheckIn) {
      return { error: `Check-in with ID '${checkIn}' not found.` };
    }

    // Requires: owner of 'checkIn' is 'owner'
    if (existingCheckIn.owner !== owner) {
      return { error: "You are not the owner of this check-in." };
    }

    // Requires: if 'metric' is provided, then the InternalMetric 'metric' exists
    if (metric !== undefined) {
      const existingMetric = await this.internalMetrics.findOne({ _id: metric });
      if (!existingMetric) {
        return { error: `New metric with ID '${metric}' is not defined.` };
      }
    }

    // Effects: update provided fields (metric and/or value) of 'checkIn'.
    const updateDoc: Partial<CheckInDocument> = {};
    if (metric !== undefined) {
      updateDoc.metric = metric;
    }
    if (value !== undefined) {
      updateDoc.value = value;
    }

    if (Object.keys(updateDoc).length === 0) {
      // No fields to update, return success as per spec
      return {};
    }

    const result = await this.checkIns.updateOne(
      { _id: checkIn },
      { $set: updateDoc },
    );

    if (!result.acknowledged || result.matchedCount === 0) {
      return { error: "Failed to update check-in." };
    }

    return {};
  }

  // --- Queries (Optional, but good for testing and verifying state) ---

  /**
   * @query _getCheckIn
   * @param {object} args - The query arguments.
   * @param {CheckIn} args.checkIn - The ID of the check-in to retrieve.
   * @returns {Promise<CheckInDocument | null>} A specific check-in document by its ID, or null if not found.
   * @effects Returns a specific check-in document by its ID.
   */
  async _getCheckIn(
    { checkIn }: { checkIn: CheckIn },
  ): Promise<CheckInDocument | null> {
    return await this.checkIns.findOne({ _id: checkIn });
  }

  /**
   * @query _getMetricsByName
   * @param {object} args - The query arguments.
   * @param {string} args.name - The name of the internal metric to retrieve.
   * @returns {Promise<InternalMetricDocument | null>} An internal metric document by its name, or null if not found.
   * @effects Returns an internal metric document by its name.
   */
  async _getMetricsByName(
    { name }: { name: string },
  ): Promise<InternalMetricDocument | null> {
    return await this.internalMetrics.findOne({ name: name });
  }

  /**
   * @query _listCheckInsByOwner
   * @param {object} args - The query arguments.
   * @param {User} args.owner - The owner whose check-ins are to be listed.
   * @returns {Promise<CheckInDocument[]>} An array of all check-ins belonging to a specific owner.
   * @effects Returns all check-ins belonging to a specific owner.
   */
  async _listCheckInsByOwner(
    { owner }: { owner: User },
  ): Promise<CheckInDocument[]> {
    return await this.checkIns.find({ owner }).toArray();
  }
}
```

# test: QuickCheckIns

# file: src/QuickCheckIns/QuickCheckInsConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import QuickCheckInsConcept from "./QuickCheckInsConcept.ts";

const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;

Deno.test("Principle: A user logs outcomes (check-ins) for metrics, and the concept stores these facts.", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // 1. Define internal metrics (e.g., energy, mood)
    const defineEnergyMetricResult = await concept.defineMetric({ name: "Energy" });
    assertNotEquals("error" in defineEnergyMetricResult, true, "Defining 'Energy' metric should succeed.");
    const { metric: energyMetricId } = defineEnergyMetricResult as { metric: ID };
    assertExists(energyMetricId);

    const defineMoodMetricResult = await concept.defineMetric({ name: "Mood" });
    assertNotEquals("error" in defineMoodMetricResult, true, "Defining 'Mood' metric should succeed.");
    const { metric: moodMetricId } = defineMoodMetricResult as { metric: ID };
    assertExists(moodMetricId);

    // 2. User Alice logs outcomes (check-ins)
    const now1 = new Date("2023-01-01T10:00:00Z");
    const record1Result = await concept.record({ owner: userAlice, at: now1, metric: energyMetricId, value: 8 });
    assertNotEquals("error" in record1Result, true, "First record should succeed.");
    const { checkIn: checkIn1 } = record1Result as { checkIn: ID };
    assertExists(checkIn1);

    const now2 = new Date("2023-01-01T14:00:00Z");
    const record2Result = await concept.record({ owner: userAlice, at: now2, metric: moodMetricId, value: 7 });
    assertNotEquals("error" in record2Result, true, "Second record should succeed.");
    const { checkIn: checkIn2 } = record2Result as { checkIn: ID };
    assertExists(checkIn2);

    // 3. Verify the concept stores these facts (retrieve by owner)
    const aliceCheckIns = await concept._listCheckInsByOwner({ owner: userAlice });
    assertEquals(aliceCheckIns.length, 2, "Alice should have two check-ins.");

    const retrievedCheckIn1 = aliceCheckIns.find((ci) => ci._id === checkIn1);
    assertExists(retrievedCheckIn1);
    assertEquals(retrievedCheckIn1.owner, userAlice);
    assertEquals(retrievedCheckIn1.at.toISOString(), now1.toISOString());
    assertEquals(retrievedCheckIn1.metric, energyMetricId);
    assertEquals(retrievedCheckIn1.value, 8);

    const retrievedCheckIn2 = aliceCheckIns.find((ci) => ci._id === checkIn2);
    assertExists(retrievedCheckIn2);
    assertEquals(retrievedCheckIn2.owner, userAlice);
    assertEquals(retrievedCheckIn2.at.toISOString(), now2.toISOString());
    assertEquals(retrievedCheckIn2.metric, moodMetricId);
    assertEquals(retrievedCheckIn2.value, 7);
  } finally {
    await client.close();
  }
});

Deno.test("Action: defineMetric - success and requirements", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Success: define a new metric
    const result1 = await concept.defineMetric({ name: "Sleep Quality" });
    assertNotEquals("error" in result1, true, "Defining a new metric should succeed.");
    const { metric: sleepMetricId } = result1 as { metric: ID };
    assertExists(sleepMetricId);

    const retrievedMetric = await concept._getMetricsByName({ name: "Sleep Quality" });
    assertExists(retrievedMetric);
    assertEquals(retrievedMetric._id, sleepMetricId);
    assertEquals(retrievedMetric.name, "Sleep Quality");

    // Requires: no InternalMetric with 'name' exists
    const result2 = await concept.defineMetric({ name: "Sleep Quality" });
    assertEquals("error" in result2, true, "Defining a metric with an existing name should fail.");
    assertEquals((result2 as { error: string }).error, `Metric with name 'Sleep Quality' already exists with ID '${sleepMetricId}'.`);
  } finally {
    await client.close();
  }
});

Deno.test("Action: record - success and requirements", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: define a metric
    const { metric: hungerMetricId } = (await concept.defineMetric({ name: "Hunger" })) as { metric: ID };
    const now = new Date();

    // Success: record a check-in
    const recordResult = await concept.record({ owner: userAlice, at: now, metric: hungerMetricId, value: 5 });
    assertNotEquals("error" in recordResult, true, "Recording a valid check-in should succeed.");
    const { checkIn: newCheckInId } = recordResult as { checkIn: ID };
    assertExists(newCheckInId);

    const retrievedCheckIn = await concept._getCheckIn({ checkIn: newCheckInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.owner, userAlice);
    assertEquals(retrievedCheckIn.at.toISOString(), now.toISOString());
    assertEquals(retrievedCheckIn.metric, hungerMetricId);
    assertEquals(retrievedCheckIn.value, 5);

    // Requires: the InternalMetric 'metric' exists
    const nonExistentMetricId = "metric:fake" as ID;
    const invalidRecordResult = await concept.record({ owner: userAlice, at: now, metric: nonExistentMetricId, value: 3 });
    assertEquals("error" in invalidRecordResult, true, "Recording with a non-existent metric should fail.");
    assertEquals((invalidRecordResult as { error: string }).error, `Metric with ID '${nonExistentMetricId}' is not defined.`);
  } finally {
    await client.close();
  }
});

Deno.test("Action: edit - success and requirements", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: define metrics and record an initial check-in
    const { metric: initialMetric } = (await concept.defineMetric({ name: "Initial Metric" })) as { metric: ID };
    const { metric: updatedMetric } = (await concept.defineMetric({ name: "Updated Metric" })) as { metric: ID };
    const { checkIn: checkInId } = (await concept.record({ owner: userAlice, at: new Date(), metric: initialMetric, value: 10 })) as { checkIn: ID };

    // Requires: the CheckIn 'checkIn' exists
    const nonExistentCheckInId = "checkin:fake" as ID;
    const res1 = await concept.edit({ checkIn: nonExistentCheckInId, owner: userAlice, value: 5 });
    assertEquals("error" in res1, true, "Editing a non-existent check-in should fail.");
    assertEquals((res1 as { error: string }).error, `Check-in with ID '${nonExistentCheckInId}' not found.`);

    // Requires: owner of 'checkIn' is 'owner'
    const res2 = await concept.edit({ checkIn: checkInId, owner: userBob, value: 5 });
    assertEquals("error" in res2, true, "Editing by a non-owner should fail.");
    assertEquals((res2 as { error: string }).error, "You are not the owner of this check-in.");

    // Requires: if 'metric' is provided, then the InternalMetric 'metric' exists
    const nonExistentMetricId = "metric:another_fake" as ID;
    const res3 = await concept.edit({ checkIn: checkInId, owner: userAlice, metric: nonExistentMetricId });
    assertEquals("error" in res3, true, "Updating to a non-existent metric should fail.");
    assertEquals((res3 as { error: string }).error, `New metric with ID '${nonExistentMetricId}' is not defined.`);

    // Effects: update value
    const editValueResult = await concept.edit({ checkIn: checkInId, owner: userAlice, value: 5 });
    assertNotEquals("error" in editValueResult, true, "Updating value should succeed.");
    let retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 5, "Value should be updated.");
    assertEquals(retrievedCheckIn.metric, initialMetric, "Metric should remain unchanged.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: edit - metric and combined updates, and no-op", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: define metrics and record an initial check-in
    const { metric: initialMetric } = (await concept.defineMetric({ name: "Initial Metric" })) as { metric: ID };
    const { metric: updatedMetric } = (await concept.defineMetric({ name: "Updated Metric" })) as { metric: ID };
    const { checkIn: checkInId } = (await concept.record({ owner: userAlice, at: new Date(), metric: initialMetric, value: 10 })) as { checkIn: ID };

    // Effects: update metric
    const editMetricResult = await concept.edit({ checkIn: checkInId, owner: userAlice, metric: updatedMetric });
    assertNotEquals("error" in editMetricResult, true, "Updating metric should succeed.");
    let retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 10, "Value should remain unchanged.");
    assertEquals(retrievedCheckIn.metric, updatedMetric, "Metric should be updated.");

    // Effects: update both metric and value
    const editBothResult = await concept.edit({ checkIn: checkInId, owner: userAlice, metric: initialMetric, value: 9 });
    assertNotEquals("error" in editBothResult, true, "Updating both should succeed.");
    retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 9, "Value should be updated again.");
    assertEquals(retrievedCheckIn.metric, initialMetric, "Metric should be updated again.");

    // No updates: call edit without metric or value
    const noUpdateResult = await concept.edit({ checkIn: checkInId, owner: userAlice });
    assertNotEquals("error" in noUpdateResult, true, "Calling edit without any updates should succeed (no change).");
    retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId }); // Verify no unintended changes
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 9);
    assertEquals(retrievedCheckIn.metric, initialMetric);

  } finally {
    await client.close();
  }
});
```
# response:

# response:

# file: src/QuickCheckIns/QuickCheckInsConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import QuickCheckInsConcept from "./QuickCheckInsConcept.ts";

const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;
const userCharlie = "user:Charlie" as ID;

Deno.test("Principle: A user logs outcomes (check-ins) for metrics, and the concept stores these facts.", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // 1. Define internal metrics (e.g., energy, mood)
    console.log("Defining 'Energy' metric...");
    const defineEnergyMetricResult = await concept.defineMetric({ name: "Energy" });
    assertNotEquals("error" in defineEnergyMetricResult, true, "Defining 'Energy' metric should succeed.");
    const { metric: energyMetricId } = defineEnergyMetricResult as { metric: ID };
    assertExists(energyMetricId, "Energy metric ID should be returned.");

    console.log("Defining 'Mood' metric...");
    const defineMoodMetricResult = await concept.defineMetric({ name: "Mood" });
    assertNotEquals("error" in defineMoodMetricResult, true, "Defining 'Mood' metric should succeed.");
    const { metric: moodMetricId } = defineMoodMetricResult as { metric: ID };
    assertExists(moodMetricId, "Mood metric ID should be returned.");

    // 2. User Alice logs outcomes (check-ins) for different metrics at different times
    const now1 = new Date("2023-01-01T10:00:00Z");
    console.log(`User Alice records Energy check-in at ${now1.toISOString()}...`);
    const record1Result = await concept.record({ owner: userAlice, at: now1, metric: energyMetricId, value: 8 });
    assertNotEquals("error" in record1Result, true, "First check-in record should succeed.");
    const { checkIn: checkIn1 } = record1Result as { checkIn: ID };
    assertExists(checkIn1, "First check-in ID should be returned.");

    const now2 = new Date("2023-01-01T14:00:00Z");
    console.log(`User Alice records Mood check-in at ${now2.toISOString()}...`);
    const record2Result = await concept.record({ owner: userAlice, at: now2, metric: moodMetricId, value: 7 });
    assertNotEquals("error" in record2Result, true, "Second check-in record should succeed.");
    const { checkIn: checkIn2 } = record2Result as { checkIn: ID };
    assertExists(checkIn2, "Second check-in ID should be returned.");

    // 3. Verify the concept stores these facts by retrieving Alice's check-ins
    console.log("Retrieving Alice's check-ins...");
    const aliceCheckIns = await concept._listCheckInsByOwner({ owner: userAlice });
    assertEquals(aliceCheckIns.length, 2, "Alice should have two check-ins recorded.");

    const retrievedCheckIn1 = aliceCheckIns.find((ci) => ci._id === checkIn1);
    assertExists(retrievedCheckIn1, "First check-in should be found.");
    assertEquals(retrievedCheckIn1.owner, userAlice, "Check-in 1 owner should be Alice.");
    assertEquals(retrievedCheckIn1.at.toISOString(), now1.toISOString(), "Check-in 1 timestamp should match.");
    assertEquals(retrievedCheckIn1.metric, energyMetricId, "Check-in 1 metric should be Energy.");
    assertEquals(retrievedCheckIn1.value, 8, "Check-in 1 value should be 8.");

    const retrievedCheckIn2 = aliceCheckIns.find((ci) => ci._id === checkIn2);
    assertExists(retrievedCheckIn2, "Second check-in should be found.");
    assertEquals(retrievedCheckIn2.owner, userAlice, "Check-in 2 owner should be Alice.");
    assertEquals(retrievedCheckIn2.at.toISOString(), now2.toISOString(), "Check-in 2 timestamp should match.");
    assertEquals(retrievedCheckIn2.metric, moodMetricId, "Check-in 2 metric should be Mood.");
    assertEquals(retrievedCheckIn2.value, 7, "Check-in 2 value should be 7.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: defineMetric - success and requirements enforcement", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Test Case 1: Success - Define a new metric
    console.log("Attempting to define a new metric 'Sleep Quality'...");
    const result1 = await concept.defineMetric({ name: "Sleep Quality" });
    assertNotEquals("error" in result1, true, "Defining a new metric should succeed.");
    const { metric: sleepMetricId } = result1 as { metric: ID };
    assertExists(sleepMetricId, "A metric ID should be returned.");

    // Verify the metric exists
    const retrievedMetric = await concept._getMetricsByName({ name: "Sleep Quality" });
    assertExists(retrievedMetric, "The newly defined metric should be retrievable by name.");
    assertEquals(retrievedMetric._id, sleepMetricId, "Retrieved metric ID should match.");
    assertEquals(retrievedMetric.name, "Sleep Quality", "Retrieved metric name should match.");

    // Test Case 2: Requires - No InternalMetric with 'name' exists (attempt to define duplicate)
    console.log("Attempting to define 'Sleep Quality' again (should fail)...");
    const result2 = await concept.defineMetric({ name: "Sleep Quality" });
    assertEquals("error" in result2, true, "Defining a metric with an existing name should fail.");
    assertEquals(
      (result2 as { error: string }).error,
      `Metric with name 'Sleep Quality' already exists with ID '${sleepMetricId}'.`,
      "Error message should indicate duplicate name and provide existing ID."
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: record - success and requirements enforcement", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: Define a valid metric for testing
    console.log("Defining 'Hunger' metric for recording tests...");
    const { metric: hungerMetricId } = (await concept.defineMetric({ name: "Hunger" })) as { metric: ID };
    const now = new Date();

    // Test Case 1: Success - Record a valid check-in
    console.log("Recording a valid check-in for 'Hunger'...");
    const recordResult = await concept.record({ owner: userAlice, at: now, metric: hungerMetricId, value: 5 });
    assertNotEquals("error" in recordResult, true, "Recording a valid check-in should succeed.");
    const { checkIn: newCheckInId } = recordResult as { checkIn: ID };
    assertExists(newCheckInId, "A check-in ID should be returned.");

    // Verify the recorded check-in
    const retrievedCheckIn = await concept._getCheckIn({ checkIn: newCheckInId });
    assertExists(retrievedCheckIn, "The newly recorded check-in should be retrievable.");
    assertEquals(retrievedCheckIn.owner, userAlice, "Check-in owner should match.");
    assertEquals(retrievedCheckIn.at.toISOString(), now.toISOString(), "Check-in timestamp should match.");
    assertEquals(retrievedCheckIn.metric, hungerMetricId, "Check-in metric should match.");
    assertEquals(retrievedCheckIn.value, 5, "Check-in value should match.");

    // Test Case 2: Requires - The InternalMetric 'metric' exists (attempt to record with non-existent metric)
    const nonExistentMetricId = "metric:fake_nonexistent" as ID;
    console.log(`Attempting to record with non-existent metric ID '${nonExistentMetricId}' (should fail)...`);
    const invalidRecordResult = await concept.record({ owner: userAlice, at: now, metric: nonExistentMetricId, value: 3 });
    assertEquals("error" in invalidRecordResult, true, "Recording with a non-existent metric should fail.");
    assertEquals(
      (invalidRecordResult as { error: string }).error,
      `Metric with ID '${nonExistentMetricId}' is not defined.`,
      "Error message should indicate undefined metric."
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: edit - requirements enforcement (non-existent check-in, unauthorized owner, non-existent new metric)", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: Define metrics and record an initial check-in for Alice
    console.log("Setup: Defining initial and updated metrics...");
    const { metric: initialMetric } = (await concept.defineMetric({ name: "InitialMetric" })) as { metric: ID };
    const { metric: updatedMetric } = (await concept.defineMetric({ name: "UpdatedMetric" })) as { metric: ID };
    const { checkIn: checkInId } = (await concept.record({ owner: userAlice, at: new Date(), metric: initialMetric, value: 10 })) as { checkIn: ID };
    assertExists(checkInId, "Initial check-in should be created.");

    // Test Case 1: Requires - The CheckIn 'checkIn' exists (attempt to edit non-existent check-in)
    const nonExistentCheckInId = "checkin:fake_missing" as ID;
    console.log(`Attempting to edit non-existent check-in ID '${nonExistentCheckInId}' (should fail)...`);
    const res1 = await concept.edit({ checkIn: nonExistentCheckInId, owner: userAlice, value: 5 });
    assertEquals("error" in res1, true, "Editing a non-existent check-in should fail.");
    assertEquals(
      (res1 as { error: string }).error,
      `Check-in with ID '${nonExistentCheckInId}' not found.`,
      "Error message should indicate check-in not found."
    );

    // Test Case 2: Requires - owner of 'checkIn' is 'owner' (attempt to edit by non-owner)
    console.log(`Attempting to edit check-in '${checkInId}' by non-owner Bob (should fail)...`);
    const res2 = await concept.edit({ checkIn: checkInId, owner: userBob, value: 5 });
    assertEquals("error" in res2, true, "Editing by a non-owner should fail.");
    assertEquals((res2 as { error: string }).error, "You are not the owner of this check-in.", "Error message should indicate unauthorized access.");

    // Test Case 3: Requires - if 'metric' is provided, then the InternalMetric 'metric' exists (update to non-existent metric)
    const nonExistentNewMetricId = "metric:another_fake_missing" as ID;
    console.log(`Attempting to update check-in '${checkInId}' metric to non-existent ID '${nonExistentNewMetricId}' (should fail)...`);
    const res3 = await concept.edit({ checkIn: checkInId, owner: userAlice, metric: nonExistentNewMetricId });
    assertEquals("error" in res3, true, "Updating to a non-existent metric should fail.");
    assertEquals(
      (res3 as { error: string }).error,
      `New metric with ID '${nonExistentNewMetricId}' is not defined.`,
      "Error message should indicate the new metric is not defined."
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: edit - effects verification (update value, update metric, update both, no-op)", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: Define metrics and record an initial check-in for Alice
    console.log("Setup: Defining metrics and initial check-in for edit effects tests...");
    const { metric: metricA } = (await concept.defineMetric({ name: "MetricA" })) as { metric: ID };
    const { metric: metricB } = (await concept.defineMetric({ name: "MetricB" })) as { metric: ID };
    const { checkIn: checkInId } = (await concept.record({ owner: userAlice, at: new Date(), metric: metricA, value: 10 })) as { checkIn: ID };
    assertExists(checkInId, "Initial check-in should be created.");

    // Test Case 1: Effects - Update value only
    console.log(`Updating value of check-in '${checkInId}' to 5...`);
    const editValueResult = await concept.edit({ checkIn: checkInId, owner: userAlice, value: 5 });
    assertNotEquals("error" in editValueResult, true, "Updating value should succeed.");
    let retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 5, "Value should be updated to 5.");
    assertEquals(retrievedCheckIn.metric, metricA, "Metric should remain unchanged."); // Ensure other fields are untouched

    // Test Case 2: Effects - Update metric only
    console.log(`Updating metric of check-in '${checkInId}' to MetricB...`);
    const editMetricResult = await concept.edit({ checkIn: checkInId, owner: userAlice, metric: metricB });
    assertNotEquals("error" in editMetricResult, true, "Updating metric should succeed.");
    retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 5, "Value should remain unchanged."); // Ensure other fields are untouched
    assertEquals(retrievedCheckIn.metric, metricB, "Metric should be updated to MetricB.");

    // Test Case 3: Effects - Update both metric and value
    console.log(`Updating both metric to MetricA and value to 9 for check-in '${checkInId}'...`);
    const editBothResult = await concept.edit({ checkIn: checkInId, owner: userAlice, metric: metricA, value: 9 });
    assertNotEquals("error" in editBothResult, true, "Updating both metric and value should succeed.");
    retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId });
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 9, "Value should be updated to 9.");
    assertEquals(retrievedCheckIn.metric, metricA, "Metric should be updated to MetricA.");

    // Test Case 4: No updates - Call edit without metric or value (no-op)
    console.log(`Calling edit on check-in '${checkInId}' without any updates (should succeed with no changes)...`);
    const noUpdateResult = await concept.edit({ checkIn: checkInId, owner: userAlice });
    assertNotEquals("error" in noUpdateResult, true, "Calling edit without any updates should succeed (no actual change).");
    retrievedCheckIn = await concept._getCheckIn({ checkIn: checkInId }); // Verify no unintended changes
    assertExists(retrievedCheckIn);
    assertEquals(retrievedCheckIn.value, 9, "Value should still be 9 after no-op edit.");
    assertEquals(retrievedCheckIn.metric, metricA, "Metric should still be MetricA after no-op edit.");
  } finally {
    await client.close();
  }
});

Deno.test("Queries: _getCheckIn, _getMetricsByName, _listCheckInsByOwner functionality", async () => {
  const [db, client] = await testDb();
  const concept = new QuickCheckInsConcept(db);

  try {
    // Setup: Define multiple metrics and record check-ins for multiple users
    const { metric: energyId } = (await concept.defineMetric({ name: "Energy" })) as { metric: ID };
    const { metric: focusId } = (await concept.defineMetric({ name: "Focus" })) as { metric: ID };

    const checkIn1Alice = (await concept.record({ owner: userAlice, at: new Date("2023-03-01T08:00:00Z"), metric: energyId, value: 7 })) as { checkIn: ID };
    const checkIn2Alice = (await concept.record({ owner: userAlice, at: new Date("2023-03-01T10:00:00Z"), metric: focusId, value: 6 })) as { checkIn: ID };
    const checkIn1Bob = (await concept.record({ owner: userBob, at: new Date("2023-03-01T09:00:00Z"), metric: energyId, value: 5 })) as { checkIn: ID };

    // Query: _getCheckIn
    console.log(`Querying for check-in '${checkIn1Alice.checkIn}'...`);
    const retrievedAliceCheckIn1 = await concept._getCheckIn({ checkIn: checkIn1Alice.checkIn });
    assertExists(retrievedAliceCheckIn1, "Alice's first check-in should be found by ID.");
    assertEquals(retrievedAliceCheckIn1.owner, userAlice, "Retrieved check-in owner should match.");

    console.log("Querying for a non-existent check-in...");
    const nonExistentCheckIn = await concept._getCheckIn({ checkIn: "checkin:nonexistent" as ID });
    assertEquals(nonExistentCheckIn, null, "Query for non-existent check-in should return null.");

    // Query: _getMetricsByName
    console.log("Querying for metric 'Energy' by name...");
    const retrievedEnergyMetric = await concept._getMetricsByName({ name: "Energy" });
    assertExists(retrievedEnergyMetric, "Energy metric should be found by name.");
    assertEquals(retrievedEnergyMetric._id, energyId, "Retrieved Energy metric ID should match.");

    console.log("Querying for a non-existent metric by name...");
    const nonExistentMetric = await concept._getMetricsByName({ name: "NonExistentMetric" });
    assertEquals(nonExistentMetric, null, "Query for non-existent metric should return null.");

    // Query: _listCheckInsByOwner
    console.log(`Listing check-ins for owner '${userAlice}'...`);
    const aliceCheckIns = await concept._listCheckInsByOwner({ owner: userAlice });
    assertEquals(aliceCheckIns.length, 2, "Alice should have 2 check-ins.");
    assertEquals(aliceCheckIns.some(ci => ci._id === checkIn1Alice.checkIn), true, "Alice's first check-in should be in the list.");
    assertEquals(aliceCheckIns.some(ci => ci._id === checkIn2Alice.checkIn), true, "Alice's second check-in should be in the list.");
    assertEquals(aliceCheckIns.every(ci => ci.owner === userAlice), true, "All listed check-ins should belong to Alice.");

    console.log(`Listing check-ins for owner '${userBob}'...`);
    const bobCheckIns = await concept._listCheckInsByOwner({ owner: userBob });
    assertEquals(bobCheckIns.length, 1, "Bob should have 1 check-in.");
    assertEquals(bobCheckIns[0]._id, checkIn1Bob.checkIn, "Bob's check-in should be found.");

    console.log(`Listing check-ins for owner '${userCharlie}' (no check-ins)...`);
    const charlieCheckIns = await concept._listCheckInsByOwner({ owner: userCharlie });
    assertEquals(charlieCheckIns.length, 0, "Charlie should have 0 check-ins.");
  } finally {
    await client.close();
  }
});
```