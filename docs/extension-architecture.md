# Browser Extension — Architecture Brainstorm

## What we're building

A Chrome/Firefox "new tab" extension like daily.dev:

- Every time the user opens a new tab → they see 5 interview flash cards
- Phase 1: JavaScript questions only, progress in `chrome.storage.local`
- Phase 2: optional GitHub login → sync with the SaaS at `interview.ainga.me`

---

## Should it live in the same repo?

**Yes — monorepo. Here's why.**

The extension and the SaaS share a lot:

- Question types (`Question`, `UserState`, difficulty levels…)
- Question data (same JSON/DB content)
- UI components (flash card design, rating buttons, progress bar)
- Business logic (streak calculation, spaced repetition score…)

Keeping two separate repos means copying or duplicating all of that. The monorepo lets you import from a shared `packages/` workspace and evolve both surfaces in lock-step.

You already have `pnpm-workspace.yaml` — this is already set up for a monorepo.

---



## Proposed structure

```
interview-prep/                   ← root workspace
├── app/                          ← existing Nuxt SaaS (interview.ainga.me)
├── extension/                    ← NEW — browser extension
│   ├── entrypoints/
│   │   ├── newtab/               ← the new-tab page (main surface)
│   │   │   ├── index.html
│   │   │   └── App.vue
│   │   └── background.ts         ← optional: alarm for streak reminders
│   ├── components/               ← extension-specific UI
│   ├── composables/
│   │   └── useStorage.ts         ← wraps chrome.storage.local
│   └── wxt.config.ts
├── packages/
│   └── shared/                   ← NEW — shared between app + extension
│       ├── types/
│       │   └── index.ts          ← Question, UserState, Difficulty…
│       └── questions/
│           └── javascript.ts     ← hardcoded seed questions (Phase 1)
├── pnpm-workspace.yaml           ← already exists, add packages/*
└── package.json
```

---



## Tool: WXT (Web Extension Tools)

The recommended framework for the extension layer is **[WXT](https://wxt.dev)**.

Why WXT over raw Vite or CRX:

- Built on Vite — same mental model as Nuxt
- First-class Vue 3 support
- Hot Module Replacement during development (huge DX win)
- Auto-generates and validates `manifest.json` from `wxt.config.ts`
- Handles Manifest V3 (Chrome) and MV2 (Firefox) with one codebase
- Built-in `storage` helper that abstracts `chrome.storage` / `browser.storage`
- `wxt build` → production zip ready to submit to stores

```bash
# Inside extension/
pnpm add -D wxt
```

---



## Phase 1 — Fully offline extension

```
Extension storage: chrome.storage.local
Question source:   bundled JSON (packages/shared/questions/javascript.ts)
Auth:              none
API calls:         none
```

The extension is completely self-contained. No network dependency.

```ts
// composables/useStorage.ts
import { storage } from 'wxt/storage'

export const useProgress = () => {
  const progress = storage.defineItem<Record<string, number>>(
    'local:progress',
    { defaultValue: {} }
  )
  return { progress }
}
```

State persisted per-question (seen count, last rating, streak days).

---



## Phase 2 — Optional SaaS sync

When the SaaS launches with GitHub auth, the extension adds an optional "Connect account" flow:

```
Extension                          SaaS API (interview.ainga.me)
   │                                        │
   │── POST /api/auth/extension-token ──────►  user logs in via popup
   │◄─ { token, userId } ─────────────────── 
   │
   │── GET  /api/questions ───────────────►  fetch personalized questions
   │── POST /api/progress  ───────────────►  sync local progress to DB
```

Key design decisions for this phase:

- Auth via **OAuth popup** (`chrome.identity.launchWebAuthFlow`) — user stays in browser, no separate window
- Token stored in `chrome.storage.local` (never accessible to page scripts)
- Sync is **optional** — extension still works 100% offline if not connected
- Progress merges: local state wins if newer timestamp

---



## Sharing types between app and extension

```ts
// packages/shared/types/index.ts
export interface Question {
  id: string
  slug: string
  title: string
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
}

export interface UserProgress {
  questionId: string
  rating: 1 | 2 | 3 | 4 | 5
  seenCount: number
  lastSeenAt: string
}
```

Both `app/` and `extension/` import from `@interview-prep/shared`:

```json
// packages/shared/package.json
{
  "name": "@interview-prep/shared",
  "exports": { ".": "./src/index.ts" }
}
```

```ts
// app/composables/useQuestions.ts  (existing file — add import)
import type { Question } from '@interview-prep/shared'

// extension/composables/useFlashCards.ts
import type { Question } from '@interview-prep/shared'
```

---



## Extension UI structure (new tab page)

```
┌─────────────────────────────────────────────────────┐
│  FlashTab                [streak: 7 🔥]  [settings] │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Question 3 / 5                      [MEDIUM]      │
│   ─────────────────────────────────────────────     │
│   What is the difference between                    │
│   `==` and `===` in JavaScript?                     │
│                                                     │
│                     [ Reveal answer ]               │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [ 😕 Hard ]  [ 🤔 Unsure ]  [ 😌 Easy ]  [ ✓ Got it ]  │
└─────────────────────────────────────────────────────┘
```

---



## Development workflow

```bash
# Dev (with HMR — loads extension in Chrome automatically)
cd extension
pnpm dev

# Build for production
pnpm build

# Package as .zip for Chrome Web Store / Firefox AMO
pnpm zip
```

```bash
# Run both app + extension in watch mode from root
pnpm --filter app dev
pnpm --filter extension dev
```

---



## Store distribution plan


| Store            | Format | Review time      |
| ---------------- | ------ | ---------------- |
| Chrome Web Store | `.zip` | 1-3 days         |
| Firefox Add-ons  | `.zip` | 1-7 days         |
| Edge Add-ons     | `.zip` | auto from Chrome |


WXT's `pnpm zip` command creates the right artifact for each store.

---



## Evolution path summary

```
Phase 1 (now)
  extension/  →  bundled questions + chrome.storage  →  no backend needed

Phase 2 (SaaS live)
  extension/  →  optional login  →  sync to interview.ainga.me API
  app/        →  accounts, more languages, custom decks, analytics

Phase 3 (growth)
  extension/  →  personalized deck from API  →  streak emails  →  leaderboard
```

The monorepo structure means **each phase is an additive change**, never a rewrite.

---



## Quick start checklist

- [x] Add `packages/*` to `pnpm-workspace.yaml`
- [x] Create `packages/shared/` with shared types
- [x] Scaffold WXT Vue extension in `extension/`
- [x] Bundle JavaScript questions in `packages/shared/src/questions/javascript.ts`
- [x] Build the new-tab `App.vue` with flash card UI + `chrome.storage.local`
- [ ] Register extension in Chrome → `chrome://extensions` → Load unpacked → `extension/.output/chrome-mv3`
