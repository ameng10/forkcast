---
timestamp: 'Fri Nov 07 2025 11:08:16 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_110816.22568902.md]]'
content_id: 5bc4673322170cd13cec3fece89247e3a606653a9bb5769c21b28c361d7468c1
---

# file: src/UserAuthentication/UserAuthenticationConcept.test.ts

```typescript
import { assertEquals, assertExists, assertNotEquals } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import UserAuthenticationConcept from "./UserAuthenticationConcept.ts";

const usernameA = "alice";
const passwordA = "password123";
const usernameB = "bob";
const passwordB = "securepass";

Deno.test("Principle: Register, Login, Logout Flow", async () => {
  console.log("Testing: Principle - Full authentication lifecycle");
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    // 1. A user registers with a username and password.
    console.log(`  Action: register({ username: "${usernameA}", ... })`);
    const registerResult = await authConcept.register({ username: usernameA, password: passwordA });
    assertNotEquals("error" in registerResult, true, "Registration should not fail.");
    const { user: userId } = registerResult as { user: ID };
    assertExists(userId, "A user ID should be returned on successful registration.");

    // 2. The user provides the same credentials to log in.
    console.log(`  Action: login({ username: "${usernameA}", ... })`);
    const loginResult = await authConcept.login({ username: usernameA, password: passwordA });
    assertNotEquals("error" in loginResult, true, "Login should not fail.");
    assertEquals((loginResult as { user: ID }).user, userId, "Login should return the correct user ID.");

    // 3. They are authenticated and can perform actions (verified by query).
    console.log(`  Query: _isLoggedIn({ user: "${userId}" })`);
    const isLoggedIn = await authConcept._isLoggedIn({ user: userId });
    assertEquals(isLoggedIn.length, 1, "Query should find the user.");
    assertEquals(isLoggedIn[0].loggedIn, true, "User should be marked as logged in.");

    // 4. The user logs out.
    console.log(`  Action: logout({ user: "${userId}" })`);
    const logoutResult = await authConcept.logout({ user: userId });
    assertNotEquals("error" in logoutResult, true, "Logout should not fail.");
    assertEquals((logoutResult as { user: ID }).user, userId, "Logout should return the user ID.");

    // 5. They are no longer authenticated.
    console.log(`  Query: _isLoggedIn({ user: "${userId}" })`);
    const isNowLoggedOut = await authConcept._isLoggedIn({ user: userId });
    assertEquals(isNowLoggedOut.length, 1, "Query should still find the user.");
    assertEquals(isNowLoggedOut[0].loggedIn, false, "User should now be marked as logged out.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: register enforces unique username", async () => {
  console.log("Testing: Action 'register' - requires unique username");
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    // First registration should succeed.
    console.log("  Step: First registration attempt.");
    const firstRegister = await authConcept.register({ username: usernameA, password: passwordA });
    assertNotEquals("error" in firstRegister, true, "First registration should succeed.");

    // Second registration with the same username should fail.
    console.log("  Step: Second registration attempt with same username.");
    const secondRegister = await authConcept.register({ username: usernameA, password: "anotherpassword" });
    assertEquals("error" in secondRegister, true, "Second registration should fail.");
    assertEquals((secondRegister as { error: string }).error, "Username already taken.", "Should return correct error message for duplicate username.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: login enforces requirements", async () => {
  console.log("Testing: Action 'login' - requires valid credentials and logged-out state");
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);

  try {
    // Setup: register a user.
    const { user: userId } = (await authConcept.register({ username: usernameA, password: passwordA })) as { user: ID };

    // Test case: login with incorrect password.
    console.log("  Step: Attempt login with incorrect password.");
    const badPasswordResult = await authConcept.login({ username: usernameA, password: "wrongpassword" });
    assertEquals("error" in badPasswordResult, true, "Login with bad password should fail.");
    assertEquals((badPasswordResult as { error: string }).error, "Invalid username or password.");

    // Test case: login with non-existent username.
    console.log("  Step: Attempt login with non-existent username.");
    const badUsernameResult = await authConcept.login({ username: "nonexistent", password: passwordA });
    assertEquals("error" in badUsernameResult, true, "Login with bad username should fail.");
    assertEquals((badUsernameResult as { error: string }).error, "Invalid username or password.");

    // Test case: login for an already logged-in user.
    console.log("  Step: Log in successfully, then attempt to log in again.");
    await authConcept.login({ username: usernameA, password: passwordA }); // Successful login
    const alreadyLoggedInResult = await authConcept.login({ username: usernameA, password: passwordA });
    assertEquals("error" in alreadyLoggedInResult, true, "Second login attempt should fail.");
    assertEquals((alreadyLoggedInResult as { error: string }).error, "User already logged in.");
  } finally {
    await client.close();
  }
});

Deno.test("Action: logout enforces requirements", async () => {
  console.log("Testing: Action 'logout' - requires user to be logged in");
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);
  const nonExistentUserId = "user:fake" as ID;

  try {
    // Setup: register a user but do not log them in.
    const { user: registeredUserId } = (await authConcept.register({ username: usernameA, password: passwordA })) as { user: ID };

    // Test case: attempt to log out a user who is not logged in.
    console.log("  Step: Attempt to log out a registered but not logged-in user.");
    const notLoggedInResult = await authConcept.logout({ user: registeredUserId });
    assertEquals("error" in notLoggedInResult, true, "Logout should fail for a user not logged in.");
    assertEquals((notLoggedInResult as { error: string }).error, "User is not logged in.");

    // Test case: attempt to log out a non-existent user.
    console.log("  Step: Attempt to log out a non-existent user.");
    const nonExistentUserResult = await authConcept.logout({ user: nonExistentUserId });
    assertEquals("error" in nonExistentUserResult, true, "Logout should fail for a non-existent user.");
    assertEquals((nonExistentUserResult as { error: string }).error, "User is not logged in.");
  } finally {
    await client.close();
  }
});

Deno.test("Query: _getUserByUsername handles existing and non-existing users", async () => {
  console.log("Testing: Query '_getUserByUsername'");
  const [db, client] = await testDb();
  const authConcept = new UserAuthenticationConcept(db);
  try {
    // Setup
    const { user: userIdA } = (await authConcept.register({ username: usernameA, password: passwordA })) as { user: ID };

    // Test: Query for an existing user.
    console.log("  Step: Query for an existing username.");
    const foundUser = await authConcept._getUserByUsername({ username: usernameA });
    assertEquals(foundUser.length, 1);
    assertEquals(foundUser[0].user, userIdA);

    // Test: Query for a non-existent user.
    console.log("  Step: Query for a non-existent username.");
    const notFoundUser = await authConcept._getUserByUsername({ username: "nonexistent" });
    assertEquals(notFoundUser.length, 0);
  } finally {
    await client.close();
  }
});
```
