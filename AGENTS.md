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
| `site` | pockettools2.netlify.app | none — project homepage |

`firebase/firestore.rules` holds the Firestore security rules shared by Mood, Habits and Bookshelf (published manually in the Firebase console).

## Rules

1. **Apps are independent.** Never import files from another app's folder. Shared code is copied, not linked — each folder must deploy on its own with its own Base directory.
2. **Bundled apps (Mood, Habits, Bookshelf): edit `src/main.js`, never `public/app.js` directly.** Then run `npm install` (first time) and `npm run build` inside the app folder, and commit the rebuilt `public/app.js`. Netlify does not run the build.
3. **Bump the service-worker cache after every change to an app** — the `CACHE` constant at the top of its `sw.js` (e.g. `mood-v5` → `mood-v6`). Service workers are network-first, and each app checks for a new `sw.js` on launch and when it returns to the foreground; a changed `sw.js` is what triggers the automatic one-time reload on users' phones. Keep the auto-update registration block at the end of each app's main script. The number in `CACHE` is also the app version shown at the bottom of every app (the page asks the running service worker for it), so bump it by one each time.
4. **No inline scripts.** `_headers` sets a Content-Security-Policy with `script-src 'self'`. All JavaScript goes in separate `.js` files referenced with `<script src>`. Inline `<script>` blocks and `onclick=` attributes will not run. If a new external host is needed, update `_headers` too.
5. **Keep the required links.** Every app's main screen must show "This site is powered by Netlify" (link to https://www.netlify.com) and "Open source on GitHub". This is a condition of the Netlify Open Source plan — do not remove or hide them.
6. **Secrets never go in the repo.** The Firebase web config in `public/config.js` is public by design (it is not a secret). Everything else — VAPID keys, tokens, passwords — lives only in Netlify environment variables and is documented in the app's README.
7. **English only.** UI text, comments, commit messages and docs are in English (the `README.ru.md` setup guides are the one exception). Use typographic apostrophes (`’`) inside single-quoted JS strings, or switch to template literals.
8. **Data compatibility.** Users already have data in Firestore. Don't rename stored fields or values without a migration. Bookshelf maps legacy Russian format/genre values via `LEGACY` in `src/main.js`; Russian aliases in import parsers are intentional.
9. **Deploys cost credits.** Each successful production deploy of an app costs Netlify credits, and every push to `main` that touches an app folder deploys it. Group changes into as few commits/pushes as possible; changes outside `apps/` and `site/` (root docs, `.github/`) don't deploy anything.

## Before committing

- `node --check` on any plain JS file you changed; `npm run build` for bundled apps (must finish without errors).
- Open the app locally (`npx serve <folder>`) and check the changed screen in a mobile-sized window. Firebase apps run in demo mode if `config.js` has a placeholder key.
- Make sure no Cyrillic UI text or secrets slipped in: `grep -rnP '[А-Яа-яЁё]' apps/*/src apps/*/public/*.html`.
- Update `CHANGELOG.md` for user-visible changes.

## Each app's README

Every `apps/<name>/README.md` describes features, local setup, deployment and environment variables. Keep it in sync when behavior or setup changes.
