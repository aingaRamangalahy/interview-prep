---
title: What is the difference between call, apply, and bind?
category: technical
subcategory: javascript
difficulty: medium
hint: All three control `this`; they differ in invocation timing and argument passing.
tags: [this, functions]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

`call`, `apply`, and `bind` are methods on `Function.prototype` that let you set the **`this`** value of a function.

| Method | Invokes immediately? | Arguments |
|---|---|---|
| `call` | Yes | Comma-separated |
| `apply` | Yes | Array or array-like |
| `bind` | No — returns a new function | Optional preset args |

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`
}

const user = { name: 'Ada' }

greet.call(user, 'Hello', '!')       // "Hello, Ada!"
greet.apply(user, ['Hello', '!'])      // "Hello, Ada!"
const sayHi = greet.bind(user, 'Hi')
sayHi('?')                           // "Hi, Ada?"
```

**When to use each**

- `call` / `apply` — borrow a method or invoke immediately with a specific `this`.
- `bind` — create a permanently bound callback (e.g. event handlers, partial application).

Mnemonic: **C**all = **C**omma-separated args; **A**pply = **A**rray of args.
