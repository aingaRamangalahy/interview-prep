---
title: What is the execution context and what happens in its two phases?
category: technical
subcategory: javascript
difficulty: medium
hint: Every function call gets a fresh context — creation first, then execution.
tags: [runtime, scope, hoisting]
source: sudheerj/javascript-interview-questions
---

An **execution context** is the environment in which JavaScript code is evaluated. The engine maintains a stack of contexts (the call stack); each function invocation pushes a new one.

Each context contains:

- **Variable environment** — `var`, function declarations, `let`/`const` bindings
- **`this` binding**
- **Outer reference** — link to the lexical (parent) environment for scope chain lookups

**Two phases**

1. **Creation phase**
   - Create the variable object / lexical environment.
   - Set up scope chain (reference to outer environment).
   - Determine `this` (global, function, or `new` binding).
   - Hoist function declarations and `var` (initialized to `undefined`).
   - Register `let`/`const` in TDZ (not initialized yet).

2. **Execution phase**
   - Run code line by line.
   - Assign values, evaluate expressions, invoke functions.

```javascript
console.log(typeof foo) // "function" — hoisted declaration
console.log(bar)        // undefined — hoisted var

function foo() {}
var bar = 1
```

When a function returns, its execution context is **popped** from the stack and eligible for garbage collection (unless closures retain references).

Understanding execution context ties together **hoisting**, **scope**, **closures**, and the **call stack**.
