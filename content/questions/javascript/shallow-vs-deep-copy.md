---
title: What is the difference between shallow copy and deep copy?
category: technical
subcategory: javascript
difficulty: medium
hint: Shallow copy shares nested references; deep copy clones the full tree.
tags: [objects, references]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Shallow copy** creates a new object/array but **copies references** to nested objects — mutating a nested property affects both copies.

**Deep copy** recursively clones nested structures so the copies are fully independent.

```javascript
const original = { a: 1, b: { c: 2 } }

// Shallow
const shallow = { ...original }
shallow.b.c = 99
original.b.c // 99 — shared reference

// Deep (simple — JSON trick)
const deep = structuredClone(original) // modern API
deep.b.c = 42
original.b.c // 99 — unchanged
```

**Common shallow copy methods**

- Spread: `{ ...obj }`, `[...arr]`
- `Object.assign({}, obj)`
- `Array.prototype.slice()`

**Deep copy approaches**

- `structuredClone(obj)` — built-in, handles most types (not functions, symbols, prototypes)
- `JSON.parse(JSON.stringify(obj))` — loses `undefined`, functions, `Date`, `Map`, circular refs
- Libraries (Lodash `cloneDeep`) for complex graphs

**Interview trap:** `{ ...obj }` is **not** a deep clone. Nested objects remain aliased.
