---
title: What is the call stack and how does it relate to the event loop?
category: technical
subcategory: javascript
difficulty: medium
hint: LIFO structure — push on call, pop on return. The event loop waits until it is empty.
tags: [event-loop, runtime]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

The **call stack** is a LIFO data structure the JavaScript engine uses to track **execution contexts** (which function is running right now).

- **Push** when a function is invoked.
- **Pop** when that function returns.

```javascript
function a() { b() }
function b() { c() }
function c() { return 'done' }

a()
// Stack: a → b → c → (c pops) → (b pops) → (a pops)
```

**Relation to the event loop**

JavaScript runs **one call stack** on the main thread. When async work finishes (timers, I/O, DOM events), callbacks land in **task queues**. The **event loop** only dequeues the next task when the call stack is **empty**.

Flow:

1. Run synchronous code on the call stack.
2. Stack empties → event loop picks the next microtask or macrotask.
3. Push that callback onto the stack and execute.

A stack overflow (`Maximum call stack size exceeded`) happens when recursion or infinite calls exceed the engine limit — unrelated to the heap or event queues.
