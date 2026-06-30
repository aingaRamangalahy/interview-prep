---
title: How would you check if a linked list has a cycle?
category: technical
subcategory: problem-solving
difficulty: easy
hint: Two pointers moving at different speeds.
tags: []
---

Use **Floyd's cycle detection** (tortoise and hare):

1. Start slow and fast pointers at the head.
2. Move slow one step and fast two steps each iteration.
3. If they meet, a cycle exists.
4. If fast reaches null, no cycle.

Time O(n), space O(1).

Alternative: store visited nodes in a Set — simpler but O(n) space.
