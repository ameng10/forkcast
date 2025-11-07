running 5 tests from ./src/concepts/UserAuthentication/UserAuthenticationConcept.test.ts
Principle: Register, Login, Logout Flow ...
------- output -------
Testing: Principle - Full authentication lifecycle
  Action: register({ username: "alice", ... })
  Action: login({ username: "alice", ... })
  Query: _isLoggedIn({ user: "019a5f14-475a-7f2c-937c-ea4f7a440121" })
  Action: logout({ user: "019a5f14-475a-7f2c-937c-ea4f7a440121" })
  Query: _isLoggedIn({ user: "019a5f14-475a-7f2c-937c-ea4f7a440121" })
----- output end -----
Principle: Register, Login, Logout Flow ... ok (1s)
Action: register enforces unique username ...
------- output -------
Testing: Action 'register' - requires unique username
  Step: First registration attempt.
  Step: Second registration attempt with same username.
----- output end -----
Action: register enforces unique username ... ok (832ms)
Action: login enforces requirements ...
------- output -------
Testing: Action 'login' - requires valid credentials and logged-out state
  Step: Attempt login with incorrect password.
  Step: Attempt login with non-existent username.
  Step: Log in successfully, then attempt to log in again.
----- output end -----
Action: login enforces requirements ... ok (871ms)
Action: logout enforces requirements ...
------- output -------
Testing: Action 'logout' - requires user to be logged in
  Step: Attempt to log out a registered but not logged-in user.
  Step: Attempt to log out a non-existent user.
----- output end -----
Action: logout enforces requirements ... ok (705ms)
Query: _getUserByUsername handles existing and non-existing users ...
------- output -------
Testing: Query '_getUserByUsername'
  Step: Query for an existing username.
  Step: Query for a non-existent username.
----- output end -----
Query: _getUserByUsername handles existing and non-existing users ... ok (667ms)

ok | 5 passed | 0 failed (4s)
