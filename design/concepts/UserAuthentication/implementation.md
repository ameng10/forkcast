[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-state](../../background/detailed/concept-state.md)

[@UserAuthentication](UserAuthentication.md)

[@sync-background](../../tools/sync-background.md)

# implement: implement UserAuthentication based on the specification. Make sure it follows the given concept design overview and context.

# response:

# response:


# response:

# file: src/UserAuthentication/UserAuthenticationConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

// Generic types for this concept
type User = ID;

const PREFIX = "UserAuthentication";

/**
 * @concept UserAuthentication
 * @purpose To verify the identity of a user based on credentials they provide, enabling secure access to functionalities.
 * @principle If a user registers with a username and password, and later provides the same username and password to log in, they will be authenticated as that user and can perform actions requiring authentication until they log out.
 */

/**
 * a set of Users with
 *  a username String
 *  a password String
 */
interface UserDoc {
  _id: User;
  username: string;
  password: string;
}

/**
 * a LoggedIn set of Users
 */
interface LoggedInDoc {
  _id: User;
}

export default class UserAuthenticationConcept {
  users: Collection<UserDoc>;
  loggedIn: Collection<LoggedInDoc>;

  constructor(db: Db) {
    this.users = db.collection<UserDoc>(`${PREFIX}.users`);
    this.loggedIn = db.collection<LoggedInDoc>(`${PREFIX}.loggedIn`);
  }

  /**
   * register (username: String, password: String): (user: User) | (error: String)
   *
   * **requires** no User exists with the given `username`
   * **effects** creates a new `User` `u`; sets the `username` and `password` of `u`; returns `u` as `user`
   *
   * **requires** a User already exists with the given `username`
   * **effects** returns an error message "Username already taken."
   */
  async register({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const existingUser = await this.users.findOne({ username });
    if (existingUser) {
      return { error: "Username already taken." };
    }

    const newUser: UserDoc = {
      _id: freshID() as User,
      username,
      password,
    };

    await this.users.insertOne(newUser);
    return { user: newUser._id };
  }

  /**
   * login (username: String, password: String): (user: User) | (error: String)
   *
   * **requires** a User `u` exists with the given `username` and `password`, and `u` is not in the `LoggedIn` set
   * **effects** adds `u` to the `LoggedIn` set; returns `u` as `user`
   *
   * **requires** no User `u` exists with the given `username` and `password`, or `u` is already in the `LoggedIn` set
   * **effects** returns an error message "Invalid username or password." or "User already logged in."
   */
  async login({ username, password }: { username: string; password: string }): Promise<{ user: User } | { error: string }> {
    const user = await this.users.findOne({ username, password });
    if (!user) {
      return { error: "Invalid username or password." };
    }

    const isLoggedIn = await this.loggedIn.findOne({ _id: user._id });
    if (isLoggedIn) {
      return { error: "User already logged in." };
    }

    await this.loggedIn.insertOne({ _id: user._id });
    return { user: user._id };
  }

  /**
   * logout (user: User): (user: User) | (error: String)
   *
   * **requires** `user` is in the `LoggedIn` set
   * **effects** removes `user` from the `LoggedIn` set; returns `user`
   *
   * **requires** `user` is not in the `LoggedIn` set
   * **effects** returns an error message "User is not logged in."
   */
  async logout({ user }: { user: User }): Promise<{ user: User } | { error: string }> {
    const result = await this.loggedIn.deleteOne({ _id: user });
    if (result.deletedCount === 0) {
      return { error: "User is not logged in." };
    }

    return { user };
  }

  /**
   * _isLoggedIn (user: User): (loggedIn: Flag)
   *
   * **requires** `user` exists
   * **effects** returns `true` if `user` is in the `LoggedIn` set, otherwise `false`
   */
  async _isLoggedIn({ user }: { user: User }): Promise<{ loggedIn: boolean }[]> {
    const userDoc = await this.users.findOne({ _id: user });
    if (!userDoc) {
      // Per 'requires' clause, user must exist. Return empty if not found.
      return [];
    }
    const isLoggedIn = await this.loggedIn.findOne({ _id: user });
    return [{ loggedIn: !!isLoggedIn }];
  }

  /**
   * _getUserByUsername (username: String): (user: User)
   *
   * **requires** a user with the given `username` exists
   * **effects** returns the User with the matching `username`
   */
  async _getUserByUsername({ username }: { username: string }): Promise<{ user: User }[]> {
    const user = await this.users.findOne({ username });
    if (user) {
      return [{ user: user._id }];
    }
    return [];
  }
}
```