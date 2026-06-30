---
title: What is the difference between process.nextTick and setImmediate?
category: technical
subcategory: node
difficulty: easy
hint: Event loop phases in Node.js.
tags: []
---

Both schedule callbacks asynchronously but at different phases:

**process.nextTick**
- Runs before the event loop continues.
- Executes after current operation, before I/O callbacks.
- Can starve I/O if used recursively.

**setImmediate**
- Runs in the check phase of the event loop.
- After I/O callbacks, before timers in many cases.

Rule of thumb: use `setImmediate` for deferring work to the next event loop iteration; use `nextTick` when you need to run before any I/O callbacks.
