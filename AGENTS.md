# Agent guide for Pocket Tools

Instructions for AI coding agents (and humans) working in this repository. Read this before changing anything.

## What this is

A monorepo of small, independent PWAs. Each app is its own Netlify site, deployed from its folder:

| Folder | Netlify site | Build |
|---|---|---|
| `apps/videocall` | facetime2.netlify.app | none — plain HTML/JS |
| `apps/timer` | timerr2.netlify.app | none — `public/` is served as is |
| `apps/mood` | moodlog2.netlify.app | esbuild bundle + Netlify Functions |
| `apps/habits` | habitslog2.netlify.app | esbuild bundle |
| `apps/bookshelf` | shelff2.netlify.app | esbuild bundle |
| `apps/spend` | spendlog2.netlify.app | esbuild bundle |
| `apps/digest` | weeklydigest2.netlify.app | esbuild bundle + Netlify Functions |
| `apps/routes` | pocketroutes2.netlify.app | esbuild bundle + Netlify Functions |
| `site` | pockettools2.netlify.app | none — project homepage |

`firebase/firestore.rules` holds the Firestore security rules shared by the Firebase apps, with tests in `firebase/test/` (run on the emulator by CI and before every publish). Never loosen a rule without a reason: every collection must stay readable and writable only by its owner (`request.auth.uid`). Add tests for every new collection.

`shared/` holds files copied into several apps (`nozoom.js`, `onboarding.js`, `config.js`, and for the Firebase apps `account.js` and `user-data.json`). Edit them there and run `npm run sync-shared`; never edit a copy.

## Rules

1. **Apps are independent.** Never import files from another app's folder. Shared code is copied, not linked — each folder must deploy on its own with its own Base directory.
2. **Bundled apps (Mood, Habits, Bookshelf, Spend, Digest, Routes): edit `src/main.js`, never `public/app.js` directly.** Then run `npm install` (first time) and `npm run build` inside the app folder, and commit the rebuilt `public/app.js`. Netlify does not run the build.
3. **Bump the service-worker cache after every change to an app** — the `CACHE` constant at the top of its `sw.js` (e.g. `mood-v5` → `mood-v6`). Service workers are network-first, and each app checks for a new `sw.js` on launch and when it returns to the foreground; a changed `sw.js` is what triggers the automatic one-time reload on users' phones. Keep the auto-update registration block at the end of each app's main script. The number in `CACHE` is also the app version shown at the bottom of every app (the page asks the running service worker for it), so bump it by one each time.
4. **No inline scripts.** `_headers` sets a Content-Security-Policy with `script-src 'self'`. All JavaScript goes in separate `.js` files referenced with `<script src>`. Inline `<script>` blocks and `onclick=` attributes will not run. If a new external host is needed, update `_headers` too.
5. **Keep the required links.** Every app's main screen must show "This site is powered by Netlify" (link to https://www.netlify.com) and "Open source on GitHub". This is a condition of the Netlify Open Source plan — do not remove or hide them.
6. **Secrets never go in the repo.** The Firebase web config in `public/config.js` is public by design (it is not a secret). Everything else — VAPID keys, tokens, passwords — lives only in Netlify environment variables and is documented in the app's README.
7. **English only.** UI text, comments, commit messages and docs are in English (the `README.ru.md` setup guides are the one exception). Use typographic apostrophes (`’`) inside single-quoted JS strings, or switch to template literals.
8. **Data compatibility.** Users already have data in Firestore. Don't rename stored fields or values without a migration. Bookshelf maps legacy Russian format/genre values via `LEGACY` in `src/main.js`; Russian aliases in import parsers are intentional.
9. **Never push to `main`.** Work on a branch (`fix/…`, `feat/…`, `ci/…`), open a pull request and merge it only when the **CI ok** check is green. `main` is protected by a ruleset.
10. **Merging never deploys; releases do.** Each production deploy costs Netlify credits, so batch merged work into one release (see below).
11. **Every app is on the homepage.** A new app gets a card in `site/index.html` (link to its Netlify site, icon in `site/icons/`, one-line description) and a row in the README table. `npm run new-app` adds both; CI fails if an app has no card.

## iOS UI pitfalls

Rules for every app (the apps are used as home-screen PWAs on iPhones):

- **No floating pills, banners or toasts over maps or lists.** They cover content and "keep resetting". Put such toggles in Settings or in the normal page layout. Over a map only the round Back and Locate buttons may float.
- **Mind the keyboard.** iOS does not shrink the layout viewport when the keyboard opens, and iOS 26 adds a floating accessory bar (arrows, Done) above it. Use `window.visualViewport` to measure the covered height (add about 56 px for the bar), give the bottom of the page and of dialogs that much padding (see `--kb` in Routes) and scroll the active field into view. Put each text field in its own `<form>` (with a `submit` handler that calls `preventDefault`) so the bar has no previous/next arrows to other fields.
- **No page rubber-band on full-screen layouts.** `overscroll-behavior: none` on `html`/`body` and `contain` on scroll containers, `100dvh` (not `100vh`) for full-height screens, and `position: fixed` on the body while a full-screen map screen is shown. The page must never scroll underneath a map.
- **Bottom sheets must collapse to a peek bar.** Snap points expanded / half / collapsed, drag handle with swipe velocity, a real toggle button with `aria-expanded`, content scrolls inside the sheet only when expanded, and `prefers-reduced-motion` is respected (see `apps/routes/src/sheet.js`).
- **Touch targets are at least 44 x 44 px.**

## User data (GDPR)

Every app that stores user data in Firebase or on a server must be listed in `shared/user-data.json` (its Firestore collections under `users/{uid}/`, any other Firestore documents it owns, and any server-side store such as Netlify Blobs) and must offer an **Account & data** section with *Export my data*, *Delete this app's data* and *Delete account*. The code is shared: `shared/account.js` is copied into each bundled app's `src/` (via `shared/manifest.json`); import `initAccount` from `./account.js`, put `<div data-pta-host></div>` in the settings screen and call `initAccount({ app, getUser, getFirebase, demoKeys, stopListening })` (see Mood, Spend or Digest). A new Firebase app made with `npm run new-app -- … --firebase` is registered and wired up for this automatically; fill in its collections. CI (`pt.py check`) fails if a collection in `firebase/firestore.rules` is missing from the registry, so nothing can be added that "Delete account" would miss. A server-side store must also answer authenticated `export` and `delete` actions like `apps/mood/netlify/functions/reminder.mjs`. If you add a new kind of personal data, update `site/privacy.html` and the app's README ("Data stored", "Delete your data"). `npm run test:account` tests the export and delete logic.

## Releases

Netlify never builds from Git (`ignore = "exit 0"` in every `netlify.toml`). `.github/workflows/release.yml` deploys with the Netlify CLI. Releasing is a manual decision; everything after it is automatic.

- **Normal release: Actions → Release → Run workflow** (action `release`, the default; works from a phone). It deploys what changed on `main` since the last `v*` tag and, once everything is deployed, tags `main` as `vYYYY.MM.DD` (`.2`, `.3` … for more releases on one day). If nothing deployable changed it stops without a tag (tick `force` to tag anyway).
- A `v*` tag created any other way deploys the same way: `npm run release` (`scripts/release.mjs`: shows the commits and folders that would ship, asks, tags `origin/main`, pushes; `--dry-run`, `--yes`, `--force`), or GitHub → Releases → Draft a new release with a new `v…` tag on `main`.
- Action `redeploy` is an emergency redeploy of `main`: fill in `apps` with `all` or folders (e.g. `apps/spend site`); it creates no tag and does not touch the Firestore rules.
- "Shipped files" are an app's publish directory and functions. README/Markdown, `src/`, tests and package files alone never trigger a deploy — but a rebuilt `public/app.js` does.
- Firestore rules are published in a release run (button or tag), only when they changed since the previous tag, and only after their tests pass.
- `.github/workflows/monitor.yml` checks every morning that all sites answer and run the latest release, and opens an issue if not.

Tools: `npm run release` (tag from the command line), `npm run new-app` (new app from `apps/_template`, registered everywhere), `npm run sync-shared`, `npm run check`, `npm run test:smoke`, `npm run test:rules`, `npm run test:account`. Dependabot opens monthly update PRs; an app dependency update needs a rebuild and a CACHE bump before CI passes.

## Before committing

- `node --check` on any plain JS file you changed; `npm run build` for bundled apps (must finish without errors).
- `npm run check` (the same checks CI runs), plus `npm run test:rules` when the rules change.
- Open the app locally (`npx serve <folder>`) and check the changed screen in a mobile-sized window. Firebase apps run in demo mode if `config.js` has a placeholder key.
- Make sure no secrets slipped in. Cyrillic is caught by `npm run check`; intentional Russian aliases carry a `cyrillic-ok` comment.
- Update `CHANGELOG.md` for user-visible changes.

## Each app's README

Every `apps/<name>/README.md` describes features, local setup, deployment and environment variables. Keep it in sync when behavior or setup changes.
