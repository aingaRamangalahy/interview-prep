---
title: What is currying in JavaScript? When is it useful?
category: technical
subcategory: javascript
difficulty: hard
hint: Transform f(a, b, c) into f(a)(b)(c) — one argument per function call.
tags: [functional-programming, closures]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Currying** transforms a function that takes multiple arguments into a sequence of functions, each taking **one** argument (or a fixed smaller batch).

```javascript
// Uncurried
const add = (a, b, c) => a + b + c
add(1, 2, 3) // 6

// Curried
const curriedAdd = (a) => (b) => (c) => a + b + c
curriedAdd(1)(2)(3) // 6

// Partial application via currying
const addOne = curriedAdd(1)
const addOneAndTwo = addOne(2)
addOneAndTwo(3) // 6
```

**When it's useful**

- **Partial application** — fix some arguments and reuse the rest later.
- **Composable pipelines** — small unary functions chain cleanly.
- **Configuration** — e.g. `const logError = logWithLevel('error')`.

Currying relies on **closures** to remember previously passed arguments. Libraries like Lodash provide `_.curry()` for n-ary functions automatically.

Named after mathematician Haskell Curry; distinct from **partial application** (which does not require unary steps) though they overlap in practice.
