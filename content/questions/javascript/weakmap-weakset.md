---
title: What are WeakMap and WeakSet and how do they differ from Map and Set?
category: technical
subcategory: javascript
difficulty: hard
hint: Weak collections hold object keys weakly — no iteration, GC-friendly.
tags: [data-structures, memory]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**WeakMap** and **WeakSet** are collection types that hold **weak references** to objects, allowing those objects to be garbage-collected when no other references exist.

| | Map / Set | WeakMap / WeakSet |
|---|---|---|
| Keys / values | Any type | **Objects only** |
| Iteration | Yes (`for...of`, `.size`) | **No** — not enumerable |
| Garbage collection | Strong refs prevent GC | Weak refs — entries disappear with object |
| Use case | General caching, dedup | Private/metadata attached to objects |

```javascript
const wm = new WeakMap()
let obj = { id: 1 }
wm.set(obj, 'metadata')

obj = null // { id: 1 } can now be GC'd; WeakMap entry goes with it
```

**Typical use cases**

- Storing private data or metadata on DOM nodes / class instances without leaking memory
- Caching computed results keyed by object identity
- Tracking object presence without preventing cleanup

**WeakSet** — stores only objects (like a Set of weakly held object references). Useful for tagging objects ("already visited") without retaining them.

You cannot get `.size` or list entries — the trade-off for automatic memory management.
