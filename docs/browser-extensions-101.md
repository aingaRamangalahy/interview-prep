# How Browser Extensions Work — 101

Focused on **new-tab extensions** (like daily.dev, Momentum, FlashTab).

---

## The manifest — the heart of any extension

Every extension starts with a `manifest.json`. It tells the browser:
- What the extension is allowed to do
- Which files handle which roles
- Which permissions it needs

```json
{
  "manifest_version": 3,
  "name": "FlashTab",
  "version": "1.0.0",
  "description": "5 flash cards every time you open a new tab",

  "chrome_url_overrides": {
    "newtab": "newtab.html"
  },

  "permissions": ["storage"],

  "icons": {
    "16":  "icons/16.png",
    "48":  "icons/48.png",
    "128": "icons/128.png"
  }
}
```

The key line for a new-tab extension:

```json
"chrome_url_overrides": { "newtab": "newtab.html" }
```

This replaces Chrome/Firefox's built-in new tab page with your own HTML file.

---

## Extension anatomy — the 4 key pieces

```
extension/
├── manifest.json           ← registry / config
├── newtab.html             ← the page that replaces new tab
├── newtab.js               ← JS bundle for the new tab page
├── background.js           ← invisible persistent (or event-driven) script
├── content_script.js       ← runs inside real web pages (optional)
└── popup.html              ← the small UI when user clicks extension icon (optional)
```

### 1. New tab page (`newtab.html` + its JS)

This is a **normal HTML page** — just like any web page. It can use:
- Any framework: Vue, React, Svelte, Vanilla JS
- CSS, fonts, images
- Fetch API (with permission)
- `chrome.storage` (not `localStorage` — see below)

It is sandboxed: it cannot read cookies or localStorage from other origins.

### 2. Background script (`background.ts`)

Runs silently in the background, without any UI.

In Manifest V3 it's a **Service Worker** (ephemeral, wakes on events):

```ts
// background.ts
chrome.alarms.create('daily-reminder', { periodInMinutes: 1440 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily-reminder') {
    chrome.notifications.create({
      type: 'basic',
      title: 'FlashTab',
      message: 'Your daily 5 questions are waiting!',
      iconUrl: 'icons/128.png'
    })
  }
})
```

Use cases: alarms, badge updates, background syncs, message routing.

### 3. Content script (optional for us)

Injected into actual websites. Can read/modify the DOM of any page you visit.  
Not needed for a new-tab extension — we own the entire page.

### 4. Popup (optional for us)

Tiny HTML page that appears when the user clicks the extension icon in the toolbar.  
Could be used later for quick settings or "connect account" shortcut.

---

## Storage — why NOT localStorage

In an extension, **never use `localStorage`** for anything you want to keep.

| Storage | Accessible from | Persists across | Shared between scripts |
|---------|----------------|-----------------|----------------------|
| `localStorage` | only that exact HTML origin | page sessions | NO — each page has its own |
| `chrome.storage.local` | any extension context | forever | YES |
| `chrome.storage.sync` | any extension context | synced across devices via Google account | YES |
| `chrome.storage.session` | any extension context | until browser closes | YES |

Use `chrome.storage.local` for progress, ratings, streak data.  
Use `chrome.storage.sync` for settings the user wants on every device.

```ts
// Writing
await chrome.storage.local.set({ progress: { q1: 4, q2: 5 } })

// Reading
const { progress } = await chrome.storage.local.get('progress')

// WXT abstraction (cleaner API, same underlying storage)
const progress = storage.defineItem<Record<string, number>>('local:progress', {
  defaultValue: {}
})
await progress.setValue({ q1: 4 })
const val = await progress.getValue()
```

---

## Permissions

The `permissions` array in `manifest.json` controls what APIs your extension can use.

| Permission | What it unlocks |
|------------|----------------|
| `storage` | `chrome.storage.*` |
| `alarms` | `chrome.alarms` (scheduled tasks) |
| `notifications` | desktop notifications |
| `identity` | OAuth flows for login |
| `tabs` | read/manipulate browser tabs |

Fewer permissions = easier Chrome Web Store review and more user trust.  
For Phase 1 we only need `"storage"`.

---

## Manifest V3 vs V2

Chrome mandates **Manifest V3** for all new extensions. Firefox supports both.

Key differences that affect us:

| Feature | MV2 | MV3 |
|---------|-----|-----|
| Background script | persistent page | service worker (ephemeral) |
| Remote code | allowed | blocked — all JS must be bundled |
| `eval()` / dynamic JS | allowed | blocked |
| `webRequest` blocking | allowed | replaced by `declarativeNetRequest` |

**Impact for FlashTab:** minimal. We don't need remote code or request blocking. The only thing to be aware of: the background service worker **can be killed at any time** by the browser. Don't store critical state in memory there — always write to `chrome.storage` immediately.

---

## How a new-tab extension loads

```
User opens new tab
        │
        ▼
Chrome intercepts "new tab" URL
        │
        ▼
Looks up: does any installed extension override chrome_url_overrides.newtab?
        │
        ▼  (yes)
Loads extension's newtab.html in a new privileged tab context
        │
        ▼
newtab.html loads JS bundle (built with Vite/WXT)
        │
        ▼
Vue app mounts → reads chrome.storage.local → renders flash cards
```

The page has its own isolated JS context (no access to other tabs' data), but full access to `chrome.*` APIs.

---

## Development loop

With **WXT** (our chosen build tool):

```bash
pnpm dev   # starts Vite dev server + auto-loads extension in Chrome with HMR
```

Under the hood:
1. Vite builds `newtab.html` + JS bundle into `.output/chrome-mv3/`
2. WXT opens Chrome and loads the extension from that folder
3. When you change a `.vue` file → HMR updates the new-tab page live
4. When you change `manifest.json` / background → WXT reloads the extension

For manual load without WXT:
1. Build your JS (`vite build`)
2. Go to `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** → point to your build output folder
5. Open a new tab → you see your extension

---

## Packaging for the stores

```bash
# WXT produces a ready-to-submit zip
pnpm zip           # → .output/flashtab-1.0.0-chrome.zip
pnpm zip:firefox   # → .output/flashtab-1.0.0-firefox.zip
```

### Chrome Web Store
1. [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
2. Pay one-time $5 developer fee
3. Upload zip → fill store listing (screenshots, description)
4. Submit → review takes 1-3 business days
5. Published → users install from the store

### Firefox Add-ons (AMO)
1. [addons.mozilla.org/developers](https://addons.mozilla.org/developers)
2. Free
3. Upload zip → automated review for simple extensions (often instant)
4. Published

---

## Security model — what the extension CAN and CANNOT do

**CAN:**
- Read/write its own `chrome.storage`
- Make fetch requests to any URL it has `host_permissions` for
- Replace the new tab page
- Show desktop notifications (with permission)

**CANNOT:**
- Read cookies or localStorage from websites you visit (unless it's a content script with host permissions — which we don't use)
- Execute remote code (MV3 restriction)
- Access other extensions' storage

For our extension: the attack surface is tiny. We don't inject into pages, we don't read browsing history, we don't send data anywhere (Phase 1). This makes the Chrome Web Store review easy.

---

## Phase 2 — Auth in an extension

When we add GitHub login:

```ts
// Using chrome.identity.launchWebAuthFlow
const redirectUrl = chrome.identity.getRedirectURL()
// → https://abcdef.chromiumapp.org/

const authUrl = `https://github.com/login/oauth/authorize`
  + `?client_id=YOUR_CLIENT_ID`
  + `&redirect_uri=${encodeURIComponent(redirectUrl)}`
  + `&scope=read:user`

chrome.identity.launchWebAuthFlow(
  { url: authUrl, interactive: true },
  (responseUrl) => {
    const code = new URL(responseUrl).searchParams.get('code')
    // Exchange code for token via your SaaS API
    // Store token in chrome.storage.local
  }
)
```

The browser handles the OAuth popup. The user never leaves Chrome. The token is stored securely in `chrome.storage.local` (inaccessible to web pages).

---

## Key files reference

| File | Purpose |
|------|---------|
| `manifest.json` | Extension registry, permissions, entry points |
| `newtab.html` | New tab override page |
| `background.ts` | Service worker for alarms, notifications, sync |
| `wxt.config.ts` | Vite + WXT build config (generates manifest) |
| `chrome.storage.local` | Persistent local storage for progress |
| `chrome.storage.sync` | Cross-device synced settings |
