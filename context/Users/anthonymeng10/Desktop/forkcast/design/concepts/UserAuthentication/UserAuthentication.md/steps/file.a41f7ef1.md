---
timestamp: 'Fri Nov 07 2025 12:23:07 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_122307.f90ef133.md]]'
content_id: a41f7ef1439620295cc3b8851f2e1b39103121e18277aa52dcdf4798fc95f8c3
---

# file: src/concepts/UserAuthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Define the collection prefix for namespacing in MongoDB
const PREFIX = "UserAuthentication" + ".";

// Define generic type parameters used by this concept
type User = ID;

/**
 * Represents a document in the Users collection.
 * a set of `User`s with
 *   a `username` String (unique)
 *   a `passwordHash` String
 */
interface UserDoc {
  _id: User;
  username: string;
  passwordHash: string;
}

/**
 * UserAuthentication Concept
 * purpose: To securely verify a user's identity based on credentials.
 */
export default class UserAuthenticationConcept {
  users: Collection<UserDoc>;

  constructor(db: Db) {
    this.users = db.collection(PREFIX + "users");
    // Create a unique index on the username field to enforce the requirement.
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: no User exists with the given `username`.
   * **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`. If a user with that username already exists, returns an error.
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    // In a real application, you would use a library like bcrypt to hash the password securely.
    // const passwordHash = await bcrypt.hash(password, 10);
    const passwordHash = password; // Placeholder for password hashing

    const newUser: UserDoc = {
      _id: freshID(),
      username,
      passwordHash,
    };

    try {
      await this.users.insertOne(newUser);
      return { user: newUser._id };
    } catch (e) {
      // Catch the duplicate key error from MongoDB's unique index (code 11000)
      if (e.code === 11000) {
        return { error: `User with username '${username}' already exists.` };
      }
      // For other unexpected errors, it's better to let them propagate
      console.error("Unexpected error during registration:", e);
      return { error: "An unexpected error occurred during registration." };
    }
  }

  /**
   * login (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: a User exists with the given `username` and the `password` matches their `passwordHash`.
   * **effects**: returns the matching User `u` as `user`. If no user exists or the password doesn't match, returns an error.
   */
  async login({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const user = await this.users.findOne({ username });

    if (!user) {
      // Use a generic error message to prevent username enumeration attacks.
      return { error: "Invalid username or password." };
    }

    // In a real application, you would use a library like bcrypt to compare the password with the stored hash.
    // const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    const passwordMatches = user.passwordHash === password; // Placeholder for hash comparison

    if (!passwordMatches) {
      return { error: "Invalid username or password." };
    }

    return { user: user._id };
  }

  /**
   * _getUserByUsername (username: String): (user: User)
   *
   * **requires**: a User with the given `username` exists.
   * **effects**: returns the corresponding User.
   */
  async _getUserByUsername({ username }: { username: string }): Promise<Array<{ user: User }>> {
    const user = await this.users.findOne({ username });
    if (user) {
      return [{ user: user._id }];
    }
    return [];
  }
}
```
