---
title: What are Promises and what are their three states?
category: technical
subcategory: javascript
difficulty: medium
hint: A Promise is a future value wrapper — pending until settled, then immutable.
tags: [async, promises]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

A **Promise** is an object representing the eventual result of an asynchronous operation. It provides a structured alternative to callback pyramids.

**Three states:**

| State | Meaning |
|---|---|
| **pending** | Initial state; neither fulfilled nor rejected |
| **fulfilled** | Operation succeeded; value is available |
| **rejected** | Operation failed; reason (error) is available |

Once settled (fulfilled or rejected), a Promise **cannot change state**.

```javascript
const p = fetch('/api/user')
  .then(res => res.json())
  .then(user => console.log(user.name))
  .catch(err => console.error(err))
  .finally(() => console.log('done'))
```

**Key rules (A+ / Promises spec)**

- `.then` / `.catch` / `.finally` return **new** Promises, enabling chaining.
- Handlers run as **microtasks**, after current sync code.
- Unhandled rejections can be silently lost — always attach `.catch` or use `try/catch` with `await`.

**Common static methods:** `Promise.all`, `Promise.race`, `Promise.allSettled`, `Promise.any`.
