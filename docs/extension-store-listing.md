# FlashTab — Store listing copy

Copy-paste these fields into the Chrome Web Store, Firefox AMO, and Edge Add-ons dashboards.

Keep this file as the source of truth. When you change wording here, also update `extension/wxt.config.ts` → `manifest.name` / `manifest.description` so the installed extension matches the store listing.

---

## Name

```
FlashTab
```

Chrome limit: 75 characters  
Firefox limit: 50 characters

---

## Short description

Chrome calls this **Summary** (max **132** characters).  
Firefox calls this **Summary** (max **250** characters).

```
5 JavaScript interview flash cards every time you open a new tab. Practice locally — no account needed.
```

Character count: **102** (fits Chrome).

---



## Long description

Paste into **Detailed description** (Chrome) / **Description** (Firefox).

```
FlashTab turns every new browser tab into a short interview practice session.

Each time you open a new tab, you get 5 JavaScript flash cards — question, hint, answer, then a quick self-rating. Progress and streaks stay on your device. No account. No cloud sync. No distractions.

Who it's for

• Developers preparing for a technical interview who want daily reps without opening another app
• Engineers who want to stay sharp between jobs — keep core JavaScript concepts fresh in a few minutes a day
• Anyone who prefers spaced practice over cramming the night before

How it works

1. Open a new tab
2. Read the question (optional hint)
3. Reveal the answer
4. Rate how well you knew it (Again / Hard / Good / Easy)
5. Finish the set of 5 — your streak updates automatically

FlashTab uses a simple spaced-repetition style schedule so cards you struggle with come back sooner, and cards you know well wait longer.

Privacy

All progress is stored locally in your browser (chrome.storage). FlashTab does not collect personal data, does not track browsing, and does not send anything to a server.

Version 1 focuses on JavaScript. More topics may come later.
```

---



## Category


| Store            | Suggested category              |
| ---------------- | ------------------------------- |
| Chrome Web Store | **Productivity** (or Education) |
| Firefox AMO      | **Productivity** (or Other)     |
| Edge Add-ons     | **Productivity**                |


---



## Keywords / tags (optional)

Useful where the store allows free-form tags:

```
interview, javascript, flashcards, spaced repetition, new tab, coding interview, frontend, developer
```

---



## Privacy policy (minimum text)

Host this on a public URL (GitHub Pages, Notion public page, or your site) and paste the URL into each store dashboard.

```
FlashTab Privacy Policy

FlashTab is a browser extension that replaces the new tab page with interview practice flash cards.

Data stored locally
• Practice progress (ratings, review schedule, streak)
• Stored only in your browser via the extension storage API

Data we do not collect
• No personal information
• No browsing history
• No analytics or tracking
• No data sent to any remote server

Contact
If you have questions about this policy, open an issue on the project repository or contact the developer listed on the store page.

Last updated: 2026-07-09
```

---



## Screenshot captions (suggested)

1. **Question view** — “A focused JavaScript question every time you open a new tab.”
2. **Answer + rating** — “Reveal the answer, then rate how well you knew it.”
3. **Session complete** — “Finish 5 cards and keep your streak going.”

---



## Manifest sync checklist

After editing this file:

- [ ] Update `extension/wxt.config.ts` → `manifest.name` = Name
- [ ] Update `extension/wxt.config.ts` → `manifest.description` = Short description (or a close ≤132-char variant)
- [ ] Rebuild / re-zip before uploading to stores
