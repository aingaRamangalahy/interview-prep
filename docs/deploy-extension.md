# Deploy — Browser Extension (FlashTab)

Publish FlashTab to the Chrome Web Store and Firefox Add-ons (AMO).

Store listing copy (name, short description, long description, privacy policy text) lives in:

→ `[docs/extension-store-listing.md](./extension-store-listing.md)`

---

## Architecture

```
Monorepo
   │
   ├── packages/shared/     ← bundled into the extension at build time
   └── extension/
       └── .output/
           ├── chrome-mv3/          ← production build for Chrome / Edge
           ├── chrome-mv3-dev/      ← dev build (do not submit)
           └── flashtab-*.zip       ← ready-to-submit zip (wxt zip)
```

The extension is fully **offline** (Phase 1) — no server dependency.

---



## Status — remaining technical work

Verified against the current codebase (`extension/`):


| Item                                        | Status   | Notes                                                                   |
| ------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| Name / brand = FlashTab                     | Done     | `wxt.config.ts`, UI, docs                                               |
| Manifest description                        | Done     | Short JS new-tab blurb in `wxt.config.ts`                               |
| Version `0.1.0`                             | Done     | Bump before each store upload                                           |
| Icons 16 / 32 / 48 / 128                    | Done     | `extension/public/icon-*.png` (WXT auto-discovers)                      |
| Firefox `data_collection_permissions`       | Done     | `required: ["none"]`; gecko `140.0` / android `142.0`                   |
| Privacy policy page + URL                   | **Todo** | Draft text is in `extension-store-listing.md` — still need a public URL |
| Screenshots / promo tile                    | **Todo** | Capture from loaded extension                                           |
| Smoke test (new tab, rate, streak, persist) | **Todo** | Manual — do before first submit                                         |
| Store accounts + first upload               | **Todo** | Chrome ($5), Firefox (free), Edge optional                              |
| Automated `wxt submit`                      | Optional | After first listing exists                                              |


Permissions are already correct: only `storage`. No remote code.

---



## Pre-publish checklist



### Code & assets

- [x] Extension name / description set in `extension/wxt.config.ts` (`FlashTab`)
- [x] Store listing copy drafted in `[docs/extension-store-listing.md](./extension-store-listing.md)`
- [x] Extension version bumped in `extension/package.json` if this is not the first `0.1.0` upload
- [x] Icons added to `extension/public/` (16×16, 48×48, 128×128 PNG) and registered in `wxt.config.ts` if needed
- [x] `pnpm extension:build` passes with zero errors
- [x] Load unpacked (`extension/.output/chrome-mv3`) in Chrome and open a new tab — flash cards appear
- [x] Rate all 5 cards and verify session-complete screen
- [x] Open a second new tab — streak counter increments
- [x] Close and re-open browser — progress is still there (`chrome.storage.local`)
- [x] Check for console errors on the new-tab page (DevTools → Console)



### Privacy & compliance

- [ ] Privacy policy published at a public URL (use draft in `extension-store-listing.md`)
- [x] Extension requests only the `storage` permission
- [x] No remote code execution (all JS is bundled — MV3 compliant)

---



## 1. Build the zip files

```bash
# Chrome / Edge zip
pnpm extension:zip

# Firefox zip
pnpm --filter @interview-prep/extension zip:firefox
```

Output (version comes from `extension/package.json`):

```
extension/.output/flashtab-{version}-chrome.zip
extension/.output/flashtab-{version}-firefox.zip
```

> If the zip still uses an old package name prefix, rename is fine for upload — stores care about the zip contents, not the filename. Prefer aligning `name` / branding so artifacts say `flashtab`.

---



## 2. Chrome Web Store



### One-time setup

- [ ] Create a Google developer account at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
- [ ] Pay the one-time **$5 developer registration fee**
- [ ] Accept the developer agreement



### Store listing

Copy fields from `[docs/extension-store-listing.md](./extension-store-listing.md)`:

- [ ] Name: `FlashTab`
- [ ] Short description (Summary)
- [ ] Long description (Detailed description)
- [ ] Category: **Productivity** (or Education)
- [ ] Screenshots (1280×800 or 640×400, at least 1)
  - Question view
  - Answer + rating buttons
  - Session complete
- [ ] Promotional tile (440×280 PNG, optional but recommended)
- [ ] Privacy policy URL



### Submit

- [ ] Upload `flashtab-{version}-chrome.zip`
- [ ] Submit for review
- [ ] Wait for approval (usually **1–3 business days**)

---



## 3. Firefox Add-ons (AMO)



### One-time setup

- [ ] Create a Mozilla account at [addons.mozilla.org/developers](https://addons.mozilla.org/developers)
- [ ] No fee — free to publish



### Store listing

- [ ] Reuse name / short / long description from `extension-store-listing.md`
- [ ] Same screenshots as Chrome
- [ ] Category: **Productivity** (or Other)
- [ ] Privacy policy URL



### Submit

- [ ] Upload `flashtab-{version}-firefox.zip`
- [ ] AMO automated review for simple extensions — often minutes
- [ ] Monitor for any manual review notes

---



## 4. Edge Add-ons (optional)

Edge accepts the Chrome zip.

- [ ] [partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/dashboard/microsoftedge)
- [ ] Create a developer account (free)
- [ ] Upload the same chrome zip
- [ ] Submit — review takes 1–7 business days

---



## 5. Versioning workflow (for updates)

```bash
# 1. Bump version in extension/package.json
# 2. Build + zip
pnpm extension:build
pnpm extension:zip

# 3. Upload new zip (dashboard) OR use wxt submit (below)
# 4. Submit for review
```


| Change                               | Version bump    |
| ------------------------------------ | --------------- |
| New question pack, UI tweaks         | `0.x.0` (minor) |
| Bug fixes                            | `0.x.y` (patch) |
| Phase 2 (account sync, new language) | `1.0.0` (major) |


---



## 6. Automated publishing (optional, after first listing)

WXT can upload zips via `wxt submit` ([docs](https://wxt.dev/guide/essentials/publishing)).

**Does automate:** zip upload + submit for review (Chrome / Firefox / Edge)  
**Does not automate:** first-time listing, screenshots, privacy URL, store accounts

```bash
cd extension
pnpm exec wxt submit init    # creates .env.submit (keep out of git)

pnpm zip
pnpm zip:firefox

pnpm exec wxt submit --dry-run \
  --chrome-zip .output/flashtab-0.1.0-chrome.zip \
  --firefox-zip .output/flashtab-0.1.0-firefox.zip

pnpm exec wxt submit \
  --chrome-zip .output/flashtab-0.1.0-chrome.zip \
  --firefox-zip .output/flashtab-0.1.0-firefox.zip
```

If Chrome OAuth from `submit init` fails, generate keys with:

```bash
npx chrome-webstore-upload-keys
```

Then put `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` into `.env.submit`.

---



## 7. Useful links


| Resource                             | URL                                                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Store listing copy                   | `[docs/extension-store-listing.md](./extension-store-listing.md)`                                              |
| Chrome Web Store Developer Dashboard | [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)                 |
| Chrome MV3 publishing guide          | [https://developer.chrome.com/docs/webstore/publish](https://developer.chrome.com/docs/webstore/publish)       |
| Firefox AMO Developer Hub            | [https://addons.mozilla.org/developers](https://addons.mozilla.org/developers)                                 |
| Edge Partner Center                  | [https://partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/dashboard/microsoftedge) |
| WXT publishing                       | [https://wxt.dev/guide/essentials/publishing](https://wxt.dev/guide/essentials/publishing)                     |


---



## Environment reference


| Variable               | Value                             | Notes                               |
| ---------------------- | --------------------------------- | ----------------------------------- |
| `manifest.version`     | `extension/package.json`          | Bump before each submission         |
| `manifest.name`        | `wxt.config.ts`                   | Must match store name: FlashTab     |
| `manifest.description` | `wxt.config.ts`                   | Keep in sync with short description |
| `manifest.permissions` | `["storage"]`                     | Only permission needed for Phase 1  |
| Store copy             | `docs/extension-store-listing.md` | Name, short, long, privacy draft    |


