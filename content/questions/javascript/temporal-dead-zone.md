---
title: What is the temporal dead zone (TDZ)?
category: technical
subcategory: javascript
difficulty: medium
hint: let and const are hoisted but inaccessible until their declaration line runs.
tags: [scope, hoisting]
source: sudheerj/javascript-interview-questions
---

The **temporal dead zone** is the period between entering a scope and the line where a `let` or `const` binding is initialized. During the TDZ, accessing the variable throws a **ReferenceError**.

```javascript
console.log(a) // undefined — var is hoisted and initialized
var a = 1

console.log(b) // ReferenceError — TDZ
let b = 2
```

**Why it exists**

- Prevents using block-scoped variables before they are declared (catching bugs `var` would silently allow).
- `let`/`const` are hoisted to the top of their **block**, but unlike `var` they are **not** initialized until the declaration is evaluated.

```javascript
let x = 1
{
  console.log(x) // ReferenceError — inner `x` is in TDZ
  let x = 2
}
```

**Interview contrast with `var`:** `var` is function-scoped, hoisted, and initialized to `undefined`. `let`/`const` are block-scoped, hoisted to the block, and trapped in TDZ until initialized. `const` additionally requires an initializer and disallows reassignment (the binding is fixed, though object contents can mutate).
