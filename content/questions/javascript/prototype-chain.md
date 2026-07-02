---
title: Explain prototypal inheritance and the prototype chain.
category: technical
subcategory: javascript
difficulty: medium
hint: Property lookup walks a linked list of objects, not a class hierarchy.
tags: [oop, inheritance, prototypes]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

JavaScript uses **prototypal inheritance**: objects delegate property access to another object via an internal `[[Prototype]]` link (exposed as `Object.getPrototypeOf(obj)`).

When you read `obj.prop`, the engine:

1. Looks on `obj` itself.
2. If missing, follows `[[Prototype]]` and repeats.
3. Stops at `null` → returns `undefined`.

```javascript
function Person(name) {
  this.name = name
}
Person.prototype.greet = function () {
  return `Hi, ${this.name}`
}

const alice = new Person('Alice')
Object.getPrototypeOf(alice) === Person.prototype // true
Object.getPrototypeOf(Person.prototype) === Object.prototype // true
Object.getPrototypeOf(Object.prototype) // null
```

**vs classical inheritance:** There are no classes at the language core (ES6 `class` is syntactic sugar over prototypes). Objects inherit directly from other objects through the chain.

**Key APIs:** `Object.create(proto)`, `Object.getPrototypeOf`, `Constructor.prototype`.
