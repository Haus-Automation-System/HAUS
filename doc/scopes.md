# Scopes

- `root` - Special: Bypasses all scoping. Applied only to root user. Root users cannot be deleted.
- `app` - Root scope, all users other than root have this scope applied automatically. All logged-in actions require this scope, including logging in itself. Removing it disables an account without deleting it.
    - `user` - Places the account into USER mode. Given to each non-root account by default
    - `kiosk` - Places the account into KIOSK mode.
    - `admin` - Administration scope.
      - `users` - User administration
        - `read` - View user list, including scopes
          - `profile` - View user profiles (no scopes)
        - `write` - Allows editing & deleting users
          - `delete` - Allows deletion of users
          - `scope` - Allows editing of user scopes