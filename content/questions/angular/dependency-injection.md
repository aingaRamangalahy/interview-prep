---
title: What is dependency injection in Angular?
category: technical
subcategory: angular
difficulty: easy
hint: Injector hierarchy and providers.
tags: []
---

Dependency Injection (DI) is Angular's pattern for supplying dependencies to classes instead of creating them manually.

Components/services declare dependencies via constructor injection (or `inject()`). Angular's injector resolves tokens from providers registered at module, component, or root level.

Benefits:
- Loose coupling
- Easier testing (mock providers)
- Shared singletons where configured
