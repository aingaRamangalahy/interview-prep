# Interview Prep App — Implementation Todo

Based on [spec.md](./spec.md). MVP is frontend-only: Nuxt Content for questions, local storage for progress and spaced repetition.

---

## Phase 1 — Project foundation

- [x] Scaffold Nuxt 4 app (Vue 3, TypeScript)
- [x] Install and configure Nuxt UI
- [x] Install and configure `@nuxt/content`
- [x] Set up dark-mode-first theme (Linear / Raycast-inspired: neutral palette, rounded cards, subtle shadows)
- [x] Define shared types (`Question`, `Category`, `Difficulty`, `Rating`, `ReviewState`, `PracticeMode`)
- [x] Configure app layout shell (desktop sidebar + mobile bottom nav)
- [x] Add routes: Dashboard, Practice, Questions, Statistics, Settings

---

## Phase 2 — Question content (Nuxt Content)

- [x] Define content collection schema for questions (frontmatter: `title`, `category`, `subcategory`, `difficulty`, `hint`, `tags`, optional `source`, `notes`)
- [x] Create folder structure: `content/questions/{javascript,typescript,vue,angular,node,problem-solving,behavioral,communication,career}/`
- [x] Add a few placeholder `.md` files per topic (enough to test UI — full bank added manually later)
- [x] Build composable to load and normalize questions from Nuxt Content
- [x] Use `_path` or filename stem as stable question `id` for SRS keys

---

## Phase 3 — Spaced repetition engine

- [x] Implement local persistence layer (`localStorage` or IndexedDB) for review state
- [x] Store per question: last rating, next review date, review count, mastered flag
- [x] Implement interval logic:
  - Again → tomorrow
  - Hard → 3 days
  - Good → 7 days
  - Easy → 21 days
- [x] Build session selector: pick 5 due questions (default), respect practice mode filters
- [x] Handle new questions (never reviewed) in selection pool
- [x] Cap daily focus at 5 questions; allow optional extra reviews later (UX: "Today's Focus: 5 Questions")

---

## Phase 4 — Practice flow

- [x] **Practice mode picker** — Mixed, Technical Only, Non-Technical Only, per-category (JS, TS, Vue, Angular, Node, Problem Solving), Custom (multi-select)
- [x] **Question screen** — distraction-free: progress (e.g. 2/5), category, difficulty, question text, Show Hint, Reveal Answer
- [x] Render ideal answer from Markdown body after reveal
- [x] **Self-evaluation** — four ratings: Easy, Good, Hard, Again (with labels from spec)
- [x] Persist rating and schedule next review on each answer
- [x] **Session complete screen** — questions count, average confidence, time spent, next review hint, streak message
- [x] Track session start/end time for duration display

---

## Phase 5 — Dashboard

- [x] Greeting + current streak
- [x] Today's review card (5 questions, estimated time, Start button)
- [x] Weak topics list (derived from lowest average confidence / most Again ratings)
- [x] Per-topic progress bars (e.g. JavaScript 90%, Vue 82%)
- [x] Keep layout minimal — no clutter

---

## Phase 6 — Questions library

- [x] List all questions from Nuxt Content with SRS status overlay
- [x] Search by title / tags
- [x] Filters: category, subcategory, difficulty, status (due today, mastered, new)
- [x] Link each question to read-only detail view (question, hint, answer)
- [x] MVP: editing = edit Markdown in repo (defer in-app edit/delete/archive)

---

## Phase 7 — Statistics

- [x] Total questions answered
- [x] Current streak + longest streak
- [x] Questions mastered count
- [x] Weakest topics
- [x] Average confidence (from ratings)
- [x] Questions answered this week / this month
- [x] Review backlog count (available on demand, not as primary dashboard pressure)

---

## Phase 8 — Settings

- [x] Default session size (default: 5)
- [x] Default practice mode
- [x] Export / import review state (backup local progress)
- [x] Reset progress (with confirmation)

---

## Phase 9 — UX polish

- [x] **Keyboard shortcuts** — Space (reveal), 1–4 (ratings), N (next)
- [x] **Focus mode** during practice — hide nav; show only question, answer, rating buttons
- [x] Responsive layout — desktop-first, usable on mobile
- [x] Empty states (no questions due, no questions in filter, first visit)
- [x] Loading states for content queries
- [x] Satisfying session-complete moment (minimal animation OK)

---

## Phase 10 — Content (ongoing, manual)

Add questions over time as Markdown files. One file per question; use spec samples as starting ideas:

- [x] JavaScript (placeholders)
- [x] TypeScript (placeholders)
- [x] Vue (placeholders)
- [x] Angular (placeholders)
- [x] Node.js (placeholders)
- [x] Problem Solving (placeholders)
- [x] Behavioral (placeholders)
- [x] Communication (placeholders)
- [x] Career (placeholders)

---

## Out of scope for MVP

Defer until after daily practice loop works end-to-end:

- Backend, database, auth, sync
- In-app add/edit/delete/archive questions
- AI follow-up questions, voice mode, mock interviews
- Flashcards, whiteboard mode, company packs
- Bulk import, GitHub import, AI-generated questions
- Favorites, bookmarks, interview countdown, heatmap, weekly reports

---

## Definition of done (MVP)

- [x] Can open app, start today's 5-question session in under one click
- [x] Questions load from Nuxt Content; progress persists locally across reloads
- [x] Ratings update spaced repetition schedules correctly
- [x] Dashboard shows streak, weak topics, and topic progress
- [x] Any practice mode / custom topic combo works
- [x] Full session (question → hint → answer → rate → complete) works with keyboard
- [x] Session consistently feels completable in ~10–15 minutes
