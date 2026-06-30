---
title: Explain the Event Loop. What happens when a Promise resolves?
category: technical
subcategory: javascript
difficulty: medium
hint: Think about call stack, microtasks, and macrotasks.
tags: []
---

The event loop coordinates the call stack, Web APIs, and task queues.

When a Promise resolves, its `.then` callback is queued as a **microtask**. Microtasks run after the current call stack is empty and before the next macrotask (e.g. `setTimeout`).

Order for one turn:
1. Run synchronous code on the call stack.
2. Drain all microtasks.
3. Render if needed.
4. Take the next macrotask.

So resolved Promises execute before timers scheduled in the same synchronous block.
