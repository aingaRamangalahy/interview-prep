---
title: Explain the event loop. What happens when a Promise resolves?
category: technical
subcategory: javascript
difficulty: medium
hint: Think about call stack, microtasks, and macrotasks.
tags: [event-loop, async, runtime]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

JavaScript is **single-threaded**: one **call stack** runs code at a time. The **event loop** coordinates the stack with async work handled by the host environment (browser Web APIs or Node.js libuv).

**Components (browser)**

- **Call stack** — currently executing functions.
- **Web APIs** — `setTimeout`, DOM events, `fetch` (run outside the JS thread).
- **Microtask queue** — Promise callbacks, `queueMicrotask`, `MutationObserver`.
- **Macrotask queue** — `setTimeout`/`setInterval` callbacks, I/O.

When a Promise resolves, its `.then` / `.catch` / `.finally` handlers are queued as **microtasks** — not run immediately.

**One event loop turn**

1. Execute synchronous code until the call stack is empty.
2. **Drain all microtasks** (including ones scheduled during draining).
3. Render UI if needed (browser).
4. Dequeue and run the next **macrotask**.

So a resolved Promise always runs before a `setTimeout(..., 0)` scheduled in the same synchronous block — microtasks have priority over macrotasks.
