---
title: What is the difference between `__proto__`, `.prototype`, and `Object.getPrototypeOf()`?
category: technical
subcategory: javascript
difficulty: medium
hint: One lives on instances, one on constructor functions, one is the standard API.
tags: [prototypes, oop]
source: sudheerj/javascript-interview-questions
---

These three names show up together in interviews but refer to different things:

| | What it is | Where it lives |
|---|---|---|
| **`Object.getPrototypeOf(obj)`** | Standard way to read an instance's `[[Prototype]]` | Any object |
| **`__proto__`** | Legacy accessor to the same `[[Prototype]]` link | Any object (avoid in new code) |
| **`Constructor.prototype`** | The object used as `[[Prototype]]` for instances created with `new Constructor()` | Function objects only |

```javascript
function Dog() {}
const rex = new Dog()

Object.getPrototypeOf(rex) === Dog.prototype // true
rex.__proto__ === Dog.prototype              // true (legacy)

Dog.prototype.bark = () => 'woof'
rex.bark() // 'woof'
```

**Common mistake:** `Dog.prototype` is **not** the prototype of `Dog` itself — it is the prototype object assigned to instances. The prototype of the function `Dog` is `Function.prototype`.

Prefer `Object.getPrototypeOf()` over `__proto__` in production code.
