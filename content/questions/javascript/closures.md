---
title: What are closures in JavaScript? Give a practical use case.
category: technical
subcategory: javascript
difficulty: medium
hint: Think about a function that outlives the scope where it was created.
tags: [closures, scope, functions]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

A **closure** is a function bundled together with its lexical environment — the variables from the scope where it was declared. The inner function keeps access to outer variables even after the outer function has finished executing.

```javascript
function createCounter() {
  let count = 0
  return function () {
    count++
    return count
  }
}

const counter = createCounter()
counter() // 1
counter() // 2
```

**Why it matters in interviews**

- **Data privacy** — hide state without classes (module pattern, factory functions).
- **Partial application / currying** — capture fixed arguments for later calls.
- **Event handlers & callbacks** — retain context from the enclosing scope.

Closures are not a special syntax; they fall out of JavaScript's **lexical scoping** rules whenever a function references variables from an outer scope.
