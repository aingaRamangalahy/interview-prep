---
title: What is memoization and how do closures enable it?
category: technical
subcategory: javascript
difficulty: medium
hint: Cache expensive pure function results keyed by arguments.
tags: [functional-programming, closures, performance]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Memoization** caches the results of expensive function calls and returns the cached value when the same inputs occur again. It only makes sense for **pure functions** (same input → same output, no side effects).

```javascript
function memoize(fn) {
  const cache = new Map()
  return function (...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

const fib = memoize(function fib(n) {
  if (n <= 1) return n
  return fib(n - 1) + fib(n - 2)
})
```

**Why closures matter:** The returned wrapper function closes over the `cache` object, keeping it private and persistent across calls without polluting global scope.

**Trade-offs**

- Memory grows with unique inputs — unbounded caches can leak memory.
- Key serialization (`JSON.stringify`) fails for non-serializable args or object key order edge cases.
- Best for CPU-heavy, repeatedly called pure functions (DOM diffing helpers, recursive algorithms, API response shaping).

Libraries like `memoize-one` only retain the last result for a lighter footprint.
