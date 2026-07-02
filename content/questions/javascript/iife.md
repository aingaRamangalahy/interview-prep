---
title: What is an IIFE and why was it used before ES modules?
category: technical
subcategory: javascript
difficulty: medium
hint: (function () { ... })() — run immediately, create a private scope.
tags: [scope, modules]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

An **IIFE** (Immediately Invoked Function Expression) is a function that is **defined and executed right away**, creating a private scope.

```javascript
(function () {
  const secret = 42
  // variables here don't leak to global scope
})()

// secret is not accessible here
```

**Syntax variants**

```javascript
(function () { /* ... */ })()
;(function () { /* ... */ }()) // alternative grouping

// Arrow IIFE (cannot use for `new` patterns)
(() => { /* ... */ })()
```

**Why it was common pre-ES modules**

- **Avoid global pollution** — wrap scripts so internals stay private.
- **Module pattern** — return a public API from the IIFE while keeping state in closure:

```javascript
const counter = (function () {
  let count = 0
  return {
    increment() { return ++count },
    get() { return count }
  }
})()
```

**Today:** ES modules (`import` / `export`) provide native file-level scope. IIFEs are still useful for one-off isolation, legacy bundles, and some build-tool patterns, but modules are the standard approach.
