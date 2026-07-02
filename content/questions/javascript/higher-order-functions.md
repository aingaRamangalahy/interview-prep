---
title: What are higher-order functions in JavaScript?
category: technical
subcategory: javascript
difficulty: medium
hint: Functions are first-class values — they can be passed around like any other value.
tags: [functional-programming, arrays, functions]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

A **higher-order function (HOF)** is a function that takes another function as an argument, returns a function, or both.

JavaScript treats functions as **first-class citizens**, so HOFs are everywhere:

```javascript
// Accepts a callback
const nums = [1, 2, 3]
nums.map(n => n * 2)       // [2, 4, 6]
nums.filter(n => n > 1)    // [2, 3]
nums.reduce((a, b) => a + b, 0) // 6

// Returns a function
function multiplyBy(factor) {
  return (n) => n * factor
}
const double = multiplyBy(2)
```

**Built-in HOFs:** `map`, `filter`, `reduce`, `sort`, `forEach`, `some`, `every`, `addEventListener`, `Promise.then`.

**Why interviewers ask:** HOFs enable abstraction, reuse, and composable pipelines without duplicating loop logic.
