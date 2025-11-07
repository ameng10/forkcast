---
timestamp: 'Fri Nov 07 2025 00:50:48 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_005048.6f4b2ed6.md]]'
content_id: 471b95334306da9b68d30c01400a78f5b8ced1c2f4a9a6b632ffae74af6aee47
---

# file: src/meallog/MealLogConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals, assertThrowsAsync } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import MealLogConcept, { MealStatus, PermissionError } from "./MealLogConcept.ts"; // Assuming MealLogConcept.ts exports PermissionError and MealStatus

// --- Mock Data and Types for Testing ---

// Define concrete types for User and FoodItem for testing purposes
type TestUserId = ID;
type TestFoodItemId = ID;

interface TestUser {
    id: TestUserId;
    name: string;
}

interface TestFoodItem {
    id: TestFoodItemId;
    name: string;
    calories: number;
}

// Mock User instances
const userAlice: TestUser = { id: "user:Alice" as TestUserId, name: "Alice" };
const userBob: TestUser = { id: "user:Bob" as TestUserId, name: "Bob" };
const userCharlie: TestUser = { id: "user:Charlie" as TestUserId, name: "Charlie" };

// Mock FoodItem instances
const apple: TestFoodItem = { id: "food:apple" as TestFoodItemId, name: "Apple", calories: 95 };
const banana: TestFoodItem = { id: "food:banana" as TestFoodItemId, name: "Banana", calories: 105 };
const chickenBreast: TestFoodItem = { id: "food:chicken_breast" as TestFoodItemId, name: "Chicken Breast", calories: 165 };
const rice: TestFoodItem = { id: "food:rice" as TestFoodItemId, name: "Rice", calories: 130 };

// Mock user resolver for the MealLogConcept constructor
// This simulates fetching user details from another concept (e.g., UserProfile)
const mockUserResolver = async (userId: TestUserId): Promise<TestUser | undefined> => {
    switch (userId) {
        case userAlice.id: return userAlice;
        case userBob.id: return userBob;
        case userCharlie.id: return userCharlie;
        default: return undefined; // User not found
    }
};

// --- Test Suite for MealLog Concept ---

Deno.test("Principle: User records, views, edits, and deletes a meal log", async () => {
    const [db, client] = await testDb();
    const mealLogConcept = new MealLogConcept<TestUser, TestFoodItem>(db.client.s.url, db.databaseName, mockUserResolver);
    await mealLogConcept.connect();

    try {
        const mealTime = new Date();
        const mealItems = [apple, banana];
        const mealNotes = "A healthy snack.";

        // 1. A user records a meal
        const submittedMeal = await mealLogConcept.submit(userAlice, mealTime, mealItems, mealNotes);
        assertExists(submittedMeal, "Submitted meal should be returned.");
        assertEquals(submittedMeal.owner.id, userAlice.id, "Meal owner should be Alice.");
        assertEquals(submittedMeal.items.length, mealItems.length, "Meal should have 2 items.");
        assertEquals(submittedMeal.notes, mealNotes, "Meal notes should match.");
        assertEquals(submittedMeal.status, MealStatus.ACTIVE, "Meal should be active by default.");

        // 2. User can view their own meal logs
        const aliceMeals = await mealLogConcept.getMealsForOwner(userAlice.id);
        assertEquals(aliceMeals.length, 1, "Alice should have 1 active meal.");
        assertEquals(aliceMeals[0].id, submittedMeal.id, "The retrieved meal ID should match the submitted meal ID.");

        const retrievedMeal = await mealLogConcept.getMealById(submittedMeal.id, userAlice.id);
        assertExists(retrievedMeal, "Meal should be retrievable by ID for the owner.");
        assertEquals(retrievedMeal?.id, submittedMeal.id);

        // 3. Meals can be edited
        const updatedItems = [chickenBreast, rice];
        const updatedNotes = "A main meal.";
        await mealLogConcept.edit(userAlice, submittedMeal.id, updatedItems, updatedNotes);

        const editedMeal = await mealLogConcept.getMealById(submittedMeal.id, userAlice.id);
        assertExists(editedMeal, "Edited meal should still exist.");
        assertEquals(editedMeal?.items.length, updatedItems.length, "Meal items should be updated.");
        assertEquals(editedMeal?.notes, updatedNotes, "Meal notes should be updated.");
        assertEquals(editedMeal?.status, MealStatus.ACTIVE, "Meal status should remain active after edit.");

        // 4. Meals can be deleted
        await mealLogConcept.delete(userAlice, submittedMeal.id);

        const mealsAfterDelete = await mealLogConcept.getMealsForOwner(userAlice.id);
        assertEquals(mealsAfterDelete.length, 0, "Alice should have 0 active meals after deletion.");

        const deletedMeal = await mealLogConcept.getMealById(submittedMeal.id, userAlice.id);
        assertExists(deletedMeal, "Deleted meal document should still exist in DB (but be marked deleted).");
        assertEquals(deletedMeal?.status, MealStatus.DELETED, "Meal status should be DELETED.");

        const allMealsIncludingDeleted = await mealLogConcept.getMealsForOwner(userAlice.id, true);
        assertEquals(allMealsIncludingDeleted.length, 1, "Including deleted, Alice should have 1 meal.");
        assertEquals(allMealsIncludingDeleted[0].id, submittedMeal.id);

    } finally {
        await mealLogConcept.disconnect();
    }
});

Deno.test("Action: submit - requires owner exists and items is nonempty", async (t) => {
    const [db, client] = await testDb();
    const mealLogConcept = new MealLogConcept<TestUser, TestFoodItem>(db.client.s.url, db.databaseName, mockUserResolver);
    await mealLogConcept.connect();

    try {
        const mealTime = new Date();
        const validItems = [apple];
        // Test case: owner exists (covered by principle test)

        await t.step("should return error if items is empty", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.submit(userAlice, mealTime, []); },
                Error,
                "A meal must contain at least one food item.",
                "Submitting with empty items should throw an error."
            );
        });

        await t.step("should return error if items is undefined/null", async () => {
             // TS type system prevents passing undefined/null for `items` directly,
             // but if `items` were optional, this would be relevant.
             // For now, rely on `items.length === 0` check.
             await assertThrowsAsync(
                async () => { await mealLogConcept.submit(userAlice, mealTime, null as unknown as TestFoodItem[]); },
                Error,
                "A meal must contain at least one food item.",
                "Submitting with null items should throw an error."
            );
        });

    } finally {
        await mealLogConcept.disconnect();
    }
});

Deno.test("Action: edit - requirements and effects", async (t) => {
    const [db, client] = await testDb();
    const mealLogConcept = new MealLogConcept<TestUser, TestFoodItem>(db.client.s.url, db.databaseName, mockUserResolver);
    await mealLogConcept.connect();

    const mealTime = new Date();
    const initialItems = [apple];
    const initialNotes = "Initial notes.";
    let submittedMealId: string;

    try {
        const submittedMeal = await mealLogConcept.submit(userAlice, mealTime, initialItems, initialNotes);
        submittedMealId = submittedMeal.id;

        await t.step("should return error if meal does not exist", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.edit(userAlice, "nonExistentMeal" as ID, [banana]); },
                Error,
                "Meal with ID 'nonExistentMeal' does not exist.",
                "Editing a non-existent meal should throw an error."
            );
        });

        await t.step("should return error if caller is not the owner", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.edit(userBob, submittedMealId, [banana]); },
                PermissionError,
                "Caller is not the owner of this meal.",
                "Editing by a non-owner should throw a PermissionError."
            );
        });

        await t.step("should return error if meal status is not active", async () => {
            await mealLogConcept.delete(userAlice, submittedMealId); // First delete the meal
            const deletedMeal = await mealLogConcept.getMealById(submittedMealId, userAlice.id);
            assertEquals(deletedMeal?.status, MealStatus.DELETED, "Meal should be deleted for this test step.");

            await assertThrowsAsync(
                async () => { await mealLogConcept.edit(userAlice, submittedMealId, [banana]); },
                Error,
                "Cannot edit a meal that is not active. Current status: deleted",
                "Editing a deleted meal should throw an error."
            );

            // Re-submit for subsequent tests if needed, or get a fresh DB. For simplicity, we'll re-connect for next steps or ensure isolation.
            // For now, assume this test step is isolated and no further actions on this meal are required.
        });

        // Reconnect and submit a new meal for the following steps
        await mealLogConcept.disconnect();
        await mealLogConcept.connect();
        const freshMeal = await mealLogConcept.submit(userAlice, mealTime, initialItems, initialNotes);
        submittedMealId = freshMeal.id;

        await t.step("should return error if updated items array is empty", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.edit(userAlice, submittedMealId, []); },
                Error,
                "Items array cannot be empty when updating.",
                "Updating with empty items should throw an error."
            );
        });

        await t.step("should update notes correctly", async () => {
            const newNotes = "Updated notes only.";
            await mealLogConcept.edit(userAlice, submittedMealId, undefined, newNotes);
            const updatedMeal = await mealLogConcept.getMealById(submittedMealId, userAlice.id);
            assertEquals(updatedMeal?.notes, newNotes, "Notes should be updated.");
            assertEquals(updatedMeal?.items.length, initialItems.length, "Items should remain unchanged.");
        });

        await t.step("should update items correctly", async () => {
            const newItems = [chickenBreast];
            await mealLogConcept.edit(userAlice, submittedMealId, newItems);
            const updatedMeal = await mealLogConcept.getMealById(submittedMealId, userAlice.id);
            assertEquals(updatedMeal?.items.length, newItems.length, "Items should be updated.");
            assertEquals(updatedMeal?.items[0].id, newItems[0].id, "Item ID should match.");
        });

    } finally {
        await mealLogConcept.disconnect();
    }
});

Deno.test("Action: delete - requirements and effects", async (t) => {
    const [db, client] = await testDb();
    const mealLogConcept = new MealLogConcept<TestUser, TestFoodItem>(db.client.s.url, db.databaseName, mockUserResolver);
    await mealLogConcept.connect();

    const mealTime = new Date();
    const initialItems = [apple];
    let submittedMealId: string;

    try {
        const submittedMeal = await mealLogConcept.submit(userAlice, mealTime, initialItems);
        submittedMealId = submittedMeal.id;

        await t.step("should return error if meal does not exist", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.delete(userAlice, "nonExistentMeal" as ID); },
                Error,
                "Meal with ID 'nonExistentMeal' does not exist.",
                "Deleting a non-existent meal should throw an error."
            );
        });

        await t.step("should return error if caller is not the owner", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.delete(userBob, submittedMealId); },
                PermissionError,
                "Caller is not the owner of this meal.",
                "Deleting by a non-owner should throw a PermissionError."
            );
        });

        await t.step("should set status to DELETED on success", async () => {
            await mealLogConcept.delete(userAlice, submittedMealId);
            const deletedMeal = await mealLogConcept.getMealById(submittedMealId, userAlice.id);
            assertEquals(deletedMeal?.status, MealStatus.DELETED, "Meal status should be DELETED after successful deletion.");
        });

        await t.step("should return error if meal status is already deleted", async () => {
            // Attempt to delete the same meal again
            await assertThrowsAsync(
                async () => { await mealLogConcept.delete(userAlice, submittedMealId); },
                Error,
                "Cannot delete a meal that is not active. Current status: deleted",
                "Deleting an already deleted meal should throw an error."
            );
        });

    } finally {
        await mealLogConcept.disconnect();
    }
});

Deno.test("Query: getMealsForOwner and getMealById access controls", async (t) => {
    const [db, client] = await testDb();
    const mealLogConcept = new MealLogConcept<TestUser, TestFoodItem>(db.client.s.url, db.databaseName, mockUserResolver);
    await mealLogConcept.connect();

    const mealTime = new Date();
    const aliceMeal1 = await mealLogConcept.submit(userAlice, mealTime, [apple]);
    const aliceMeal2 = await mealLogConcept.submit(userAlice, mealTime, [banana]);
    const bobMeal1 = await mealLogConcept.submit(userBob, mealTime, [chickenBreast]);

    try {
        await t.step("getMealsForOwner should retrieve only active meals by default", async () => {
            const aliceActiveMeals = await mealLogConcept.getMealsForOwner(userAlice.id);
            assertEquals(aliceActiveMeals.length, 2, "Alice should have 2 active meals.");
            const bobActiveMeals = await mealLogConcept.getMealsForOwner(userBob.id);
            assertEquals(bobActiveMeals.length, 1, "Bob should have 1 active meal.");
        });

        await t.step("getMealsForOwner should include deleted meals when specified", async () => {
            await mealLogConcept.delete(userAlice, aliceMeal1.id);
            const aliceAllMeals = await mealLogConcept.getMealsForOwner(userAlice.id, true);
            assertEquals(aliceAllMeals.length, 2, "Alice should have 2 meals including deleted.");
            const deleted = aliceAllMeals.find(m => m.id === aliceMeal1.id);
            assertExists(deleted);
            assertEquals(deleted.status, MealStatus.DELETED);
        });

        await t.step("getMealById should return undefined for non-existent meal", async () => {
            const meal = await mealLogConcept.getMealById("nonExistentMeal" as ID, userAlice.id);
            assertEquals(meal, undefined, "Should return undefined for non-existent meal.");
        });

        await t.step("getMealById should allow owner to access their meal", async () => {
            const meal = await mealLogConcept.getMealById(aliceMeal2.id, userAlice.id);
            assertExists(meal, "Alice should be able to retrieve her own meal.");
            assertEquals(meal?.id, aliceMeal2.id);
        });

        await t.step("getMealById should throw PermissionError for non-owner accessing a meal", async () => {
            await assertThrowsAsync(
                async () => { await mealLogConcept.getMealById(aliceMeal2.id, userBob.id); },
                PermissionError,
                "Caller is not authorized to view this meal.",
                "Non-owner should not be able to retrieve another user's meal by ID."
            );
        });

        await t.step("getMealById without callerId should retrieve meal (for internal use/admin)", async () => {
            // This behavior is allowed by the current implementation (callerId is optional).
            // In a real app, external APIs would still enforce callerId.
            const meal = await mealLogConcept.getMealById(aliceMeal2.id);
            assertExists()
        }
    }
}
```
