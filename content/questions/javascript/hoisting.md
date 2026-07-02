---
title: What is hoisting in JavaScript?
category: technical
subcategory: javascript
difficulty: medium
hint: Declarations are registered during the creation phase — before code runs line by line.
tags: [scope, execution-context]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Hoisting** is the behavior where the engine registers declarations during the **creation phase** of an execution context, before the code runs line by line. It is not literally moving lines of source code.

| Declaration | Hoisted? | Usable before line? |
|---|---|---|
| `function` declaration | Yes — name and body | Yes |
| `var` | Yes — initialized to `undefined` | Yes (value is `undefined`) |
| `let` / `const` | Yes — but in TDZ | No — ReferenceError |
| `class` | Yes — but in TDZ | No — ReferenceError |
| `function` expression (`const fn = function() {}`) | Variable only | No — TDZ until assignment |

```javascript
sayHi() // works — function declaration fully hoisted
function sayHi() { console.log('hi') }

console.log(x) // undefined — var hoisted, not assigned yet
var x = 1

console.log(y) // ReferenceError — TDZ
let y = 2
```

**Interview nuance:** `let`/`const` **are** hoisted to the top of their block, but unlike `var` they are not initialized until the declaration executes — that gap is the **temporal dead zone**.
