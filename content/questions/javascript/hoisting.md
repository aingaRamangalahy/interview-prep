---
title: What is hoisting in JavaScript?
category: technical
subcategory: javascript
difficulty: easy
hint: Think about var, let, and function declarations.
tags: []
---

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during compilation.

- `function` declarations are fully hoisted (name and body).
- `var` is hoisted and initialized as `undefined`.
- `let` and `const` are hoisted but remain in the temporal dead zone until initialized.

Example: calling `sayHi()` before `function sayHi() {}` works, but accessing a `let` variable before its line throws a ReferenceError.
