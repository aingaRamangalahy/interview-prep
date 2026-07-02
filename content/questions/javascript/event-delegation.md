---
title: What is event delegation and why use it?
category: technical
subcategory: javascript
difficulty: medium
hint: One listener on a parent handles events from many children via bubbling.
tags: [dom, events]
source: sudheerj/javascript-interview-questions, Codefinity Top 50
---

**Event delegation** attaches a single event listener to a **parent** element and handles events from its **descendants** using event bubbling.

```javascript
document.querySelector('#list').addEventListener('click', (e) => {
  const item = e.target.closest('[data-id]')
  if (!item) return
  console.log('Clicked item', item.dataset.id)
})
```

**Why use it**

- **Fewer listeners** — one handler instead of N per row/button (better memory and setup cost).
- **Dynamic content** — newly added children are covered automatically without rebinding.
- **Simpler teardown** — remove one listener instead of many.

**How it works:** Most events bubble from target → ancestors. The handler inspects `event.target` (or uses `closest()`) to identify which child triggered the action.

**Caveats**

- Not all events bubble (`focus`, `blur` — use capture phase or `focusin`/`focusout`).
- Stop propagation carefully — `stopPropagation()` can break delegated handlers higher up.
- For very flat performance-critical UIs, direct binding may still be preferred.

Related: **event capturing** (trickles down) vs **bubbling** (bubbles up). Delegation typically relies on bubbling.
