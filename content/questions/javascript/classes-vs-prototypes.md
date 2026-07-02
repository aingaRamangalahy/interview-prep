---
title: How do ES6 classes relate to prototypal inheritance?
category: technical
subcategory: javascript
difficulty: medium
hint: class is syntax sugar — methods still live on the prototype.
tags: [oop, classes, prototypes]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

ES6 **`class`** is **syntactic sugar** over JavaScript's existing prototype-based model. Under the hood, methods are still defined on the prototype; `new` still wires up `[[Prototype]]`.

```javascript
// Prototype style
function Bike(model, color) {
  this.model = model
  this.color = color
}
Bike.prototype.describe = function () {
  return `${this.model} (${this.color})`
}

// Class sugar — equivalent behavior
class Bike {
  constructor(model, color) {
    this.model = model
    this.color = color
  }
  describe() {
    return `${this.model} (${this.color})`
  }
}
```

**What `class` adds beyond sugar**

- `extends` / `super` for inheritance chains
- Static methods on the constructor
- `get` / `set` accessors
- Methods are non-enumerable by default
- Must be called with `new` (throws otherwise)

```javascript
typeof Bike                    // "function"
Bike.prototype.describe        // function — still on prototype
Object.getPrototypeOf(new Bike()) === Bike.prototype // true
```

Interview takeaway: JavaScript has no classical inheritance at runtime — only objects linked by prototypes. Classes are the ergonomic authoring layer.
