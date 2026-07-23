# Plan — Accounts, Roles & Access Control

Introduce multi-user support with GitHub login and a role system. Today the app
is effectively single-user (all progress lives in one `user_states` document
keyed by the `APP_USER_ID` env var) and every page/route is open to everyone.
This plan replaces that with three roles and precise, per-role access.

> Auth is **built in-house** — a direct GitHub OAuth flow. No third-party auth
> service or SaaS (no Auth0, Clerk, Supabase Auth, next-auth, etc.). GitHub is
> the only identity provider, and it's the only way to create an account.

---

## Roles

| Role | Authenticated? | Stored in DB? | One-line summary |
|---|---|---|---|
| **visitor** | No | No | Anonymous. Can try the app; progress is local-only and ephemeral. |
| **user** | Yes (GitHub) | Yes (`users` + `user_states`) | Owns persisted progress, streaks, stats, and settings. |
| **admin** | Yes (GitHub) | Yes (`users` + `user_states`) | Everything a user has **plus** manages the shared question bank and users. |

Key principles:

- **Question *content* is global/shared.** All roles read the same question
  bank. Only admins can create/edit/delete the content itself.
- **Question *state* is per-account.** Each `user`/`admin` has their own SRS
  scheduling (scheduled / due / mastered), plus their own personal on/off
  toggle per question (see "Question state: global vs personal"). One user's
  state never leaks into another's.
- **Progress is per-account.** Each `user`/`admin` has their own SRS state,
  streaks, and settings. Visitors get none of this server-side.
- **Admin is a superset of user.** Admins can do everything a user can, in
  their own account, and additionally access management surfaces.

---

## Feature access matrix

Legend: ✅ full · 🟡 limited / local-only · ❌ no access

| Feature | Route(s) | visitor | user | admin |
|---|---|:---:|:---:|:---:|
| Home / dashboard | `/` | 🟡¹ | ✅ | ✅ |
| Browse question library (search/filter) | `/questions` | ✅ | ✅ | ✅ |
| View question detail + answer | `/questions/[slug]` | ✅ | ✅ | ✅ |
| Run a practice session (SRS) | `/practice`, `/practice/session`, `/practice/complete` | 🟡² | ✅ | ✅ |
| Rate answers / schedule reviews | (session) | 🟡² | ✅ | ✅ |
| Statistics (streaks, mastery, weak topics) | `/statistics` | ❌³ | ✅ | ✅ |
| Settings (session size, default mode) | `/settings` | 🟡⁴ | ✅ | ✅ |
| Export / import own **progress/state** | `/settings` | ❌ | ✅ | ✅ |
| Reset own progress | `/settings` | ❌ | ✅ | ✅ |
| Own SRS state per question (scheduled/due/mastered) | (session) | 🟡² | ✅ | ✅ |
| **Mute/unmute** a question for **myself only** (personal) | `/questions`, session | 🟡² | ✅ | ✅ |
| Create / **import questions** (single + bulk JSON) | `/questions` (Add Questions) | ❌ | ❌ | ✅ |
| Edit a question (title / hint / answer / topic / difficulty) | `/questions/[slug]` (Edit) | ❌ | ❌ | ✅ |
| **Archive/restore** a question **globally** (all users) | `/questions/[slug]` | ❌ | ❌ | ✅ |
| Hard-delete a question (permanent) | `/questions/[slug]` | ❌ | ❌ | ✅ |
| Manage users (list, promote/demote, remove) | `/admin/users` (new) | ❌ | ❌ | ✅ |

> Note the two independent controls on the last rows: **Mute** is personal
> (any signed-in user, affects only them); **Archive** is global (admin only,
> affects everyone). An admin has *both* and can mute a question for themselves
> without archiving it for others — see the next section.

> **Two different "imports" — don't conflate them:**
> - **Import questions** (bulk JSON into the shared `questions` bank) is
>   **admin-only** (`POST /api/questions`). Users and visitors never add or
>   import questions.
> - **Import progress** in Settings restores a user's *own* `user_states`
>   backup — it never touches the question bank and is available to any
>   signed-in account.

Footnotes:

1. **Visitor home** shows a marketing/intro state with a "Sign in with GitHub"
   call to action. Streak/stat widgets are hidden or shown as a locked
   preview, since there is no server-side account behind them.
2. **Visitor practice** works, but ratings are written to `localStorage` only
   (see "Visitor progress" below). No streaks, no cross-device sync, and the
   data is never sent to the server. A persistent "Sign in to save your
   progress" prompt is shown.
3. **Visitor statistics** are hidden entirely (no meaningful server data). The
   nav entry is not shown to visitors.
4. **Visitor settings** are limited to in-memory/local preferences (e.g.
   session size for the current session). Export/import/reset — which operate
   on the server `user_states` document — are hidden.

---

## Per-role capabilities in detail

### Visitor (anonymous)

Can:
- Land on `/` and see the intro + "Sign in with GitHub".
- Browse and search the full question library (`/questions`).
- Open any question and read its ideal answer (`/questions/[slug]`).
- Start a practice session and rate questions, with **local-only** progress.

Cannot:
- Persist progress to the server, build streaks, or sync across devices.
- See the Statistics page.
- Create, edit, or delete questions.
- Export/import/reset server-side progress.

**Visitor progress:** stored under a `localStorage` key (e.g.
`iprep:guest-state`) using the same `AppState` shape. On first successful
login, offer a one-time "import your guest progress into your account" merge.

### User (GitHub account, role = `user`)

Everything a visitor can do, plus:
- Persisted SRS state in `user_states` keyed by their account id.
- Full dashboard with real streak, due count, and weak topics.
- Statistics page.
- Settings: session size, default practice mode, custom topics, export/import,
  and reset — all scoped to **their own** account.

Cannot:
- Touch the shared question bank (no create/edit/delete).
- Access any `/admin/*` surface or user management.

### Admin (GitHub account, role = `admin`)

Everything a user can do (in their own account), plus:
- **Question bank management** (the current "Add Questions" modal, inline edit,
  and a new delete/archive action) — this is the only role that may mutate
  `questions`.
- **User management** at `/admin/users`: list accounts, promote/demote between
  `user` and `admin`, and remove an account (which also deletes its
  `user_states`).

---

## Question state: global vs personal

A single question has **content** (shared, admin-owned) and, for each signed-in
account, **per-user state** layered on top. There are two independent on/off
controls that must never be confused:

| Control | Who sets it | Scope of effect | Reversible? | Term |
|---|---|---|---|---|
| **Archive** | admin only | **Everyone** — question disappears from the shared bank for all users | Yes (Restore) | *global* |
| **Mute** | any signed-in user (incl. admin, for themselves) | **Only that account** — removed from *my* rotation | Yes (Unmute) | *personal* |

### Terminology (naming the personal toggle)

The personal control needs a name distinct from the admin's global "Archive"
so an admin never confuses "hide this from me" with "hide this from everyone".
Recommended: **Mute** (short, clearly personal, keeps history). Alternatives
considered — **Snooze** (implies auto-return, which we don't do), **Skip**
(sounds one-off), **Hide**/**Pause**/**Exclude** (workable but vaguer). This
doc uses **Mute** / **Unmute** throughout; the global admin action is
**Archive** / **Restore**.

### Per-user question state (what each account stores)

Two things, both living in that account's `user_states` document:

1. **SRS review state** — already exists (`reviews[questionId]`): last rating,
   `nextReviewDate`, `reviewCount`, `mastered`. This is what drives
   scheduled / due / mastered per user.
2. **Muted set** — new: a sparse list of question ids the user has muted
   (`mutedQuestionIds: string[]`). Opt-out, not opt-in: questions are active
   for everyone by default, so we only store the exceptions. This avoids
   touching every user's document whenever an admin adds a new question.

### Global question status (admin-owned, on the question doc)

- `status: 'active' | 'archived'`. `active` is the default for new questions.
- Archiving is a soft, reversible hide — the document and everyone's per-user
  state are retained, so Restore brings it back exactly as it was.
- Hard-delete is separate and permanent (see caveats for cascade handling).

### Precedence & visibility rules

1. **Global archive wins over everything.** An `archived` question is invisible
   to non-admins regardless of any personal state. Admins still see archived
   questions in the library, badged `Archived`.
2. **Mute is preserved across archive/restore.** If a user muted a question and
   an admin archives then restores it, the user's mute still applies — we never
   silently clear a personal preference.
3. **Session & due selection exclude both.** `filterQuestionsByMode`,
   `selectSessionQuestions`, and `dueCountForMode` must drop `archived`
   (global) and `mutedQuestionIds` (personal) before building a session or
   counting "due". Muting a currently-due question immediately lowers the due
   count.
4. **Library visibility differs by control.** Muted questions still show in the
   library for that user (marked `Muted`, with an Unmute action) so they're
   discoverable again; archived questions are removed from non-admin views.
5. **New content defaults to in-rotation.** A newly added question is `active`
   globally and un-muted for everyone (because absence from the muted set =
   active).

### Caveats & edge cases to decide up front

These are the sharp edges this two-axis model introduces. Each needs an
explicit decision, not a default-by-accident:

- **Stats & mastery skew.** Should muted / archived questions count toward
  "Total answered", "Mastered", topic-progress denominators, and weak-topic
  detection? Recommended: keep *historical* counts (answers already given), but
  compute "due", topic-progress %, and weak-topics over **currently-active,
  un-muted** questions only — otherwise muting a weak topic would falsely
  "improve" your stats, and archiving would retroactively rewrite history.
- **Empty rotation.** A user can mute (or an admin can archive) enough that a
  practice mode has zero available questions. Need a dedicated empty state
  ("You've muted every question in this topic — Unmute some?") distinct from
  "all caught up for today".
- **Orphaned per-user state.** Review state and muted ids are keyed by question
  id. On **hard-delete**, those entries become orphans. Decide: cascade-remove
  them from every `user_states` doc (clean but heavy, N writes), or leave them
  and ignore ids that no longer resolve (cheap, self-healing, mild cruft).
  Recommended: leave-and-ignore, with an occasional cleanup job.
- **Id/slug stability.** Muted ids and reviews break if a question's id
  changes. Verified: the current `PUT /api/questions/[id]` handler only
  accepts `title`/`hint`/`answer` — the slug is already immutable through the
  API today. Keep it that way as the admin-edit surface grows (topic/
  difficulty edits are fine to add; a slug-editing field is not).
- **Content edits vs existing SRS history.** If an admin substantially rewrites
  a question, a user's `mastered=true` may no longer be truthful. Decide
  whether a "significant edit" optionally resets SRS for that question (e.g. an
  admin "reset schedules" checkbox) or never touches user state (default).
- **Topic/difficulty re-bucketing.** Admin changing `subcategory`/`difficulty`
  retroactively moves a question between users' topic stats and can change
  which practice modes include it. Acceptable, but note it — a mastered JS
  question moved to TS will shift both topics' numbers.
- **Bulk import resurrecting archived questions.** The existing upsert-by-slug
  `POST /api/questions` must **preserve `status`** on update (don't silently
  un-archive an archived question just because it appears in an import batch).
- **Admin double-action confusion.** The UI must render Mute (personal) and
  Archive (global) as visibly distinct actions, and confirm the global one
  ("Archive for all users?") so an admin never nukes a question for everyone
  when they meant to hide it from themselves.
- **Visitor → account merge.** Visitors keep muted ids + local SRS in
  `localStorage`. The post-login merge must fold both the local `reviews` and
  local muted set into the account, resolving conflicts (recommended:
  most-recent-review wins; union of muted ids).
- **Concurrent writes.** Mute/unmute mutates the whole `user_states` blob (same
  pattern as ratings) — it inherits the P0 "concurrent writes clobber" caveat
  in `todo.md`. A rapid mute-toggle from two tabs needs the same version guard.
- **Reminders/streak honesty.** "Due today" nudges and streak-risk reminders
  must respect the muted/archived filters, or a user who muted everything gets
  nagged about a session that has zero real questions.

---

## Architecture review

Verdict: **the plan is sound and doable as-is** — it's a standard OAuth
Authorization Code flow + cookie session + RBAC-on-server pattern, and it
fits cleanly on top of the existing Nitro/MongoDB stack (no new
infrastructure, no new hosting requirements). Verified against the current
code:

- `questions.slug` already has a **unique index**, and the existing
  `PUT /api/questions/[id]` handler only ever mutates `title`/`hint`/`answer`
  — the slug/`id` is **already immutable** through the API today. The
  "id stability" caveat isn't a future risk to design around; it's a rule to
  *keep true* when the admin-edit surface grows (never add a slug-editing
  field).
- `user_states` already has a **unique index on `userId`**, and
  `getUserState`/`saveUserState` are already parameterized by `userId` — the
  re-key from "one static id" to "one id per account" is a config/call-site
  change, not a schema rewrite.

Four refinements over the original draft, applied below:

1. **Use h3's built-in `useSession()` instead of hand-rolled JWT/HMAC.** Nitro
   ships with `h3`, and `h3` already provides `useSession()` — sealed
   (encrypted **and** signed), HttpOnly cookies backed by a `password` secret,
   with no extra dependency. This is still fully self-built (no auth
   library/SaaS on top of our own routes — we're not pulling in something
   like `next-auth` or `nuxt-auth-utils`), it just avoids reimplementing
   cookie crypto by hand, which is exactly the kind of code you don't want to
   get subtly wrong.
2. **Store only `userId` in the session, never `role`.** If the cookie caches
   `role` and an admin later demotes/removes that account, the cached role
   stays valid until the cookie expires — a stale-privilege bug. Instead the
   session holds identity only; `role` is read fresh from `users` on each
   request that needs it (see below). One indexed point-lookup on a tiny
   collection is cheap and always correct.
3. **Resolve role lazily inside `requireUser`/`requireAdmin`, not eagerly in
   global middleware.** The auth middleware's only job is to verify the
   session cookie and attach `event.context.auth = { userId } | null` — no DB
   call for every asset/page/public request. The `users` lookup (to get
   `role`) happens only inside the RBAC helpers, i.e. only on routes that
   actually require `user`/`admin`. Public routes (`GET /api/questions`,
   pages) never pay for it.
4. **Drop the `GET /user/emails` GitHub call.** Bootstrap-admin matching uses
   GitHub **login**, not email, and no planned feature needs a verified
   email address. Fetching only `GET /user` keeps the OAuth scope minimal
   (default read-only profile access — no extra scope to request or explain
   to users).

CSRF note: cookies are `SameSite=Lax`, which already blocks the cookie from
being attached to cross-site `POST`/`PUT`/`PATCH`/`DELETE` requests (Lax only
sends cookies on top-level, same-site navigations and cross-site *GET*). That
is sufficient CSRF protection for this app's mutation routes — no separate
CSRF token needed. This is a deliberate decision, not a gap.

---

## Authentication (self-built GitHub OAuth)

No auth library/service. Implement the OAuth Authorization Code flow directly
against GitHub ourselves, using h3's built-in sealed-cookie session (see
"Architecture review" above) to avoid hand-rolling cookie crypto.

### Flow

```
Browser                    Our server (Nitro)                 GitHub
   │                              │                              │
   │  click "Sign in"             │                              │
   │  GET /api/auth/github ──────►│  redirect w/ state cookie ──►│  consent
   │                              │                              │
   │  ◄──────────── redirect back to /api/auth/github/callback?code&state
   │                              │                              │
   │                              │  verify state                │
   │                              │  POST /login/oauth/access_token ─► token
   │                              │  GET /user ────────────────────────► profile
   │                              │  upsert users doc (login, name, avatar)
   │                              │  session = useSession(event) → set userId
   │  ◄─── redirect to / ─────────┤                              │
```

### Server routes (new, under `server/api/auth/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/github` | GET | Generate `state`, set short-lived state cookie, redirect to GitHub authorize URL. |
| `/api/auth/github/callback` | GET | Validate `state`, exchange `code` → access token, fetch GitHub profile (`GET /user` only), upsert `users`, seal the session with `{ userId }`, redirect home. |
| `/api/auth/me` | GET | Resolve the session's `userId` → look up `users` → return `{ id, login, name, avatarUrl, role }` (or `null` for visitor). Drives client role state. |
| `/api/auth/logout` | POST | Clear the session (`clearSession`). |

### Session handling (h3 `useSession`, not hand-rolled)

- `useSession(event, { password: config.authSessionSecret, maxAge })` seals
  `{ userId }` into an encrypted + signed, **HttpOnly, Secure, SameSite=Lax**
  cookie. `AUTH_SESSION_SECRET` becomes that `password` (≥32 chars).
- `server/middleware/auth.ts` calls `useSession` on every request and
  attaches `event.context.auth = { userId } | null`. It does **not** look up
  the user or role — that's cheap on purpose.
- `requireUser(event)` / `requireAdmin(event)` (a small RBAC helper) read
  `event.context.auth`, fetch the `users` doc by `userId`, and throw
  `401`/`403` if missing/insufficient. This is the single source of truth for
  role — never trust anything sent by the client.

### Role assignment

- New accounts default to `role: 'user'`.
- Bootstrap admins from an allowlist env var, e.g.
  `ADMIN_GITHUB_LOGINS=ainga` — matching GitHub logins are upserted as
  `admin`. After bootstrap, admins can promote others via `/admin/users`.

---

## Data model changes

### New `users` collection

```ts
interface UserDocument {
  _id: ObjectId
  githubId: number          // GitHub numeric id (stable identity)
  login: string             // GitHub username
  name?: string
  avatarUrl?: string
  role: 'user' | 'admin'
  createdAt: Date
  lastLoginAt: Date
}
```

Unique index on `githubId` (upsert key on every login) — the collection is
small, so no other indexes are needed.

### `questions` — add global status

```ts
interface QuestionDocument {
  // ...existing content fields (title, subcategory, difficulty, hint, answer, tags)...
  id: string                 // stable SRS key — MUST be immutable (see caveats)
  status: 'active' | 'archived'   // NEW — admin-owned global visibility
  archivedAt?: Date          // NEW
  archivedBy?: string        // NEW — admin userId
}
```

Existing questions backfill to `status: 'active'`.

### `user_states` — re-key by account + add muted set

- Today: one document keyed by the `APP_USER_ID` env var.
- New: one document **per user**, keyed by the `users._id` (or `githubId`).
- Add `mutedQuestionIds: string[]` to `AppState` (sparse personal opt-out
  list; empty by default). `reviews` (per-user SRS state) already exists and
  stays as-is.
- `getUserState` / `saveUserState` take the authenticated `userId` from
  `event.context.auth` instead of `config.appUserId`.
- **Migration:** move the existing single `APP_USER_ID` document to the first
  bootstrapped admin account so current progress isn't lost; initialize
  `mutedQuestionIds: []`.

### New env vars

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client id |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `AUTH_SESSION_SECRET` | Password for h3's `useSession` (seals/unseals the session cookie); ≥32 random chars |
| `ADMIN_GITHUB_LOGINS` | Comma-separated GitHub logins bootstrapped as admin |

`APP_USER_ID` is retired after migration.

---

## Access-control enforcement

Enforce on the **server** (source of truth); mirror on the client for UX only.

### Server (authoritative)

- `server/middleware/auth.ts` — verify the sealed session cookie, populate
  `event.context.auth = { userId } | null`. No DB call here (see
  "Architecture review").
- A small RBAC helper, e.g. `requireUser(event)` and `requireAdmin(event)`,
  that resolves `role` from `users` by `userId` and throws `401`/`403` when
  the context doesn't satisfy the requirement.
- Apply to existing routes:

  | Route | Method | Required role |
  |---|---|---|
  | `/api/questions` | GET | any (incl. visitor) |
  | `/api/questions/[id]` | GET | any |
  | `/api/questions` | POST | **admin** (create/edit content) |
  | `/api/questions/[id]` | PUT | **admin** (edit content) |
  | `/api/questions/[id]` | PATCH (new) | **admin** (archive/restore — global `status`) |
  | `/api/questions/[id]` | DELETE (new) | **admin** (hard-delete) |
  | `/api/state` | GET / PUT | **user or admin** (own state only — incl. `reviews` + `mutedQuestionIds`) |
  | `/api/admin/users*` (new) | any | **admin** |

> Personal **Mute/Unmute** needs **no new route**: it's just an edit to the
> caller's own `mutedQuestionIds` inside their `user_states`, saved via the
> existing `PUT /api/state`. Only global **Archive** touches the shared
> `questions` collection and is therefore admin-gated.

### Client (UX only)

- A `useAuth()` composable exposing `user`, `role`, `isVisitor`, `isUser`,
  `isAdmin`, sourced from `/api/auth/me`.
- Nav (`AppNavDrawer`) hides entries the role can't use (Statistics/Settings
  for visitors; Add Questions & `/admin/*` for non-admins).
- Route middleware redirects unauthenticated users away from `/statistics`,
  `/settings`, and `/admin/*`, and non-admins away from `/admin/*`.
- Hide the "Add Questions" button and per-question "Edit"/"Delete" controls
  unless `isAdmin`.

---

## Implementation phases

1. **Auth core** — GitHub OAuth routes, session cookie, `users` collection,
   `auth` middleware, `/api/auth/me`, `useAuth()` composable, login/logout UI.
2. **Re-key progress** — switch `user_states` to per-account; migrate the
   existing `APP_USER_ID` document to the bootstrap admin.
3. **RBAC on APIs** — add `requireUser`/`requireAdmin`; lock question mutations
   to admin and state to the owning account.
4. **Client gating** — role-aware nav, route middleware, hide admin-only
   controls; visitor local-progress + post-login merge prompt.
5. **Question state** — add `status` to `questions` + `mutedQuestionIds` to
   `AppState`; personal Mute/Unmute (via `PUT /api/state`) and admin
   Archive/Restore (`PATCH /api/questions/[id]`); update
   `filterQuestionsByMode` / `selectSessionQuestions` / `dueCountForMode` to
   exclude archived + muted; library badges (`Muted`, `Archived`) and empty
   states. Decide the caveats above (stats scope, orphan handling, id
   immutability) before building.
6. **User management** — `/admin/users` page and `/api/admin/users*` routes.
