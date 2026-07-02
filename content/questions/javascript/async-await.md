---
title: How do async and await work under the hood?
category: technical
subcategory: javascript
difficulty: medium
hint: async functions always return a Promise; await pauses via microtasks, not threads.
tags: [async, promises]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

`async` / `await` is **syntactic sugar over Promises**. It does not create new threads — it makes asynchronous code read like synchronous code while still being non-blocking.

```javascript
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error(res.statusText)
    return await res.json()
  } catch (err) {
    console.error(err)
    throw err // re-throw to reject the returned Promise
  }
}
```

**Under the hood**

1. An `async function` **always returns a Promise** — even if you `return 42`, callers get `Promise.resolve(42)`.
2. `await expression` **pauses** the async function until the Promise settles.
3. The continuation after `await` is scheduled as a **microtask**, not a new thread.
4. Errors thrown inside `async` reject the returned Promise; use `try/catch` for local handling.

**Parallel vs sequential**

```javascript
// Sequential — slower
const a = await fetchA()
const b = await fetchB()

// Parallel — start both, await together
const [a, b] = await Promise.all([fetchA(), fetchB()])
```

Interview tip: `await` only "blocks" the current async function, never the main thread or call stack.
