# FlashTab — Browser Extension

New-tab Chrome/Firefox extension: 5 JavaScript flash cards every time you open a tab.

## Phase 1 (current)

- Offline only — questions bundled from `@interview-prep/shared`
- Progress stored in `chrome.storage.local`
- No auth, no API calls

## Develop

```bash
# from repo root
pnpm extension:dev

# or
cd extension && pnpm dev
```

This runs a watch-build: it rebuilds automatically whenever you change any source file (~400 ms per build). Then load it once in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select `extension/.output/chrome-mv3`
4. Open a new tab — flash cards appear

After that, every time `pnpm dev` prints "built in …ms", hit **↺ reload** on the extension card in `chrome://extensions` (or press `Alt+R` if you have the reload shortcut set up).

> **Why not `wxt dev`?** Chrome 126+ blocks `http://` script sources in MV3 extension CSP, which causes the Vite HMR dev server to be blocked, leaving a blank page. The watch-build approach uses production builds that bypass this restriction entirely.

## Package for stores

```bash
pnpm extension:zip
```
