---
title: What is the difference between interface and type?
category: technical
subcategory: typescript
difficulty: easy
hint: Consider declaration merging and unions.
tags: []
---

Both describe object shapes, but differ in capabilities:

**Interface**
- Supports declaration merging.
- Better for public API contracts and extending object shapes.

**Type**
- Supports unions, intersections, tuples, and mapped/conditional types.
- Cannot be reopened/merged after creation.

For simple object shapes either works. Prefer `interface` for extendable object contracts; prefer `type` for unions and advanced type logic.
