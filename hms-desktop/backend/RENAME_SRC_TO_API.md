# Rename `src` to `api` (one-time)

All config and scripts now point to the **`api`** folder instead of `src`. You need to rename the folder once:

1. **Close Cursor/VS Code** (so the folder is not locked).
2. In File Explorer, go to `hms-desktop\backend\`.
3. Rename the folder **`src`** to **`api`**.
4. Reopen the project.

After that, `npm run dev`, tests, and setup scripts will use the new `api` folder. You can delete this file afterward.
