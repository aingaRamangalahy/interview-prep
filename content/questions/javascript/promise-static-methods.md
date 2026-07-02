---
title: What is the difference between Promise.all, Promise.race, and Promise.allSettled?
category: technical
subcategory: javascript
difficulty: medium
hint: all = wait for all; race = first settled; allSettled = all outcomes regardless of failure.
tags: [async, promises]
source: sudheerj/javascript-interview-questions
---

These static Promise methods coordinate multiple async operations differently:

| Method | Resolves when | Rejects when | Result |
|---|---|---|---|
| **`Promise.all`** | All promises fulfill | **Any** promise rejects | Array of fulfilled values |
| **`Promise.race`** | **First** promise settles (fulfill or reject) | First rejection wins | First settled value/reason |
| **`Promise.allSettled`** | All promises settle (fulfill or reject) | Never rejects | Array of `{ status, value/reason }` |
| **`Promise.any`** | **First** fulfillment | All reject | First fulfilled value |

```javascript
const p1 = Promise.resolve(1)
const p2 = Promise.resolve(2)
const p3 = Promise.reject('fail')

await Promise.all([p1, p2])       // [1, 2]
await Promise.allSettled([p1, p3]) // [{status:'fulfilled',...}, {status:'rejected',...}]
await Promise.race([p1, p2])       // 1 (first to settle)
```

**Interview tips**

- Use `Promise.all` for parallel fetches where **one failure should fail everything**.
- Use `Promise.allSettled` when you need **every outcome** (e.g. batch API calls, partial success UI).
- Use `Promise.race` for **timeouts** or first-responder patterns.
- `Promise.all` short-circuits on first rejection — other promises still run but results are ignored.
