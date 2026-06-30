---
title: What is reactivity in Vue 3?
category: technical
subcategory: vue
difficulty: easy
hint: Proxy-based tracking.
tags: []
---

Reactivity is Vue's ability to track dependencies and re-run updates when data changes.

Vue 3 uses ES `Proxy` to intercept get/set operations on reactive objects. During render or computed evaluation, Vue records which properties were accessed. When a property changes, dependent effects (component renders, computed values, watchers) re-run.

Primitives need `ref()`; objects can use `reactive()`.
