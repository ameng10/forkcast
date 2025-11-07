---
timestamp: 'Fri Nov 07 2025 12:20:19 GMT-0500 (Eastern Standard Time)'
parent: '[[../20251107_122019.55a078d9.md]]'
content_id: 7925811064fba0e90cd1e18b5b4e8d8876b7181752348fc07bf2bdffd75551e9
---

# file: src/UserAuthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "UserAuthentication" + ".";

// Generic types of this concept
type User = ID;

/**
 * a set of Users with
 *   a username String (unique)
 *   a passwordHash String
 */
interface UserDoc {
  _id: User;
  username: string;
  passwordHash: string;
}

/**
 * @concept UserAuthentication - To securely verify a user's identity based on credentials.
 * @principle If you register with a unique username and a password, and later provide the same credentials to log in, you will be successfully identified as that user.
 */
export default class UserAuthenticationConcept {
  users: Collection<UserDoc>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection(PREFIX + "users");
    // Ensure usernames are unique to enforce the concept's requires clause
    this.users.createIndex({ username: 1 }, { unique: true });
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * **requires** no User exists with the given `username`.
   * **effects** creates a new User `u`; sets their `username` and a hash of their `password`; returns `u` as `user`.
   *
   * **requires** a User already exists with the given `username`.
   * **effects** returns an error message.
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "Username already exists" };
    }

    // In a real application, use a strong hashing algorithm like bcrypt.
    // For this example, we'll simulate hashing.
    const passwordHash = `hashed(${password})`;

    const newUser: UserDoc = {
      _id: freshID() as User,
      username,
      passwordHash,
    };

    await this.users.insertOne(newUser);
    return { user: newUser._id };
  }

  /**
   * login (username: String, password: String): (user: User) | (error: String)
   *
   * **requires** a User exists with the given `username` and the `password` matches their `passwordHash`.
   * **effects** returns the matching User `u` as `user`.
   *
   * **requires** no User exists with the given `username` or the `password` does not match.
   * **effects** returns an error message.
   */
  async login({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const user = await this.users.findOne({ username });

    const expectedPasswordHash = `hashed(${password})`;
    if (!user || user.passwordHash !== expectedPasswordHash) {
      return { error: "Invalid username or password" };
    }

    return { user: user._id };
  }

  /**
   * _getUserByUsername (username: String): (user: User)
   *
   * **requires** a User with the given `username` exists.
   * **effects** returns the corresponding User.
   */
  async _getUserByUsername({ username }: { username: string }): Promise<{ user: User }[]> {
    const user = await this.users.findOne({ username });
    if (!user) {
      return [];
    }
    return [{ user: user._id }];
  }
}
```
