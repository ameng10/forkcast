---
timestamp: 'Fri Nov 07 2025 12:41:52 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_124152.0bf73b34.md]]'
content_id: 40c689d787dd83c305422a084a2d7870ab982e13d21ccf4d66a9a11aadf524a3
---

# file: src/concepts/UserAuthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// A simple helper function to hash passwords using the Web Crypto API.
// In a production system, a more robust, salted hashing algorithm like Argon2 or bcrypt would be preferred.
async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Collection prefix for this concept
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept
type User = ID;

/**
 * Represents the state of a single user in the database.
 * a set of `User`s with
 * a `username` String (unique)
 * a `passwordHash` String
 */
interface UserDoc {
  _id: User;
  username: string;
  passwordHash: string;
}

/**
 * @concept UserAuthentication
 * @purpose To securely verify a user's identity based on credentials.
 */
export default class UserAuthenticationConcept {
  users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    // Ensure username is unique at the database level
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: no User exists with the given `username`.
   * **effects**: creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`.
   *
   * **requires**: a User already exists with the given `username`.
   * **effects**: returns an error message.
   */
  async register(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    try {
      const existingUser = await this.users.findOne({ username });
      if (existingUser) {
        return { error: "Username already exists" };
      }

      if (!password || password.length < 8) {
        return { error: "Password must be at least 8 characters long" };
      }

      const passwordHash = await hashPassword(password);
      const newUser: UserDoc = {
        _id: freshID(),
        username,
        passwordHash,
      };

      await this.users.insertOne(newUser);
      return { user: newUser._id };
    } catch (e) {
      // Catch potential duplicate key error from the database index
      if (e.code === 11000) {
        return { error: "Username already exists" };
      }
      console.error("Unexpected error during registration:", e);
      return { error: "An unexpected server error occurred." };
    }
  }

  /**
   * login (username: String, password: String): (user: User) | (error: String)
   *
   * **requires**: a User exists with the given `username` and the `password` matches their `passwordHash`.
   * **effects**: returns the matching User `u` as `user`.
   *
   * **requires**: no User exists with the given `username` or the `password` does not match.
   * **effects**: returns an error message.
   */
  async login(
    { username, password }: { username: string; password: string },
  ): Promise<{ user: User } | { error: string }> {
    const user = await this.users.findOne({ username });

    if (!user) {
      // Hash a dummy password to prevent timing attacks.
      await hashPassword(password);
      return { error: "Invalid username or password" };
    }

    const providedPasswordHash = await hashPassword(password);
    if (user.passwordHash !== providedPasswordHash) {
      return { error: "Invalid username or password" };
    }

    return { user: user._id };
  }

  /**
   * _getUserByUsername (username: String): (user: User)
   *
   * **requires**: a User with the given `username` exists.
   * **effects**: returns the corresponding User.
   */
  async _getUserByUsername(
    { username }: { username: string },
  ): Promise<{ user: User }[]> {
    const user = await this.users.findOne({ username });
    return user ? [{ user: user._id }] : [];
  }
}
```
