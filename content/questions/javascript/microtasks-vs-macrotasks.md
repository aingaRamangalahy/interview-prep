---
title: What are microtasks vs macrotasks in the event loop?
category: technical
subcategory: javascript
difficulty: hard
hint: Promises and queueMicrotask run before setTimeout — even if scheduled in the same tick.
tags: [event-loop, async, promises]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

The event loop processes work in **turns**. After each synchronous chunk of code (a macrotask), the engine **drains the entire microtask queue** before taking the next macrotask.

**Microtasks** (higher priority):

- Promise `.then` / `.catch` / `.finally`
- `await` continuations
- `queueMicrotask()`
- `MutationObserver` callbacks

**Macrotasks** (task queue):

- `setTimeout` / `setInterval`
- I/O callbacks (Node.js)
- UI rendering (browser)

```javascript
console.log('1')

setTimeout(() => console.log('2'), 0)

Promise.resolve().then(() => console.log('3'))

console.log('4')

// Output: 1, 4, 3, 2
```

**Order per turn:**

1. Run current macrotask (sync code) on the call stack.
2. Drain **all** microtasks (new microtasks scheduled during draining also run in this phase).
3. Optionally render (browser).
4. Dequeue next macrotask.

This is why resolved Promises always beat `setTimeout(..., 0)` scheduled in the same synchronous block.
