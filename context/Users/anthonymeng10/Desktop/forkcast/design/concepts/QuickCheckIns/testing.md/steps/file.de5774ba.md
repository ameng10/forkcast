---
timestamp: 'Fri Oct 17 2025 14:26:00 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251017_142600.4e6e0127.md]]'
content_id: de5774ba47383ed837e71261a52622ea3dc21ea28a329ccdf06d5d816ae6a855
---

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
