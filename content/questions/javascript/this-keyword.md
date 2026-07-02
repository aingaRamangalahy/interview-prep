---
title: How does the this keyword work in JavaScript?
category: technical
subcategory: javascript
difficulty: medium
hint: `this` is determined by how a function is called, not where it is written.
tags: [this, functions, oop]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

`this` refers to the **execution context** of the current function — specifically, the object that "owns" the call. It is **dynamic**: determined at call time, not definition time.

| Call site | `this` value (typical) |
|---|---|
| Method call `obj.fn()` | `obj` |
| Plain function (non-strict) | Global object (`window` / `globalThis`) |
| Plain function (strict mode) | `undefined` |
| `new Constructor()` | Newly created instance |
| `call` / `apply` / `bind` | Explicitly set value |
| Arrow function | Lexically inherited from enclosing scope (no own `this`) |

```javascript
const person = {
  name: 'Ada',
  greet() { return this.name },
  greetArrow: () => this?.name // inherits outer `this`, not person
}

person.greet()       // "Ada"
const fn = person.greet
fn()             // undefined (strict) or global (sloppy)

const bound = person.greet.bind(person)
bound()              // "Ada"
```

**Arrow functions** do not have their own `this`, `arguments`, `super`, or `new.target` — a frequent source of bugs when passing methods as callbacks.
