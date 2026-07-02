---
title: 'Predict the output: event loop ordering with sync code, Promises, and setTimeout'
category: technical
subcategory: javascript
difficulty: hard
hint: Sync first, then drain microtasks, then macrotasks.
tags: [event-loop, async]
source: sudheerj/javascript-interview-questions
---

What prints and in what order?

```javascript
console.log('A')

setTimeout(() => console.log('B'), 0)

Promise.resolve()
  .then(() => console.log('C'))
  .then(() => console.log('D'))

console.log('E')
```

**Answer: A → E → C → D → B**

**Step by step**

1. **Sync phase (call stack):** `A`, schedule macrotask `B`, schedule microtasks for Promise chain, `E`.
2. **Microtask drain:** First `.then` runs → `C`. That schedules another microtask → `D`.
3. **Microtask drain continues:** `D` runs.
4. **Macrotask:** `setTimeout` callback → `B`.

**Rules to remember**

- Synchronous code always runs first.
- The microtask queue is **fully drained** before the next macrotask.
- New microtasks scheduled during microtask processing run in the **same turn**.
- `setTimeout(fn, 0)` is not instant — it waits for the stack to clear **and** all microtasks.

**Variant trap:** If the second `.then` did `setTimeout(() => log('F'), 0)`, `F` would print after `B` because it is scheduled in a later macrotask turn.
