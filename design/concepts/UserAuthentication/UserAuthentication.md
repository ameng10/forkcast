[@concept-design-brief](../../background/concept-design-brief.md)

[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

[@concept-state](../../background/detailed/concept-state.md)


[@sync-background](../../tools/sync-background.md)

# implement: The UserAuthentication concept specification based on the concept specification overview. If the action throws an error, add a throws section. The UserAuthentication concept should allow a user to sign in and sign out and maintain being signed in.

# response:

# response:


# response:

# concept: UserAuthentication

**concept** UserAuthentication [User]

**purpose** To verify the identity of a user based on credentials they provide, enabling secure access to functionalities.

**principle** If a user registers with a username and password, and later provides the same username and password to log in, they will be authenticated as that user and can perform actions requiring authentication until they log out.

**state**
```
a set of Users with
  a username String
  a password String

a LoggedIn set of Users
```

**actions**

register (username: String, password: String): (user: User)
**requires** no User exists with the given `username`
**effects** creates a new `User` `u`; sets the `username` and `password` of `u`; returns `u` as `user`

register (username: String, password: String): (error: String)
**requires** a User already exists with the given `username`
**effects** returns an error message "Username already taken."

login (username: String, password: String): (user: User)
**requires** a User `u` exists with the given `username` and `password`, and `u` is not in the `LoggedIn` set
**effects** adds `u` to the `LoggedIn` set; returns `u` as `user`

login (username: String, password: String): (error: String)
**requires** no User `u` exists with the given `username` and `password`, or `u` is already in the `LoggedIn` set
**effects** returns an error message "Invalid username or password." or "User already logged in."

logout (user: User): (user: User)
**requires** `user` is in the `LoggedIn` set
**effects** removes `user` from the `LoggedIn` set; returns `user`

logout (user: User): (error: String)
**requires** `user` is not in the `LoggedIn` set
**effects** returns an error message "User is not logged in."

**queries**

\_isLoggedIn (user: User): (loggedIn: Flag)
**requires** `user` exists
**effects** returns `true` if `user` is in the `LoggedIn` set, otherwise `false`

\_getUserByUsername (username: String): (user: User)
**requires** a user with the given `username` exists
**effects** returns the User with the matching `username`