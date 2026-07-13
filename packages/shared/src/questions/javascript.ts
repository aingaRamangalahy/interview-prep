import type { Question } from '../types'

/**
 * Bundled JavaScript interview questions for the offline extension (Phase 1).
 * Sourced from the SaaS question bank.
 */
export const javascriptQuestions: Question[] = [
  {
    id: 'questions/javascript/lexical-scoping',
    title: 'Explain lexical scoping. How does it differ from dynamic scoping?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Scope is determined by where code is written, not where it is called.',
    tags: [
      'scope',
      'closures'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Lexical scoping** (static scoping) means a variable\'s scope is determined by **where the function is defined** in the source code, not where it is invoked.\n\n```javascript\nconst x = \'global\'\n\nfunction outer() {\n  const x = \'outer\'\n  function inner() {\n    console.log(x) // "outer" — resolved lexically\n  }\n  return inner\n}\n\nconst fn = outer()\nfn() // still "outer", not "global"\n```\n\nJavaScript uses **only lexical scoping**. The engine walks the **scope chain** outward from the innermost environment at **write time**.\n\n**Dynamic scoping** (not in JS) would resolve variables based on the **call stack** at runtime — e.g. if `inner()` looked up `x` from whoever called it.\n\n**Why it matters**\n\n- Enables **closures** — inner functions reliably capture outer bindings.\n- Explains **`this` vs scope** — `this` is dynamic (call-site), variable lookup is lexical (definition-site).\n- Arrow functions inherit lexical `this` from their enclosing scope, unlike regular functions.\n\nLanguages with dynamic scoping (e.g. some Lisp dialects, Bash) behave differently; JavaScript developers often confuse `this` rules with scope rules — keep them separate in interviews.',
    path: '/questions/javascript/lexical-scoping'
  },
  {
    id: 'questions/javascript/prototype-chain',
    title: 'Explain prototypal inheritance and the prototype chain.',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Property lookup walks a linked list of objects, not a class hierarchy.',
    tags: [
      'oop',
      'inheritance',
      'prototypes'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'JavaScript uses **prototypal inheritance**: objects delegate property access to another object via an internal `[[Prototype]]` link (exposed as `Object.getPrototypeOf(obj)`).\n\nWhen you read `obj.prop`, the engine:\n\n1. Looks on `obj` itself.\n2. If missing, follows `[[Prototype]]` and repeats.\n3. Stops at `null` → returns `undefined`.\n\n```javascript\nfunction Person(name) {\n  this.name = name\n}\nPerson.prototype.greet = function () {\n  return `Hi, ${this.name}`\n}\n\nconst alice = new Person(\'Alice\')\nObject.getPrototypeOf(alice) === Person.prototype // true\nObject.getPrototypeOf(Person.prototype) === Object.prototype // true\nObject.getPrototypeOf(Object.prototype) // null\n```\n\n**vs classical inheritance:** There are no classes at the language core (ES6 `class` is syntactic sugar over prototypes). Objects inherit directly from other objects through the chain.\n\n**Key APIs:** `Object.create(proto)`, `Object.getPrototypeOf`, `Constructor.prototype`.',
    path: '/questions/javascript/prototype-chain'
  },
  {
    id: 'questions/javascript/event-loop',
    title: 'Explain the event loop. What happens when a Promise resolves?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Think about call stack, microtasks, and macrotasks.',
    tags: [
      'event-loop',
      'async',
      'runtime'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'JavaScript is **single-threaded**: one **call stack** runs code at a time. The **event loop** coordinates the stack with async work handled by the host environment (browser Web APIs or Node.js libuv).\n\n**Components (browser)**\n\n- **Call stack** — currently executing functions.\n- **Web APIs** — `setTimeout`, DOM events, `fetch` (run outside the JS thread).\n- **Microtask queue** — Promise callbacks, `queueMicrotask`, `MutationObserver`.\n- **Macrotask queue** — `setTimeout`/`setInterval` callbacks, I/O.\n\nWhen a Promise resolves, its `.then` / `.catch` / `.finally` handlers are queued as **microtasks** — not run immediately.\n\n**One event loop turn**\n\n1. Execute synchronous code until the call stack is empty.\n2. **Drain all microtasks** (including ones scheduled during draining).\n3. Render UI if needed (browser).\n4. Dequeue and run the next **macrotask**.\n\nSo a resolved Promise always runs before a `setTimeout(..., 0)` scheduled in the same synchronous block — microtasks have priority over macrotasks.',
    path: '/questions/javascript/event-loop'
  },
  {
    id: 'questions/javascript/classes-vs-prototypes',
    title: 'How do ES6 classes relate to prototypal inheritance?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'class is syntax sugar — methods still live on the prototype.',
    tags: [
      'oop',
      'classes',
      'prototypes'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'ES6 **`class`** is **syntactic sugar** over JavaScript\'s existing prototype-based model. Under the hood, methods are still defined on the prototype; `new` still wires up `[[Prototype]]`.\n\n```javascript\n// Prototype style\nfunction Bike(model, color) {\n  this.model = model\n  this.color = color\n}\nBike.prototype.describe = function () {\n  return `${this.model} (${this.color})`\n}\n\n// Class sugar — equivalent behavior\nclass Bike {\n  constructor(model, color) {\n    this.model = model\n    this.color = color\n  }\n  describe() {\n    return `${this.model} (${this.color})`\n  }\n}\n```\n\n**What `class` adds beyond sugar**\n\n- `extends` / `super` for inheritance chains\n- Static methods on the constructor\n- `get` / `set` accessors\n- Methods are non-enumerable by default\n- Must be called with `new` (throws otherwise)\n\n```javascript\ntypeof Bike                    // "function"\nBike.prototype.describe        // function — still on prototype\nObject.getPrototypeOf(new Bike()) === Bike.prototype // true\n```\n\nInterview takeaway: JavaScript has no classical inheritance at runtime — only objects linked by prototypes. Classes are the ergonomic authoring layer.',
    path: '/questions/javascript/classes-vs-prototypes'
  },
  {
    id: 'questions/javascript/arrow-functions-vs-regular',
    title: 'How do arrow functions differ from regular functions?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Lexical this, no arguments object, cannot be used as constructors.',
    tags: [
      'functions',
      'this'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'Arrow functions (`=>`) are a concise syntax for function expressions with **different runtime semantics** from regular `function` declarations/expressions.\n\n| Feature | Regular function | Arrow function |\n|---|---|---|\n| `this` | Dynamic — set by call site | Lexical — inherited from enclosing scope |\n| `arguments` | Has own `arguments` object | Uses outer scope\'s `arguments` (or rest params) |\n| `new` / constructor | Can be used with `new` | Cannot — `TypeError` if attempted |\n| `prototype` | Has `.prototype` property | No `.prototype` |\n| Methods on objects | Suitable for methods needing own `this` | Risky as object methods |\n\n```javascript\nconst obj = {\n  count: 0,\n  incrementRegular: function () {\n    setTimeout(function () {\n      this.count++ // `this` is window/global — bug\n    }, 0)\n  },\n  incrementArrow: function () {\n    setTimeout(() => {\n      this.count++ // `this` is obj — works\n    }, 0)\n  }\n}\n```\n\n**When to use arrows:** callbacks, array methods, short expressions where lexical `this` is desired.\n\n**When to avoid:** object methods, prototype methods, constructors, anything needing dynamic `this` or the `arguments` object.',
    path: '/questions/javascript/arrow-functions-vs-regular'
  },
  {
    id: 'questions/javascript/async-await',
    title: 'How do async and await work under the hood?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'async functions always return a Promise; await pauses via microtasks, not threads.',
    tags: [
      'async',
      'promises'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '`async` / `await` is **syntactic sugar over Promises**. It does not create new threads — it makes asynchronous code read like synchronous code while still being non-blocking.\n\n```javascript\nasync function loadUser(id) {\n  try {\n    const res = await fetch(`/api/users/${id}`)\n    if (!res.ok) throw new Error(res.statusText)\n    return await res.json()\n  } catch (err) {\n    console.error(err)\n    throw err // re-throw to reject the returned Promise\n  }\n}\n```\n\n**Under the hood**\n\n1. An `async function` **always returns a Promise** — even if you `return 42`, callers get `Promise.resolve(42)`.\n2. `await expression` **pauses** the async function until the Promise settles.\n3. The continuation after `await` is scheduled as a **microtask**, not a new thread.\n4. Errors thrown inside `async` reject the returned Promise; use `try/catch` for local handling.\n\n**Parallel vs sequential**\n\n```javascript\n// Sequential — slower\nconst a = await fetchA()\nconst b = await fetchB()\n\n// Parallel — start both, await together\nconst [a, b] = await Promise.all([fetchA(), fetchB()])\n```\n\nInterview tip: `await` only "blocks" the current async function, never the main thread or call stack.',
    path: '/questions/javascript/async-await'
  },
  {
    id: 'questions/javascript/this-keyword',
    title: 'How does the this keyword work in JavaScript?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: '`this` is determined by how a function is called, not where it is written.',
    tags: [
      'this',
      'functions',
      'oop'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '`this` refers to the **execution context** of the current function — specifically, the object that "owns" the call. It is **dynamic**: determined at call time, not definition time.\n\n| Call site | `this` value (typical) |\n|---|---|\n| Method call `obj.fn()` | `obj` |\n| Plain function (non-strict) | Global object (`window` / `globalThis`) |\n| Plain function (strict mode) | `undefined` |\n| `new Constructor()` | Newly created instance |\n| `call` / `apply` / `bind` | Explicitly set value |\n| Arrow function | Lexically inherited from enclosing scope (no own `this`) |\n\n```javascript\nconst person = {\n  name: \'Ada\',\n  greet() { return this.name },\n  greetArrow: () => this?.name // inherits outer `this`, not person\n}\n\nperson.greet()       // "Ada"\nconst fn = person.greet\nfn()             // undefined (strict) or global (sloppy)\n\nconst bound = person.greet.bind(person)\nbound()              // "Ada"\n```\n\n**Arrow functions** do not have their own `this`, `arguments`, `super`, or `new.target` — a frequent source of bugs when passing methods as callbacks.',
    path: '/questions/javascript/this-keyword'
  },
  {
    id: 'questions/javascript/event-loop-output',
    title: 'Predict the output: event loop ordering with sync code, Promises, and setTimeout',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'hard',
    hint: 'Sync first, then drain microtasks, then macrotasks.',
    tags: [
      'event-loop',
      'async'
    ],
    source: 'sudheerj/javascript-interview-questions',
    answer: 'What prints and in what order?\n\n```javascript\nconsole.log(\'A\')\n\nsetTimeout(() => console.log(\'B\'), 0)\n\nPromise.resolve()\n  .then(() => console.log(\'C\'))\n  .then(() => console.log(\'D\'))\n\nconsole.log(\'E\')\n```\n\n**Answer: A → E → C → D → B**\n\n**Step by step**\n\n1. **Sync phase (call stack):** `A`, schedule macrotask `B`, schedule microtasks for Promise chain, `E`.\n2. **Microtask drain:** First `.then` runs → `C`. That schedules another microtask → `D`.\n3. **Microtask drain continues:** `D` runs.\n4. **Macrotask:** `setTimeout` callback → `B`.\n\n**Rules to remember**\n\n- Synchronous code always runs first.\n- The microtask queue is **fully drained** before the next macrotask.\n- New microtasks scheduled during microtask processing run in the **same turn**.\n- `setTimeout(fn, 0)` is not instant — it waits for the stack to clear **and** all microtasks.\n\n**Variant trap:** If the second `.then` did `setTimeout(() => log(\'F\'), 0)`, `F` would print after `B` because it is scheduled in a later macrotask turn.',
    path: '/questions/javascript/event-loop-output'
  },
  {
    id: 'questions/javascript/promises',
    title: 'What are Promises and what are their three states?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'A Promise is a future value wrapper — pending until settled, then immutable.',
    tags: [
      'async',
      'promises'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'A **Promise** is an object representing the eventual result of an asynchronous operation. It provides a structured alternative to callback pyramids.\n\n**Three states:**\n\n| State | Meaning |\n|---|---|\n| **pending** | Initial state; neither fulfilled nor rejected |\n| **fulfilled** | Operation succeeded; value is available |\n| **rejected** | Operation failed; reason (error) is available |\n\nOnce settled (fulfilled or rejected), a Promise **cannot change state**.\n\n```javascript\nconst p = fetch(\'/api/user\')\n  .then(res => res.json())\n  .then(user => console.log(user.name))\n  .catch(err => console.error(err))\n  .finally(() => console.log(\'done\'))\n```\n\n**Key rules (A+ / Promises spec)**\n\n- `.then` / `.catch` / `.finally` return **new** Promises, enabling chaining.\n- Handlers run as **microtasks**, after current sync code.\n- Unhandled rejections can be silently lost — always attach `.catch` or use `try/catch` with `await`.\n\n**Common static methods:** `Promise.all`, `Promise.race`, `Promise.allSettled`, `Promise.any`.',
    path: '/questions/javascript/promises'
  },
  {
    id: 'questions/javascript/weakmap-weakset',
    title: 'What are WeakMap and WeakSet and how do they differ from Map and Set?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'hard',
    hint: 'Weak collections hold object keys weakly — no iteration, GC-friendly.',
    tags: [
      'data-structures',
      'memory'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**WeakMap** and **WeakSet** are collection types that hold **weak references** to objects, allowing those objects to be garbage-collected when no other references exist.\n\n| | Map / Set | WeakMap / WeakSet |\n|---|---|---|\n| Keys / values | Any type | **Objects only** |\n| Iteration | Yes (`for...of`, `.size`) | **No** — not enumerable |\n| Garbage collection | Strong refs prevent GC | Weak refs — entries disappear with object |\n| Use case | General caching, dedup | Private/metadata attached to objects |\n\n```javascript\nconst wm = new WeakMap()\nlet obj = { id: 1 }\nwm.set(obj, \'metadata\')\n\nobj = null // { id: 1 } can now be GC\'d; WeakMap entry goes with it\n```\n\n**Typical use cases**\n\n- Storing private data or metadata on DOM nodes / class instances without leaking memory\n- Caching computed results keyed by object identity\n- Tracking object presence without preventing cleanup\n\n**WeakSet** — stores only objects (like a Set of weakly held object references). Useful for tagging objects ("already visited") without retaining them.\n\nYou cannot get `.size` or list entries — the trade-off for automatic memory management.',
    path: '/questions/javascript/weakmap-weakset'
  },
  {
    id: 'questions/javascript/closures',
    title: 'What are closures in JavaScript? Give a practical use case.',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Think about a function that outlives the scope where it was created.',
    tags: [
      'closures',
      'scope',
      'functions'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'A **closure** is a function bundled together with its lexical environment — the variables from the scope where it was declared. The inner function keeps access to outer variables even after the outer function has finished executing.\n\n```javascript\nfunction createCounter() {\n  let count = 0\n  return function () {\n    count++\n    return count\n  }\n}\n\nconst counter = createCounter()\ncounter() // 1\ncounter() // 2\n```\n\n**Why it matters in interviews**\n\n- **Data privacy** — hide state without classes (module pattern, factory functions).\n- **Partial application / currying** — capture fixed arguments for later calls.\n- **Event handlers & callbacks** — retain context from the enclosing scope.\n\nClosures are not a special syntax; they fall out of JavaScript\'s **lexical scoping** rules whenever a function references variables from an outer scope.',
    path: '/questions/javascript/closures'
  },
  {
    id: 'questions/javascript/generators',
    title: 'What are generators and how do they differ from regular functions?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'hard',
    hint: 'function* can pause with yield and resume with .next().',
    tags: [
      'iterators',
      'async'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Generators** are functions that can **pause and resume** execution, returning multiple values over time. Declared with `function*` and using `yield`.\n\n```javascript\nfunction* idGenerator() {\n  let id = 0\n  while (true) {\n    yield id++\n  }\n}\n\nconst gen = idGenerator()\ngen.next() // { value: 0, done: false }\ngen.next() // { value: 1, done: false }\n```\n\n**vs regular functions**\n\n| | Regular function | Generator |\n|---|---|---|\n| Runs to completion | Always | Can pause at each `yield` |\n| Return | Single `return` value | Iterator of `{ value, done }` objects |\n| `yield` | N/A | Pauses and produces a value |\n\n**Use cases**\n\n- Lazy sequences (infinite streams, paginated data)\n- Custom iterables implementing `Symbol.iterator`\n- Coroutine-style control flow (largely replaced by `async/await` for I/O)\n- Delegating iteration with `yield*`\n\n```javascript\nfunction* range(start, end) {\n  for (let i = start; i <= end; i++) yield i\n}\n\nfor (const n of range(1, 3)) console.log(n) // 1, 2, 3\n```\n\nGenerators are **synchronous** by default. For async iteration, use **async generators** (`async function*`) with `for await...of`.',
    path: '/questions/javascript/generators'
  },
  {
    id: 'questions/javascript/higher-order-functions',
    title: 'What are higher-order functions in JavaScript?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Functions are first-class values — they can be passed around like any other value.',
    tags: [
      'functional-programming',
      'arrays',
      'functions'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'A **higher-order function (HOF)** is a function that takes another function as an argument, returns a function, or both.\n\nJavaScript treats functions as **first-class citizens**, so HOFs are everywhere:\n\n```javascript\n// Accepts a callback\nconst nums = [1, 2, 3]\nnums.map(n => n * 2)       // [2, 4, 6]\nnums.filter(n => n > 1)    // [2, 3]\nnums.reduce((a, b) => a + b, 0) // 6\n\n// Returns a function\nfunction multiplyBy(factor) {\n  return (n) => n * factor\n}\nconst double = multiplyBy(2)\n```\n\n**Built-in HOFs:** `map`, `filter`, `reduce`, `sort`, `forEach`, `some`, `every`, `addEventListener`, `Promise.then`.\n\n**Why interviewers ask:** HOFs enable abstraction, reuse, and composable pipelines without duplicating loop logic.',
    path: '/questions/javascript/higher-order-functions'
  },
  {
    id: 'questions/javascript/microtasks-vs-macrotasks',
    title: 'What are microtasks vs macrotasks in the event loop?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'hard',
    hint: 'Promises and queueMicrotask run before setTimeout — even if scheduled in the same tick.',
    tags: [
      'event-loop',
      'async',
      'promises'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'The event loop processes work in **turns**. After each synchronous chunk of code (a macrotask), the engine **drains the entire microtask queue** before taking the next macrotask.\n\n**Microtasks** (higher priority):\n\n- Promise `.then` / `.catch` / `.finally`\n- `await` continuations\n- `queueMicrotask()`\n- `MutationObserver` callbacks\n\n**Macrotasks** (task queue):\n\n- `setTimeout` / `setInterval`\n- I/O callbacks (Node.js)\n- UI rendering (browser)\n\n```javascript\nconsole.log(\'1\')\n\nsetTimeout(() => console.log(\'2\'), 0)\n\nPromise.resolve().then(() => console.log(\'3\'))\n\nconsole.log(\'4\')\n\n// Output: 1, 4, 3, 2\n```\n\n**Order per turn:**\n\n1. Run current macrotask (sync code) on the call stack.\n2. Drain **all** microtasks (new microtasks scheduled during draining also run in this phase).\n3. Optionally render (browser).\n4. Dequeue next macrotask.\n\nThis is why resolved Promises always beat `setTimeout(..., 0)` scheduled in the same synchronous block.',
    path: '/questions/javascript/microtasks-vs-macrotasks'
  },
  {
    id: 'questions/javascript/pure-functions',
    title: 'What is a pure function and why does it matter?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Same inputs always produce same outputs; no side effects.',
    tags: [
      'functional-programming'
    ],
    source: 'sudheerj/javascript-interview-questions',
    answer: 'A **pure function** satisfies two rules:\n\n1. **Referential transparency** — given the same arguments, it always returns the same result.\n2. **No side effects** — it does not mutate external state, I/O, DOM, globals, or arguments.\n\n```javascript\n// Pure\nconst add = (a, b) => a + b\n\n// Impure — depends on external state\nlet tax = 0.1\nconst withTax = (price) => price * (1 + tax)\n\n// Impure — mutates input\nconst pushItem = (arr, item) => { arr.push(item); return arr }\n```\n\n**Why interviewers care**\n\n- **Predictable** — easier to test and reason about.\n- **Cacheable** — enables **memoization**.\n- **Parallel-safe** — no hidden shared state.\n- **Works well with HOFs** — `map`, `filter`, `reduce` assume non-mutating callbacks.\n\nPure functions pair naturally with **immutability** patterns (spread, `map` instead of in-place mutation). Real apps need side effects at the boundaries — the functional style pushes impure I/O to the edges and keeps core logic pure.',
    path: '/questions/javascript/pure-functions'
  },
  {
    id: 'questions/javascript/iife',
    title: 'What is an IIFE and why was it used before ES modules?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: '(function () { ... })() — run immediately, create a private scope.',
    tags: [
      'scope',
      'modules'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'An **IIFE** (Immediately Invoked Function Expression) is a function that is **defined and executed right away**, creating a private scope.\n\n```javascript\n(function () {\n  const secret = 42\n  // variables here don\'t leak to global scope\n})()\n\n// secret is not accessible here\n```\n\n**Syntax variants**\n\n```javascript\n(function () { /* ... */ })()\n;(function () { /* ... */ }()) // alternative grouping\n\n// Arrow IIFE (cannot use for `new` patterns)\n(() => { /* ... */ })()\n```\n\n**Why it was common pre-ES modules**\n\n- **Avoid global pollution** — wrap scripts so internals stay private.\n- **Module pattern** — return a public API from the IIFE while keeping state in closure:\n\n```javascript\nconst counter = (function () {\n  let count = 0\n  return {\n    increment() { return ++count },\n    get() { return count }\n  }\n})()\n```\n\n**Today:** ES modules (`import` / `export`) provide native file-level scope. IIFEs are still useful for one-off isolation, legacy bundles, and some build-tool patterns, but modules are the standard approach.',
    path: '/questions/javascript/iife'
  },
  {
    id: 'questions/javascript/currying',
    title: 'What is currying in JavaScript? When is it useful?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'hard',
    hint: 'Transform f(a, b, c) into f(a)(b)(c) — one argument per function call.',
    tags: [
      'functional-programming',
      'closures'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Currying** transforms a function that takes multiple arguments into a sequence of functions, each taking **one** argument (or a fixed smaller batch).\n\n```javascript\n// Uncurried\nconst add = (a, b, c) => a + b + c\nadd(1, 2, 3) // 6\n\n// Curried\nconst curriedAdd = (a) => (b) => (c) => a + b + c\ncurriedAdd(1)(2)(3) // 6\n\n// Partial application via currying\nconst addOne = curriedAdd(1)\nconst addOneAndTwo = addOne(2)\naddOneAndTwo(3) // 6\n```\n\n**When it\'s useful**\n\n- **Partial application** — fix some arguments and reuse the rest later.\n- **Composable pipelines** — small unary functions chain cleanly.\n- **Configuration** — e.g. `const logError = logWithLevel(\'error\')`.\n\nCurrying relies on **closures** to remember previously passed arguments. Libraries like Lodash provide `_.curry()` for n-ary functions automatically.\n\nNamed after mathematician Haskell Curry; distinct from **partial application** (which does not require unary steps) though they overlap in practice.',
    path: '/questions/javascript/currying'
  },
  {
    id: 'questions/javascript/event-delegation',
    title: 'What is event delegation and why use it?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'One listener on a parent handles events from many children via bubbling.',
    tags: [
      'dom',
      'events'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Event delegation** attaches a single event listener to a **parent** element and handles events from its **descendants** using event bubbling.\n\n```javascript\ndocument.querySelector(\'#list\').addEventListener(\'click\', (e) => {\n  const item = e.target.closest(\'[data-id]\')\n  if (!item) return\n  console.log(\'Clicked item\', item.dataset.id)\n})\n```\n\n**Why use it**\n\n- **Fewer listeners** — one handler instead of N per row/button (better memory and setup cost).\n- **Dynamic content** — newly added children are covered automatically without rebinding.\n- **Simpler teardown** — remove one listener instead of many.\n\n**How it works:** Most events bubble from target → ancestors. The handler inspects `event.target` (or uses `closest()`) to identify which child triggered the action.\n\n**Caveats**\n\n- Not all events bubble (`focus`, `blur` — use capture phase or `focusin`/`focusout`).\n- Stop propagation carefully — `stopPropagation()` can break delegated handlers higher up.\n- For very flat performance-critical UIs, direct binding may still be preferred.\n\nRelated: **event capturing** (trickles down) vs **bubbling** (bubbles up). Delegation typically relies on bubbling.',
    path: '/questions/javascript/event-delegation'
  },
  {
    id: 'questions/javascript/hoisting',
    title: 'What is hoisting in JavaScript?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Declarations are registered during the creation phase — before code runs line by line.',
    tags: [
      'scope',
      'execution-context'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Hoisting** is the behavior where the engine registers declarations during the **creation phase** of an execution context, before the code runs line by line. It is not literally moving lines of source code.\n\n| Declaration | Hoisted? | Usable before line? |\n|---|---|---|\n| `function` declaration | Yes — name and body | Yes |\n| `var` | Yes — initialized to `undefined` | Yes (value is `undefined`) |\n| `let` / `const` | Yes — but in TDZ | No — ReferenceError |\n| `class` | Yes — but in TDZ | No — ReferenceError |\n| `function` expression (`const fn = function() {}`) | Variable only | No — TDZ until assignment |\n\n```javascript\nsayHi() // works — function declaration fully hoisted\nfunction sayHi() { console.log(\'hi\') }\n\nconsole.log(x) // undefined — var hoisted, not assigned yet\nvar x = 1\n\nconsole.log(y) // ReferenceError — TDZ\nlet y = 2\n```\n\n**Interview nuance:** `let`/`const` **are** hoisted to the top of their block, but unlike `var` they are not initialized until the declaration executes — that gap is the **temporal dead zone**.',
    path: '/questions/javascript/hoisting'
  },
  {
    id: 'questions/javascript/memoization',
    title: 'What is memoization and how do closures enable it?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Cache expensive pure function results keyed by arguments.',
    tags: [
      'functional-programming',
      'closures',
      'performance'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Memoization** caches the results of expensive function calls and returns the cached value when the same inputs occur again. It only makes sense for **pure functions** (same input → same output, no side effects).\n\n```javascript\nfunction memoize(fn) {\n  const cache = new Map()\n  return function (...args) {\n    const key = JSON.stringify(args)\n    if (cache.has(key)) return cache.get(key)\n    const result = fn(...args)\n    cache.set(key, result)\n    return result\n  }\n}\n\nconst fib = memoize(function fib(n) {\n  if (n <= 1) return n\n  return fib(n - 1) + fib(n - 2)\n})\n```\n\n**Why closures matter:** The returned wrapper function closes over the `cache` object, keeping it private and persistent across calls without polluting global scope.\n\n**Trade-offs**\n\n- Memory grows with unique inputs — unbounded caches can leak memory.\n- Key serialization (`JSON.stringify`) fails for non-serializable args or object key order edge cases.\n- Best for CPU-heavy, repeatedly called pure functions (DOM diffing helpers, recursive algorithms, API response shaping).\n\nLibraries like `memoize-one` only retain the last result for a lighter footprint.',
    path: '/questions/javascript/memoization'
  },
  {
    id: 'questions/javascript/call-stack',
    title: 'What is the call stack and how does it relate to the event loop?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'LIFO structure — push on call, pop on return. The event loop waits until it is empty.',
    tags: [
      'event-loop',
      'runtime'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: 'The **call stack** is a LIFO data structure the JavaScript engine uses to track **execution contexts** (which function is running right now).\n\n- **Push** when a function is invoked.\n- **Pop** when that function returns.\n\n```javascript\nfunction a() { b() }\nfunction b() { c() }\nfunction c() { return \'done\' }\n\na()\n// Stack: a → b → c → (c pops) → (b pops) → (a pops)\n```\n\n**Relation to the event loop**\n\nJavaScript runs **one call stack** on the main thread. When async work finishes (timers, I/O, DOM events), callbacks land in **task queues**. The **event loop** only dequeues the next task when the call stack is **empty**.\n\nFlow:\n\n1. Run synchronous code on the call stack.\n2. Stack empties → event loop picks the next microtask or macrotask.\n3. Push that callback onto the stack and execute.\n\nA stack overflow (`Maximum call stack size exceeded`) happens when recursion or infinite calls exceed the engine limit — unrelated to the heap or event queues.',
    path: '/questions/javascript/call-stack'
  },
  {
    id: 'questions/javascript/promise-static-methods',
    title: 'What is the difference between Promise.all, Promise.race, and Promise.allSettled?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'all = wait for all; race = first settled; allSettled = all outcomes regardless of failure.',
    tags: [
      'async',
      'promises'
    ],
    source: 'sudheerj/javascript-interview-questions',
    answer: 'These static Promise methods coordinate multiple async operations differently:\n\n| Method | Resolves when | Rejects when | Result |\n|---|---|---|---|\n| **`Promise.all`** | All promises fulfill | **Any** promise rejects | Array of fulfilled values |\n| **`Promise.race`** | **First** promise settles (fulfill or reject) | First rejection wins | First settled value/reason |\n| **`Promise.allSettled`** | All promises settle (fulfill or reject) | Never rejects | Array of `{ status, value/reason }` |\n| **`Promise.any`** | **First** fulfillment | All reject | First fulfilled value |\n\n```javascript\nconst p1 = Promise.resolve(1)\nconst p2 = Promise.resolve(2)\nconst p3 = Promise.reject(\'fail\')\n\nawait Promise.all([p1, p2])       // [1, 2]\nawait Promise.allSettled([p1, p3]) // [{status:\'fulfilled\',...}, {status:\'rejected\',...}]\nawait Promise.race([p1, p2])       // 1 (first to settle)\n```\n\n**Interview tips**\n\n- Use `Promise.all` for parallel fetches where **one failure should fail everything**.\n- Use `Promise.allSettled` when you need **every outcome** (e.g. batch API calls, partial success UI).\n- Use `Promise.race` for **timeouts** or first-responder patterns.\n- `Promise.all` short-circuits on first rejection — other promises still run but results are ignored.',
    path: '/questions/javascript/promise-static-methods'
  },
  {
    id: 'questions/javascript/proto-vs-prototype',
    title: 'What is the difference between `__proto__`, `.prototype`, and `Object.getPrototypeOf()`?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'One lives on instances, one on constructor functions, one is the standard API.',
    tags: [
      'prototypes',
      'oop'
    ],
    source: 'sudheerj/javascript-interview-questions',
    answer: 'These three names show up together in interviews but refer to different things:\n\n| | What it is | Where it lives |\n|---|---|---|\n| **`Object.getPrototypeOf(obj)`** | Standard way to read an instance\'s `[[Prototype]]` | Any object |\n| **`__proto__`** | Legacy accessor to the same `[[Prototype]]` link | Any object (avoid in new code) |\n| **`Constructor.prototype`** | The object used as `[[Prototype]]` for instances created with `new Constructor()` | Function objects only |\n\n```javascript\nfunction Dog() {}\nconst rex = new Dog()\n\nObject.getPrototypeOf(rex) === Dog.prototype // true\nrex.__proto__ === Dog.prototype              // true (legacy)\n\nDog.prototype.bark = () => \'woof\'\nrex.bark() // \'woof\'\n```\n\n**Common mistake:** `Dog.prototype` is **not** the prototype of `Dog` itself — it is the prototype object assigned to instances. The prototype of the function `Dog` is `Function.prototype`.\n\nPrefer `Object.getPrototypeOf()` over `__proto__` in production code.',
    path: '/questions/javascript/proto-vs-prototype'
  },
  {
    id: 'questions/javascript/call-apply-bind',
    title: 'What is the difference between call, apply, and bind?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'All three control `this`; they differ in invocation timing and argument passing.',
    tags: [
      'this',
      'functions'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '`call`, `apply`, and `bind` are methods on `Function.prototype` that let you set the **`this`** value of a function.\n\n| Method | Invokes immediately? | Arguments |\n|---|---|---|\n| `call` | Yes | Comma-separated |\n| `apply` | Yes | Array or array-like |\n| `bind` | No — returns a new function | Optional preset args |\n\n```javascript\nfunction greet(greeting, punctuation) {\n  return `${greeting}, ${this.name}${punctuation}`\n}\n\nconst user = { name: \'Ada\' }\n\ngreet.call(user, \'Hello\', \'!\')       // "Hello, Ada!"\ngreet.apply(user, [\'Hello\', \'!\'])      // "Hello, Ada!"\nconst sayHi = greet.bind(user, \'Hi\')\nsayHi(\'?\')                           // "Hi, Ada?"\n```\n\n**When to use each**\n\n- `call` / `apply` — borrow a method or invoke immediately with a specific `this`.\n- `bind` — create a permanently bound callback (e.g. event handlers, partial application).\n\nMnemonic: **C**all = **C**omma-separated args; **A**pply = **A**rray of args.',
    path: '/questions/javascript/call-apply-bind'
  },
  {
    id: 'questions/javascript/shallow-vs-deep-copy',
    title: 'What is the difference between shallow copy and deep copy?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Shallow copy shares nested references; deep copy clones the full tree.',
    tags: [
      'objects',
      'references'
    ],
    source: 'sudheerj/javascript-interview-questions, Codefinity Top 50',
    answer: '**Shallow copy** creates a new object/array but **copies references** to nested objects — mutating a nested property affects both copies.\n\n**Deep copy** recursively clones nested structures so the copies are fully independent.\n\n```javascript\nconst original = { a: 1, b: { c: 2 } }\n\n// Shallow\nconst shallow = { ...original }\nshallow.b.c = 99\noriginal.b.c // 99 — shared reference\n\n// Deep (simple — JSON trick)\nconst deep = structuredClone(original) // modern API\ndeep.b.c = 42\noriginal.b.c // 99 — unchanged\n```\n\n**Common shallow copy methods**\n\n- Spread: `{ ...obj }`, `[...arr]`\n- `Object.assign({}, obj)`\n- `Array.prototype.slice()`\n\n**Deep copy approaches**\n\n- `structuredClone(obj)` — built-in, handles most types (not functions, symbols, prototypes)\n- `JSON.parse(JSON.stringify(obj))` — loses `undefined`, functions, `Date`, `Map`, circular refs\n- Libraries (Lodash `cloneDeep`) for complex graphs\n\n**Interview trap:** `{ ...obj }` is **not** a deep clone. Nested objects remain aliased.',
    path: '/questions/javascript/shallow-vs-deep-copy'
  },
  {
    id: 'questions/javascript/execution-context',
    title: 'What is the execution context and what happens in its two phases?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'Every function call gets a fresh context — creation first, then execution.',
    tags: [
      'runtime',
      'scope',
      'hoisting'
    ],
    source: 'sudheerj/javascript-interview-questions',
    answer: 'An **execution context** is the environment in which JavaScript code is evaluated. The engine maintains a stack of contexts (the call stack); each function invocation pushes a new one.\n\nEach context contains:\n\n- **Variable environment** — `var`, function declarations, `let`/`const` bindings\n- **`this` binding**\n- **Outer reference** — link to the lexical (parent) environment for scope chain lookups\n\n**Two phases**\n\n1. **Creation phase**\n   - Create the variable object / lexical environment.\n   - Set up scope chain (reference to outer environment).\n   - Determine `this` (global, function, or `new` binding).\n   - Hoist function declarations and `var` (initialized to `undefined`).\n   - Register `let`/`const` in TDZ (not initialized yet).\n\n2. **Execution phase**\n   - Run code line by line.\n   - Assign values, evaluate expressions, invoke functions.\n\n```javascript\nconsole.log(typeof foo) // "function" — hoisted declaration\nconsole.log(bar)        // undefined — hoisted var\n\nfunction foo() {}\nvar bar = 1\n```\n\nWhen a function returns, its execution context is **popped** from the stack and eligible for garbage collection (unless closures retain references).\n\nUnderstanding execution context ties together **hoisting**, **scope**, **closures**, and the **call stack**.',
    path: '/questions/javascript/execution-context'
  },
  {
    id: 'questions/javascript/temporal-dead-zone',
    title: 'What is the temporal dead zone (TDZ)?',
    category: 'technical',
    subcategory: 'javascript',
    difficulty: 'medium',
    hint: 'let and const are hoisted but inaccessible until their declaration line runs.',
    tags: [
      'scope',
      'hoisting'
    ],
    source: 'sudheerj/javascript-interview-questions',
    answer: 'The **temporal dead zone** is the period between entering a scope and the line where a `let` or `const` binding is initialized. During the TDZ, accessing the variable throws a **ReferenceError**.\n\n```javascript\nconsole.log(a) // undefined — var is hoisted and initialized\nvar a = 1\n\nconsole.log(b) // ReferenceError — TDZ\nlet b = 2\n```\n\n**Why it exists**\n\n- Prevents using block-scoped variables before they are declared (catching bugs `var` would silently allow).\n- `let`/`const` are hoisted to the top of their **block**, but unlike `var` they are **not** initialized until the declaration is evaluated.\n\n```javascript\nlet x = 1\n{\n  console.log(x) // ReferenceError — inner `x` is in TDZ\n  let x = 2\n}\n```\n\n**Interview contrast with `var`:** `var` is function-scoped, hoisted, and initialized to `undefined`. `let`/`const` are block-scoped, hoisted to the block, and trapped in TDZ until initialized. `const` additionally requires an initializer and disallows reassignment (the binding is fixed, though object contents can mutate).',
    path: '/questions/javascript/temporal-dead-zone'
  }
]
