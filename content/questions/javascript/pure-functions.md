---
title: What is a pure function and why does it matter?
category: technical
subcategory: javascript
difficulty: medium
hint: Same inputs always produce same outputs; no side effects.
tags: [functional-programming]
source: sudheerj/javascript-interview-questions
---

A **pure function** satisfies two rules:

1. **Referential transparency** — given the same arguments, it always returns the same result.
2. **No side effects** — it does not mutate external state, I/O, DOM, globals, or arguments.

```javascript
// Pure
const add = (a, b) => a + b

// Impure — depends on external state
let tax = 0.1
const withTax = (price) => price * (1 + tax)

// Impure — mutates input
const pushItem = (arr, item) => { arr.push(item); return arr }
```

**Why interviewers care**

- **Predictable** — easier to test and reason about.
- **Cacheable** — enables **memoization**.
- **Parallel-safe** — no hidden shared state.
- **Works well with HOFs** — `map`, `filter`, `reduce` assume non-mutating callbacks.

Pure functions pair naturally with **immutability** patterns (spread, `map` instead of in-place mutation). Real apps need side effects at the boundaries — the functional style pushes impure I/O to the edges and keeps core logic pure.
