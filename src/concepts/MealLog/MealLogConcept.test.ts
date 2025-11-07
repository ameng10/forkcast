import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import MealLogConcept from "./MealLogConcept.ts";

// --- Mock Data for Testing ---

const userAlice = "user:Alice" as ID;
const userBob = "user:Bob" as ID;

const apple = { id: "food:apple", name: "Apple" };
const banana = { id: "food:banana", name: "Banana" };
const chickenBreast = { id: "food:chicken", name: "Chicken Breast" };
const rice = { id: "food:rice", name: "Rice" };

// --- Test Suite for MealLog Concept ---

Deno.test("Principle: User records, views, edits, and deletes a meal log", async () => {
  const [db, client] = await testDb();
  const mealLogConcept = new MealLogConcept(db);

  try {
    console.log("Principle Test: Starting meal logging lifecycle...");
    const mealTime = new Date();
    const initialItems = [apple, banana];

    // 1. A user records a meal.
    console.log("  Step 1: Alice submits a meal.");
    const submitResult = await mealLogConcept.submit({
      owner: userAlice,
      at: mealTime,
      items: initialItems,
      notes: "A healthy snack.",
    });
    assertNotEquals(
      "error" in submitResult,
      true,
      "Meal submission should succeed.",
    );
    const { meal: mealId } = submitResult as { meal: ID };
    assertExists(mealId);

    // 2. The user can view their meal log.
    console.log("  Step 2: Verifying Alice can view her meal.");
    const aliceMeals = await mealLogConcept._getMealsByOwner({
      owner: userAlice,
    });
    assertEquals(aliceMeals.length, 1, "Alice should have one active meal.");
    assertEquals(
      aliceMeals[0].meal._id,
      mealId,
      "Retrieved meal ID should match submitted meal ID.",
    );
    assertEquals(aliceMeals[0].meal.notes, "A healthy snack.");

    // 3. The meal can be edited.
    console.log("  Step 3: Alice edits her meal.");
    const updatedItems = [chickenBreast, rice];
    const editResult = await mealLogConcept.edit({
      caller: userAlice,
      meal: mealId,
      items: updatedItems,
      notes: "A full dinner.",
    });
    assertEquals(
      "error" in editResult,
      false,
      "Editing the meal should succeed.",
    );

    // Verify the edit
    const editedMealResult = await mealLogConcept._getMealById({
      meal: mealId,
    });
    assertEquals(editedMealResult.length, 1, "Edited meal should be found.");
    const editedMeal = editedMealResult[0].meal;
    assertEquals(
      editedMeal.items.length,
      updatedItems.length,
      "Meal items should be updated.",
    );
    assertEquals(editedMeal.items[0].id, chickenBreast.id);
    assertEquals(
      editedMeal.notes,
      "A full dinner.",
      "Meal notes should be updated.",
    );

    // 4. The meal can be deleted.
    console.log("  Step 4: Alice deletes her meal.");
    const deleteResult = await mealLogConcept.delete({
      caller: userAlice,
      meal: mealId,
    });
    assertEquals(
      "error" in deleteResult,
      false,
      "Deleting the meal should succeed.",
    );

    // Verify the deletion
    const mealsAfterDelete = await mealLogConcept._getMealsByOwner({
      owner: userAlice,
    });
    assertEquals(
      mealsAfterDelete.length,
      0,
      "Alice should have 0 active meals after deletion.",
    );

    const allMeals = await mealLogConcept._getMealsByOwner({
      owner: userAlice,
      includeDeleted: true,
    });
    assertEquals(
      allMeals.length,
      1,
      "Including deleted, Alice should still have one meal record.",
    );
    assertEquals(
      allMeals[0].meal.status,
      "DELETED",
      "Meal status should be DELETED.",
    );
    console.log("Principle Test: Lifecycle completed successfully.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: submit - requires non-empty items", async () => {
  const [db, client] = await testDb();
  const mealLogConcept = new MealLogConcept(db);

  try {
    const result = await mealLogConcept.submit({
      owner: userAlice,
      at: new Date(),
      items: [],
      notes: "This should fail",
    });
    assertEquals(
      "error" in result,
      true,
      "Submitting with an empty items array should return an error.",
    );
    assertEquals(
      (result as { error: string }).error,
      "A meal must contain at least one food item.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Action: edit - enforces all requirements", async () => {
  const [db, client] = await testDb();
  const mealLogConcept = new MealLogConcept(db);

  try {
    // Setup a valid meal for testing against
    const { meal: mealId } =
      (await mealLogConcept.submit({
        owner: userAlice,
        at: new Date(),
        items: [apple],
      })) as { meal: ID };

    // Requires: meal must exist
    const nonExistentMealId = "meal:fake" as ID;
    const res1 = await mealLogConcept.edit({
      caller: userAlice,
      meal: nonExistentMealId,
      notes: "fail",
    });
    assertEquals(
      "error" in res1,
      true,
      "Editing a non-existent meal should fail.",
    );

    // Requires: caller must be the owner
    const res2 = await mealLogConcept.edit({
      caller: userBob,
      meal: mealId,
      notes: "fail",
    });
    assertEquals(
      "error" in res2,
      true,
      "Editing another user's meal should fail.",
    );
    assertEquals(
      (res2 as { error: string }).error,
      "Caller is not the owner of this meal.",
    );

    // Requires: items, if provided, must not be empty
    const res3 = await mealLogConcept.edit({
      caller: userAlice,
      meal: mealId,
      items: [],
    });
    assertEquals(
      "error" in res3,
      true,
      "Editing with an empty items array should fail.",
    );

    // Requires: meal status must be ACTIVE
    await mealLogConcept.delete({ caller: userAlice, meal: mealId }); // Delete the meal first
    const res4 = await mealLogConcept.edit({
      caller: userAlice,
      meal: mealId,
      notes: "fail",
    });
    assertEquals("error" in res4, true, "Editing a deleted meal should fail.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: delete - enforces all requirements", async () => {
  const [db, client] = await testDb();
  const mealLogConcept = new MealLogConcept(db);

  try {
    // Setup a valid meal
    const { meal: mealId } =
      (await mealLogConcept.submit({
        owner: userAlice,
        at: new Date(),
        items: [apple],
      })) as { meal: ID };

    // Requires: meal must exist
    const nonExistentMealId = "meal:fake" as ID;
    const res1 = await mealLogConcept.delete({
      caller: userAlice,
      meal: nonExistentMealId,
    });
    assertEquals(
      "error" in res1,
      true,
      "Deleting a non-existent meal should fail.",
    );

    // Requires: caller must be the owner
    const res2 = await mealLogConcept.delete({ caller: userBob, meal: mealId });
    assertEquals(
      "error" in res2,
      true,
      "Deleting another user's meal should fail.",
    );

    // Requires: meal status must be ACTIVE
    await mealLogConcept.delete({ caller: userAlice, meal: mealId }); // Successful delete
    const res3 = await mealLogConcept.delete({
      caller: userAlice,
      meal: mealId,
    }); // Attempt second delete
    assertEquals(
      "error" in res3,
      true,
      "Deleting an already-deleted meal should fail.",
    );
  } finally {
    await client.close();
  }
});

Deno.test("Queries: correctly retrieve and filter data", async () => {
  const [db, client] = await testDb();
  const mealLogConcept = new MealLogConcept(db);
  try {
    // Setup: Alice has two meals (one to be deleted), Bob has one.
    const { meal: aliceMeal1 } =
      (await mealLogConcept.submit({
        owner: userAlice,
        at: new Date(),
        items: [apple],
      })) as { meal: ID };
    await mealLogConcept.submit({
      owner: userAlice,
      at: new Date(),
      items: [banana],
    });
    await mealLogConcept.submit({
      owner: userBob,
      at: new Date(),
      items: [chickenBreast],
    });
    await mealLogConcept.delete({ caller: userAlice, meal: aliceMeal1 });

    // Test _getMealsByOwner
    const aliceActive = await mealLogConcept._getMealsByOwner({
      owner: userAlice,
    });
    assertEquals(aliceActive.length, 1, "Should find 1 active meal for Alice.");
    const aliceAll = await mealLogConcept._getMealsByOwner({
      owner: userAlice,
      includeDeleted: true,
    });
    assertEquals(aliceAll.length, 2, "Should find 2 total meals for Alice.");
    const bobActive = await mealLogConcept._getMealsByOwner({ owner: userBob });
    assertEquals(bobActive.length, 1, "Should find 1 active meal for Bob.");

    // Test _getMealOwner
    const ownerResult = await mealLogConcept._getMealOwner({
      meal: aliceMeal1,
    });
    assertEquals(ownerResult.length, 1, "Should find the owner for the meal.");
    assertEquals(ownerResult[0].owner, userAlice, "The owner should be Alice.");
  } finally {
    await client.close();
  }
});
