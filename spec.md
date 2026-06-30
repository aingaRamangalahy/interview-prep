# Interview Prep App – Product Specification (spec.md)

## Vision

Build a personal interview preparation application designed for daily practice using spaced repetition.

The application is **not a learning platform**. It is a daily training system that helps me retain knowledge, identify weaknesses, and become interview-ready.

The experience should feel similar to opening Duolingo every day:

* open app
* answer today's questions
* rate confidence
* finish in 10–15 minutes
* come back tomorrow

The application must prioritize **consistency over volume**.

---

# Goals

## Primary Goals

* Practice every day.
* Remember concepts long-term using spaced repetition.
* Quickly identify weak areas.
* Simulate real interview thinking.
* Keep sessions short enough that skipping is difficult.

---

## Secondary Goals

* Track progress.
* Build confidence.
* Reduce interview anxiety.
* Discover forgotten concepts.
* Create my own question database over time (starting from Nuxt Content markdown files, expanded manually).

---

# User

Single user.

Software engineer with experience in:

* JavaScript
* TypeScript
* Vue
* Angular
* Node.js

Also wants to practice:

* Behavioral interviews
* Communication
* Problem solving
* System thinking

---

# Question Categories

## Technical

### JavaScript

Examples

* Event loop
* Closures
* Hoisting
* Promises
* Async/Await
* Memory
* this
* Prototype
* Functional programming
* Browser APIs

---

### TypeScript

Examples

* Generics
* Utility types
* Type inference
* Mapped types
* Conditional types
* Declaration merging
* Interfaces vs Types

---

### Vue

Examples

* Reactivity
* Composition API
* Pinia
* Routing
* Performance
* Lifecycle
* SSR
* Nuxt
* Component architecture

---

### Angular

Examples

* Dependency Injection
* Signals
* RxJS
* Change Detection
* Standalone Components
* Routing
* Services
* Forms

---

### Node.js

Examples

* Event loop
* Streams
* Buffers
* Express
* Fastify
* Authentication
* Scaling
* Performance
* Security

---

### Problem Solving

Examples

* Algorithms
* Data Structures
* Debugging
* Code reading
* Refactoring
* API design

---

## Non Technical

### Behavioral

Examples

* Tell me about yourself.
* Biggest challenge.
* Conflict.
* Leadership.
* Failure.
* Success.
* Difficult coworker.

---

### Communication

Examples

* Explain a complex topic simply.
* Explain architecture.
* Teach a junior developer.
* Describe a project.

---

### Career

Examples

* Why this company?
* Why leave your current company?
* Salary expectations.
* Career goals.

---

# Question Data (MVP)

For the initial version, **questions are stored with [Nuxt Content](https://content.nuxt.com/)** — one Markdown file per question under `content/questions/`. There is **no backend** for v1.

The full question bank will be added manually over time. Do **not** pre-populate a large question set during development; use the samples below as placeholders.

## Content structure

```
content/
  questions/
    javascript/
      hoisting.md
      event-loop.md
    typescript/
    vue/
    ...
```

Query at runtime with Nuxt Content (e.g. `queryCollection('questions')` or `queryContent('/questions')`).

## Frontmatter + body (example)

Metadata in frontmatter; ideal answer in the Markdown body.

```md
---
title: Explain the Event Loop. What happens when a Promise resolves?
category: technical
subcategory: javascript
difficulty: medium
hint: Think about call stack, microtasks, and macrotasks.
tags: []
---

Your ideal answer here — supports Markdown formatting.
```

Use `_path` or filename stem as stable `id` for spaced repetition keys.

## Sample questions (placeholders)

One sample per topic — add as `.md` files later; listed here for reference only.

### JavaScript

* **Easy:** What is hoisting in JavaScript?
* **Medium:** Explain the Event Loop. What happens when a Promise resolves?

### TypeScript

* **Easy:** What is the difference between `interface` and `type`?
* **Medium:** How do conditional types work? Give a simple example.

### Vue

* **Easy:** What is reactivity in Vue 3?
* **Medium:** When would you use the Composition API over the Options API?

### Angular

* **Easy:** What is dependency injection in Angular?
* **Medium:** How does Angular change detection work?

### Node.js

* **Easy:** What is the difference between `process.nextTick` and `setImmediate`?
* **Medium:** When would you use streams instead of loading a file into memory?

### Problem Solving

* **Easy:** How would you check if a linked list has a cycle?
* **Medium:** Walk through how you would debug a slow API endpoint.

### Behavioral

* **Easy:** Tell me about yourself.
* **Medium:** Describe a time you disagreed with a teammate. How did you handle it?

### Communication

* **Easy:** Explain what an API is to a non-technical stakeholder.
* **Medium:** How would you describe your current project's architecture in an interview?

### Career

* **Easy:** Why are you interested in this role?
* **Medium:** Where do you see yourself in three years?

---

# Difficulty

Every question has a difficulty.

* Easy
* Medium
* Hard

Difficulty only influences spaced repetition intervals.

---

# Daily Session

Default session = **5 questions**

Questions are selected by the spaced repetition engine.

Session duration:

10–15 minutes.

---

# Practice Modes

## Mixed

Questions from every category.

Example

* JavaScript
* Vue
* Behavioral
* Node
* Problem Solving

---

## Technical Only

Mix every technical category.

---

## Non Technical Only

Only behavioral and communication questions.

---

## JavaScript Only

---

## TypeScript Only

---

## Vue Only

---

## Angular Only

---

## Node Only

---

## Problem Solving Only

---

## Custom

Choose any combination.

Example

* Vue
* JavaScript
* Behavioral

or

* Node
* TypeScript

---

# Question Screen

The question screen should be distraction free.

```
Question 2 / 5

JavaScript

Medium

----------------------------------

Explain the Event Loop.

What happens when a Promise resolves?

----------------------------------

[ Show Hint ]

[ Reveal Answer ]

```

The user should always think before revealing the answer.

---

# Self Evaluation

After revealing the answer, the user rates how well they knew it.

Possible ratings:

🟢 Easy

"I knew it immediately."

---

🟡 Good

"I remembered after thinking."

---

🟠 Hard

"I struggled."

---

🔴 Again

"I didn't know."

---

These ratings determine the next review date.

---

# Spaced Repetition

Suggested intervals

Again

Tomorrow

Hard

3 days

Good

7 days

Easy

21 days

Questions answered incorrectly appear much sooner.

Questions mastered appear less often.

---

# Statistics

Track

* Total questions answered
* Current streak
* Longest streak
* Questions mastered
* Weakest topics
* Average confidence
* Questions answered this week
* Questions answered this month
* Review backlog

---

# Dashboard

Simple.

```
Good Morning 👋

🔥 17 Day Streak

Today's Review

5 Questions

Estimated Time

11 min

[ Start ]

-------------------------

Weak Topics

Angular
Node
Behavioral

-------------------------

Progress

JavaScript

█████████░ 90%

Vue

████████░░ 82%

Node

██████░░░░ 61%

```

No clutter.

---

# Navigation

Bottom navigation (mobile)

Desktop sidebar

Sections

* Dashboard
* Practice
* Questions
* Statistics
* Settings

---

# Questions Library

Searchable.

Filters

* Category
* Difficulty
* Status
* Due today
* Mastered
* New

Actions

* Edit
* Delete
* Archive

---

# Add Question

**MVP:** Add or edit questions as Markdown files in `content/questions/`. In-app create/edit can come later.

Fields

Category

Subcategory

Difficulty

Question

Hint

Ideal Answer

Tags

Source

Notes

---

# Session Complete

Display

```
🎉 Session Complete

5 Questions

Average Confidence

78%

Time

12 minutes

Next Review

Tomorrow

Keep your streak alive 🔥

```

---

# UI Principles

## Minimal

Lots of whitespace.

---

## Fast

No unnecessary animations.

---

## Keyboard Friendly

Everything should work with keyboard shortcuts.

Examples

Space

Reveal answer

1

Again

2

Hard

3

Good

4

Easy

N

Next

---

## Focus Mode

Hide everything except

* question
* answer
* rating buttons

No distractions.

---

## Responsive

Desktop-first.

Should also work beautifully on mobile.

---

# Visual Style

Inspired by

* Linear
* Raycast
* Notion
* GitHub

Characteristics

* Rounded cards
* Subtle shadows
* Neutral colors
* Excellent typography
* Smooth transitions
* Consistent spacing
* Dark mode first

---

# UX Principles

The app should never feel overwhelming.

Instead of showing:

> You have 183 reviews due.

Show:

> Today's Focus: 5 Questions

More reviews are always available if the user wants them.

Completion should feel satisfying.

---

# Future Features

* AI follow-up questions
* Voice interview mode
* Timed interview simulations
* Whiteboard/problem-solving mode
* Flashcards
* Company-specific interview packs
* Bulk import questions from external Markdown sources
* Import from GitHub repositories
* AI-generated questions from documentation
* Notes linked to questions
* Weekly progress reports
* Heatmap similar to GitHub contributions
* Mock interview mode with conversational AI
* Favorite questions
* Bookmark difficult questions
* Interview countdown mode

---

# Technical Stack

## MVP (v1)

Frontend only — no backend, database, or auth for the first version.

* Nuxt 4
* Vue 3
* TypeScript
* Nuxt UI
* **@nuxt/content** — questions as Markdown under `content/questions/` (see [Question Data (MVP)](#question-data-mvp))
* **Progress & spaced repetition:** persisted locally (e.g. `localStorage` or IndexedDB)

## Future (when needed)

* Backend (Node.js / TypeScript)
* Database (SQLite → PostgreSQL)
* ORM (e.g. Drizzle)
* Authentication (optional, single-user first)
* Sync across devices

---

# Definition of Success

The application succeeds if:

* I open it almost every day.
* Daily sessions consistently take less than 15 minutes.
* My interview confidence increases over time.
* Weak topics become visible and improve.
* I can practice any combination of topics in one click.
* Preparing for an interview becomes a habit instead of a last-minute effort.
