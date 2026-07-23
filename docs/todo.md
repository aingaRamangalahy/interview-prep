# Usability Todo — making this a real daily habit

The MVP feature set in [plan.md](./plan.md) is done. Everything below is what's
actually missing to hit the goal in [spec.md](./spec.md): *"I open it almost
every day"* and *"preparing for an interview becomes a habit instead of a
last-minute effort."* Features alone don't get you there — reliability and
retention mechanics do. Grouped by priority; each item was verified against
the current code, not guessed.

---

## P0 — Reliability & data safety

The app is a single-user app deployed **publicly** at `interview.ainga.me`.
These are things that can silently lose or expose your only copy of your
progress.

- [ ] **Lock down the API.** `server/api/state/*` and `server/api/questions/*`
  have zero auth — anyone who finds the URL can read, overwrite, or wipe the
  one `user_states` document (`PUT /api/state`), or spam the question bank
  (`POST /api/questions`). At minimum, add a shared-secret header check (or
  Vercel Deployment Protection / basic auth) before this stays public.
- [ ] **Surface sync failures.** `useReviewState.persist()` swallows failed
  `PUT /api/state` calls with just a comment ("keep local state, retry on next
  change") — there's no retry and no visible indicator. If a request fails
  right before you close the tab, that session's ratings/streak never reach
  the DB and there's no sign anything went wrong. Add a small "sync failed"
  toast/badge with manual retry.
- [ ] **Automate backups.** MongoDB Atlas M0 has no automated backups (see
  `docs/deploy.md`); the only safety net today is the manual Export JSON
  button in Settings, which only helps if you remember to click it. Add a
  scheduled job (Vercel Cron hitting a small backup endpoint, or a periodic
  `mongodump`) that snapshots `user_states` regularly.
- [ ] **Handle concurrent writes.** State is a single blob written wholesale
  on every change (`saveUserState`), debounced per-tab. Two tabs/devices open
  at once means the last `PUT` silently clobbers the other's progress. Add a
  version/updatedAt check and reject or merge on conflict instead of blind
  overwrite.

---

## P1 — Habit formation (the actual "daily driver" loop)

Nothing today nudges you to come back — the app only helps once you've
already opened it.

- [ ] **Make it installable.** No `manifest.json`, icons, or service worker
  exist — the app can't be added to a phone home screen or desktop dock,
  which is the single biggest lever for "open it every day." Add a web app
  manifest + icon set (192/512, maskable) + minimal service worker.
- [ ] **Streak-at-risk reminder.** There's no notification of any kind. Once
  installable as a PWA, add a local notification ("Streak at risk — you
  haven't practiced today") scheduled client-side, or a scheduled push if a
  server-side subscription is wired up.
- [ ] **"Haven't practiced yet today" state.** The home page shows the streak
  count but nothing distinguishes "already done today" from "still need to
  practice." Add an explicit banner/state so reopening the app mid-day makes
  it obvious whether today's session is still pending.
- [ ] **Offline resilience.** `useQuestions`/`useReviewState` both hit the
  network on load with no fallback — a flaky connection or a cold Vercel
  function means a blank/stuck loading state instead of a session. Cache the
  last-fetched questions + state (localStorage/IndexedDB) and fall back to it
  when the API is unreachable.
- [ ] **Actually expose "extra practice."** `selectSessionQuestions` already
  supports padding a session with non-due questions via `includeExtra`, but
  no caller ever passes `true` — it's dead code. Once you clear your due
  queue there's no way to keep going without changing modes. Add a "Practice
  extra" button on `/practice` when `dueCount` is low.

---

## P1 — Content depth (this is what makes it actually useful for interviews)

- [ ] **Grow the question bank.** Per `spec.md`, questions are still
  "placeholders... added manually over time." With a handful of questions per
  subcategory, spaced repetition just cycles the same few questions — the
  opposite of the "come back tomorrow, feel like it's fresh" goal. This is
  the highest-leverage item for interview-prep value, even though it's
  content work rather than code.
- [ ] **"Review mistakes" mode.** No way to specifically drill questions
  you've rated `again`/`hard`, regardless of whether they're due yet. Useful
  right before an actual interview when you want to hammer weak spots on
  demand, not wait for the schedule.
- [ ] **Faster authoring loop.** Bulk JSON import already exists (nice), but
  writing good ideal-answer Markdown by hand is still the bottleneck to
  growing the bank. Worth a "generate a draft answer, then edit" assist step
  rather than starting from a blank textarea each time.

---

## P2 — Polish & growth

- [ ] **Finish the emoji → icon cleanup.** `RatingButtons`/session/statistics
  pages were already moved off emoji to colored icons; `practice/complete.vue`
  (🎉, 🔥) and the home page's streak line (🔥) still use raw emoji. Small,
  but inconsistent with the rest of the app now.
- [ ] **Add social/SEO metadata.** No `og:image`, no `apple-touch-icon`, no
  theme-color meta — link previews and "add to home screen" icons will look
  broken/default. Cheap to fix once the manifest work above happens.
- [ ] **Weekly/monthly recap.** Spec's "Future Features" already calls for
  this; a periodic summary (in-app banner is enough to start, email later)
  reinforces the habit loop beyond the daily streak number.
- [ ] **Extension ↔ web app sync.** `docs/extension-architecture.md` already
  designs "Phase 2: optional login, sync to interview.ainga.me" — the
  extension currently only writes to `chrome.storage.local` and never talks
  to this app. Until that's built, progress made via the new-tab extension
  and progress made on the web app are two disconnected histories.
- [ ] **Lightweight, privacy-friendly analytics.** No usage tracking exists
  at all, so there's no way to see whether "open it daily" is actually
  happening, or where people (you) drop off. A minimal, cookie-free tool
  (e.g. Plausible/Umami) would be enough to validate the habit-formation work
  above is actually working.
