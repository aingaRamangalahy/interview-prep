---
title: What are generators and how do they differ from regular functions?
category: technical
subcategory: javascript
difficulty: hard
hint: function* can pause with yield and resume with .next().
tags: [iterators, async]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Generators** are functions that can **pause and resume** execution, returning multiple values over time. Declared with `function*` and using `yield`.

```javascript
function* idGenerator() {
  let id = 0
  while (true) {
    yield id++
  }
}

const gen = idGenerator()
gen.next() // { value: 0, done: false }
gen.next() // { value: 1, done: false }
```

**vs regular functions**

| | Regular function | Generator |
|---|---|---|
| Runs to completion | Always | Can pause at each `yield` |
| Return | Single `return` value | Iterator of `{ value, done }` objects |
| `yield` | N/A | Pauses and produces a value |

**Use cases**

- Lazy sequences (infinite streams, paginated data)
- Custom iterables implementing `Symbol.iterator`
- Coroutine-style control flow (largely replaced by `async/await` for I/O)
- Delegating iteration with `yield*`

```javascript
function* range(start, end) {
  for (let i = start; i <= end; i++) yield i
}

for (const n of range(1, 3)) console.log(n) // 1, 2, 3
```

Generators are **synchronous** by default. For async iteration, use **async generators** (`async function*`) with `for await...of`.
