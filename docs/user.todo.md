# User Accounts & Access Control — Implementation Todo

Implementation checklist for the architecture in [plan.md](./plan.md)
("Accounts, Roles & Access Control" + "Architecture review"). Grouped by the
same phases as the plan, each phase shippable and testable on its own before
moving to the next. The **data migration** (moving today's single-user
progress to the first admin account) is its own section near the end — read
it before touching `server/api/state/*`.

Decision pinned here (plan.md said "keyed by `users._id` (or `githubId`)" —
resolving the "or"): `user_states.userId` **becomes the stringified**
`users._id` (canonical PK, matches how identity is used everywhere else).
Not `githubId` — keeps a clean boundary between "GitHub identity" (lives only
on the `users` doc) and "app account id" (used everywhere else).

---



## Phase 0 — Prerequisites (one-time, manual)

- [x] Register a GitHub OAuth App (github.com → Settings → Developer
  settings → OAuth Apps). Homepage URL = prod URL; Authorization callback URL
  = `https://<domain>/api/auth/github/callback` (register a second dev OAuth
  App with `http://localhost:3000/...` for local dev — GitHub OAuth Apps only
  allow one callback URL each).
- [x] Add new env vars to `.env.example` and to Vercel project settings:
  `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `AUTH_SESSION_SECRET` (generate
  with `openssl rand -base64 32`), `ADMIN_GITHUB_LOGINS` (your GitHub
  username, comma-separated if more than one).
- [x] Wire the new vars into `nuxt.config.ts` `runtimeConfig` (private —
  `githubClientId`, `githubClientSecret`, `authSessionSecret`,
  `adminGithubLogins`).

---



## Phase 1 — Auth core

- [x] `server/utils/users.ts` — `UserDocument` type; `upsertUserFromGithub({ githubId, login, name, avatarUrl })`
  (upsert by `githubId`, set `role: 'admin'` only on insert if `login` is in
  `ADMIN_GITHUB_LOGINS`, otherwise `role: 'user'`; always bump `lastLoginAt`);
  `getUserById(id)`.
- [x] `server/utils/db.ts` — add `users` to `ensureIndexes`: unique index on
  `githubId`.
- [x] `server/utils/auth.ts` — `getAuthSession(event)` wrapping h3's
  `useSession(event, { password: config.authSessionSecret, name: 'iprep_session' })`;
  `requireUser(event)` (resolve `event.context.auth.userId` → `getUserById` →
  throw `401` if no session/user, else return the `UserDocument`);
  `requireAdmin(event)` (call `requireUser`, throw `403` if `role !== 'admin'`).
- [x] `server/middleware/auth.ts` — call `getAuthSession`, set
  `event.context.auth = session.data.userId ? { userId: session.data.userId } : null`.
  No DB call here (see plan.md "Architecture review", point 3).
- [x] `server/api/auth/github.get.ts` — generate random `state`, store in a
  short-lived (~10 min) cookie, redirect to
  `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&state=...`
  (no `scope` param needed — default read-only profile access is enough).
- [x] `server/api/auth/github/callback.get.ts` — read `code`/`state` from
  query, compare `state` to the cookie (reject + clear on mismatch), exchange
  `code` for an access token (`POST https://github.com/login/oauth/access_token`),
  fetch `GET https://api.github.com/user` with that token, call
  `upsertUserFromGithub`, seal the session with `{ userId: user._id.toString() }`,
  clear the state cookie, redirect to `/`.
- [x] `server/api/auth/me.get.ts` — `event.context.auth` → `null` if absent →
  else `getUserById` → return `{ id, login, name, avatarUrl, role }` (never
  the raw Mongo doc / never `githubId` to the client if you'd rather keep it
  server-only).
- [x] `server/api/auth/logout.post.ts` — clear the session
  (`clearSession(event, session)`), return `{ ok: true }`.
- [x] `app/composables/useAuth.ts` — `useAsyncData('auth-me', ...)` wrapper
  around `/api/auth/me`; expose `user`, `role`, `isVisitor`, `isUser`,
  `isAdmin`, `refresh`.
- [x] Nav: add a "Sign in with GitHub" button (visitor) linking to
  `/api/auth/github`, and a user menu (avatar, name, role badge, "Sign out"
  calling `/api/auth/logout` then `navigateTo('/')` + `refresh()`) in
  `AppNavDrawer`.
- [ ] Manual test (**do this before Phase 2 goes live** — code below is
  written and ready, but only you can complete this by actually signing in):
  sign in with the `ADMIN_GITHUB_LOGINS` account → confirm a `users` doc
  exists with `role: 'admin'`; sign in with a different GitHub account →
  confirm `role: 'user'`.

---



## Phase 2 — Re-key progress (see full migration runbook below)

- [x] Add `mutedQuestionIds: string[]` to `AppState` and `DEFAULT_STATE` in
  `server/utils/user-state.ts` (empty array default) — ships now even though
  Mute/Unmute UI lands in Phase 5, so the migration script and the re-keyed
  API agree on shape from day one.
- [x] Write the one-off migration script (`scripts/migrate-single-user-to-admin.mjs`
  + npm scripts) — see runbook below. **Not yet run** — needs the admin's
  `users._id` to exist first (Phase 1's manual sign-in test), which only you
  can do.
- [x] `server/api/state/index.get.ts` / `index.put.ts` — replaced
  `config.appUserId` with `requireUser(event)` → `user._id.toString()`.
  Visitors get `401` here (client falls back to `localStorage`, see Phase 4).
- [ ] Remove `appUserId` from `nuxt.config.ts` `runtimeConfig` and
  `APP_USER_ID` from `.env.example`/Vercel once the migration is verified
  (deliberately left in place — see runbook: this is only safe after you've
  signed in, run the migration for real, and verified the data).

---



## Phase 3 — RBAC on APIs

- [x] `server/api/questions/index.post.ts` — add `await requireAdmin(event)`
  at the top.
- [x] `server/api/questions/[id].put.ts` — add `await requireAdmin(event)`.
- [x] `server/api/questions/[id].patch.ts` (new) — admin-only; body
  `{ status: 'active' | 'archived' }`; sets `archivedAt`/`archivedBy` or
  clears them.
- [x] `server/api/questions/[id].delete.ts` (new) — admin-only hard-delete.
- [x] `server/api/questions/index.get.ts` / `[id].get.ts` — no auth required,
  but exclude `status: 'archived'` for non-admins (visitor/user); admins see
  everything.
- [x] `server/api/admin/users/index.get.ts` (new) — admin-only, list `users`.
- [x] `server/api/admin/users/[id].patch.ts` (new) — admin-only, body
  `{ role: 'user' | 'admin' }`; guard against an admin demoting themselves
  into a zero-admin state (block if they're the last admin).
- [x] `server/api/admin/users/[id].delete.ts` (new) — admin-only; deletes the
  `users` doc **and** its `user_states` doc (cascade); same last-admin guard.

---



## Phase 4 — Client gating

- [x] `app/middleware/auth.ts` (route middleware) — redirect unauthenticated
  visitors away from `/statistics`, `/settings`, and any `/admin/*`; redirect
  non-admins away from `/admin/*`. Apply via `definePageMeta({ middleware: 'auth' })`
  on those pages (don't make it global — `/`, `/questions`, `/practice/*`
  stay open to visitors).
- [x] Nav (`AppNavDrawer`): hide Statistics/Settings for visitors; hide "Add
  Questions" and any `/admin/*` link for non-admins.
- [x] Visitor local progress: on `useReviewState.hydrate()`, if `isVisitor`,
  read/write `localStorage['iprep:guest-state']` instead of calling
  `/api/state` (same `AppState` shape). `persist()` writes to
  `localStorage` for visitors, `PUT /api/state` for signed-in accounts.
- [x] Post-login merge prompt: on first successful login, if
  `localStorage['iprep:guest-state']` exists and has any `reviews`, show a
  one-time modal ("Import your guest progress?") that merges it into the
  freshly-fetched server state (most-recent-`lastReviewedAt` wins per
  question; union `mutedQuestionIds`) and `PUT`s the merged result, then
  clears the local key.
- [x] Hide/disable per-question "Edit" and the global "Add Questions" button
  in `app/pages/questions/index.vue` and `app/pages/questions/[...slug].vue`
  unless `isAdmin`.

---



## Phase 5 — Question state (global archive/restore, personal mute/unmute)

- [x] `server/utils/questions.ts` — add `status`, `archivedAt`, `archivedBy`
  to `QuestionDocument`/`toQuestion`; backfill existing docs to
  `status: 'active'` (one-off script or a `$set`-if-missing on next read).
- [x] `createOrUpdateQuestions` (bulk import) — preserve existing `status` on
  update; only set `status: 'active'` on insert (`$setOnInsert`), per the
  "bulk import resurrecting archived questions" caveat in plan.md.
- [x] `app/utils/questions.ts`-equivalent selection helpers
  (`filterQuestionsByMode`, `selectSessionQuestions`, `dueCountForMode`) —
  exclude `status === 'archived'` (for non-admins) and
  `mutedQuestionIds.includes(question.id)` (for the current account) before
  building a session or counting "due".
- [x] Statistics (`useStatistics`) — scope "due", topic-progress %, and
  weak-topic detection to currently-active + un-muted questions; keep
  historical totals (already-answered counts) as-is. Matches the "stats &
  mastery skew" decision in plan.md.
- [x] Personal Mute/Unmute — a small toggle on the question detail page and
  library rows for any signed-in account; mutates `state.mutedQuestionIds`
  client-side and relies on the existing debounced `PUT /api/state` (no new
  route). Library badge `Muted` + inline Unmute action.
- [x] Global Archive/Restore — admin-only button on
  `app/pages/questions/[...slug].vue`, calling the new
  `PATCH /api/questions/[id]`; confirm dialog ("Archive for all users?")
  visually distinct from Mute. Library badge `Archived` (visible to admins
  only; question is simply absent from non-admin views).
- [x] Empty states: "You've muted every question in this topic — Unmute
  some?" distinct from the existing "all caught up for today" state.

---



## Phase 6 — User management

- [x] `app/pages/admin/users/index.vue` — table of accounts (avatar, login,
  role, `lastLoginAt`), promote/demote button, remove button with a confirm
  modal that names the cascade ("this also deletes their progress").
- [x] Gate the page with the Phase 4 route middleware (admin-only).

---



## Data migration runbook — moving today's single-user data to the admin

Today there is exactly **one** `user_states` document, keyed by the static
`APP_USER_ID` env var (default `"default"`). Goal: after migration, that
same progress belongs to the GitHub account you sign in with as the
bootstrap admin — nothing is lost, nothing is duplicated.

**Order matters.** Do not deploy the Phase 2 API change
(`server/api/state/*` reading `requireUser(event)`) until *after* this
script has run successfully, otherwise there's a window where the admin
signs in and sees an empty state before the copy happens.

1. **Ship & deploy Phase 1 only** (auth core). The old `/api/state` routes
  still read `config.appUserId` — behavior is unchanged for now.
2. **Sign in once** with the GitHub account listed in `ADMIN_GITHUB_LOGINS`.
  Confirm via `/api/auth/me` (or a quick Mongo query) that a `users` doc
   exists for that account with `role: 'admin'`. Note its `_id`.
3. **Write** `scripts/migrate-single-user-to-admin.mjs`, following the same
  shape as `scripts/migrate-content-to-mongo.mjs` (standalone, reads
   `MONGODB_URI` from env, supports `--dry-run`):
  - Look up the admin's `users` doc by `login` (read from
  `ADMIN_GITHUB_LOGINS`, or accept `--login=<name>` as an override).
  - Read the existing `user_states` doc where `userId === APP_USER_ID`
  (read from `APP_USER_ID` env, default `"default"`).
  - If no legacy doc exists, log "nothing to migrate" and exit 0 (fresh
  installs shouldn't error).
  - If a `user_states` doc **already exists** for the admin's `_id`
  (e.g. re-run, or the admin practiced once before migrating), **abort**
  rather than overwrite — surface both doc summaries and require
  `--force` to pick a resolution. Never silently clobber.
  - Copy (don't rename-in-place, so the original stays as a rollback
  point): insert a new `user_states` doc with
  `userId: adminUser._id.toString()`, `state: { ...legacyDoc.state, mutedQuestionIds: legacyDoc.state.mutedQuestionIds ?? [] }`,
  `updatedAt: new Date()`.
  - Log a clear summary (reviews count, streak, sessions count) for both
  the source and the newly written doc so it's eyeball-verifiable.
4. **Add the npm script** in `package.json`:
  `"migrate:admin-user": "node --env-file=.env scripts/migrate-single-user-to-admin.mjs"`
   (+ a `:dry` variant), matching the `migrate:content`/`migrate:content:dry`
   convention already in the repo.
5. **Run it dry first**, read the summary, then run for real:
  `pnpm migrate:admin-user:dry` → `pnpm migrate:admin-user`.
6. **Verify manually**: sign in as admin on `/`, `/statistics`, and
  `/practice` — streak, due count, and mastered count should exactly match
   what the app showed before this whole feature shipped.
7. **Only now** ship Phase 2's API change (`server/api/state/`* →
  `requireUser`). Deploy.
8. **Keep the legacy** `user_states` **doc** (`userId: "default"`) around,
  untouched, for a few days as a rollback copy. Delete it manually once
   you're confident, or leave it — it's inert and orphaned once nothing reads
   `APP_USER_ID` anymore.
9. **Retire** `APP_USER_ID`: remove from `.env.example`, Vercel env vars, and
  `nuxt.config.ts` `runtimeConfig.appUserId`.



### Rollback plan

If something looks wrong after step 6, nothing has been deleted yet — the
original `userId: "default"` document is untouched. Fix the script/decision
and re-run (steps 3-6 are idempotent as written: they abort rather than
double-write). Only step 7 (the API cutover) is the point of no return for
*new* writes; reads of historical data are safe to redo any time before that.
