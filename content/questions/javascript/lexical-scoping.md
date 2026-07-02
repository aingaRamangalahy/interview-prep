---
title: Explain lexical scoping. How does it differ from dynamic scoping?
category: technical
subcategory: javascript
difficulty: medium
hint: Scope is determined by where code is written, not where it is called.
tags: [scope, closures]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Lexical scoping** (static scoping) means a variable's scope is determined by **where the function is defined** in the source code, not where it is invoked.

```javascript
const x = 'global'

function outer() {
  const x = 'outer'
  function inner() {
    console.log(x) // "outer" — resolved lexically
  }
  return inner
}

const fn = outer()
fn() // still "outer", not "global"
```

JavaScript uses **only lexical scoping**. The engine walks the **scope chain** outward from the innermost environment at **write time**.

**Dynamic scoping** (not in JS) would resolve variables based on the **call stack** at runtime — e.g. if `inner()` looked up `x` from whoever called it.

**Why it matters**

- Enables **closures** — inner functions reliably capture outer bindings.
- Explains **`this` vs scope** — `this` is dynamic (call-site), variable lookup is lexical (definition-site).
- Arrow functions inherit lexical `this` from their enclosing scope, unlike regular functions.

Languages with dynamic scoping (e.g. some Lisp dialects, Bash) behave differently; JavaScript developers often confuse `this` rules with scope rules — keep them separate in interviews.
