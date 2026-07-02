---
title: How do arrow functions differ from regular functions?
category: technical
subcategory: javascript
difficulty: medium
hint: Lexical this, no arguments object, cannot be used as constructors.
tags: [functions, this]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

Arrow functions (`=>`) are a concise syntax for function expressions with **different runtime semantics** from regular `function` declarations/expressions.

| Feature | Regular function | Arrow function |
|---|---|---|
| `this` | Dynamic — set by call site | Lexical — inherited from enclosing scope |
| `arguments` | Has own `arguments` object | Uses outer scope's `arguments` (or rest params) |
| `new` / constructor | Can be used with `new` | Cannot — `TypeError` if attempted |
| `prototype` | Has `.prototype` property | No `.prototype` |
| Methods on objects | Suitable for methods needing own `this` | Risky as object methods |

```javascript
const obj = {
  count: 0,
  incrementRegular: function () {
    setTimeout(function () {
      this.count++ // `this` is window/global — bug
    }, 0)
  },
  incrementArrow: function () {
    setTimeout(() => {
      this.count++ // `this` is obj — works
    }, 0)
  }
}
```

**When to use arrows:** callbacks, array methods, short expressions where lexical `this` is desired.

**When to avoid:** object methods, prototype methods, constructors, anything needing dynamic `this` or the `arguments` object.
