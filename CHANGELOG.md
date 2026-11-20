# Changelog

All notable changes to Pocket Tools are listed here, newest first.

## 2026-11-20

- Weekly Digest: new app. Your week (Monday to Sunday) as Instagram-style stories — mood, habits, spending and reading — built from what you already log in Mood, Habits, Spend and Bookshelf, with comparisons to the previous week, a share button, a full report and a Sunday 19:00 (Warsaw time) push notification that carries no personal numbers. Firestore rules: new owner-only `digest_weeks` collection (a small snapshot per week, used to count removed quotes).
- Repository: Actions → Release → Run workflow now tags `main` and deploys in one run, so a release needs no command line.
- Repository: releases are now tagged manually and deployed automatically. `npm run release` tags the latest `main` (`vYYYY.MM.DD`) and pushes the tag, or create a release on GitHub (also from a phone); a new `v*` tag deploys the folders that changed. The Release workflow no longer creates tags, and its “Run workflow” button is only for emergency redeploys.
- Repository: `main` is protected — changes go through pull requests with CI (repository checks, bundle check, iPhone WebKit smoke tests, Firestore rules tests on the emulator). Deploys happen only through the Release workflow / `v*` tags, and only for folders whose shipped files changed. Added `shared/`, `npm run new-app`, Dependabot and a daily site monitor.
- Bookshelf: “Dropped” is now “Skipped”, and skipped books are hidden from Read; the Skipped chip shows them again.
- Lightmeter removed: browsers on iPhone do not report the camera’s exposure, so readings could not be made reliable.
- Lightmeter: tapping a value on a dial selects it again (it used to snap back).
- Lightmeter: the camera stream is kept (paused) when you leave the meter, switch to Manual or lock the phone, so iPhone stops asking for camera access each time.
- Lightmeter: dials only move sideways — no more dragging values up or down out of the row.
- All apps: pinch-zoom and double-tap zoom are blocked (`nozoom.js`, viewport and `touch-action: pan-x pan-y`).
- Lightmeter: dials no longer get scrolled by new light readings while you turn them, so they always snap to a value; iPhone haptic uses a fresh hidden switch each time.
- Spend: amounts from iOS Shortcuts are parsed even with a currency symbol or thousands separators ("23,49 zł", "PLN 1 234,56").
### Lightmeter
- Dials snap precisely onto a value after you let go.
- Haptic ticks while turning a dial (Android) and a tick when the finger lifts (iPhone, iOS 18+).
- The value you turned last now stays put when the light changes: turn the shutter for shutter priority, the aperture for aperture priority.
- Fixed: long shutter speeds such as 1/1000 wrapped onto two lines and were cut off.

## 2026-11-20

### Added
- **Spend** (spendlog2.netlify.app): log an expense in two taps — amount, then category. Your own categories (add, recolor, reorder), notes and dates, a monthly view with an optional budget, CSV export, and Apple Pay payments filled in through a Shortcuts automation with per-shop rules.
- **Lightmeter** (lightmeter2.netlify.app): exposure meter for film cameras. Spot (tap) or average (double-tap) metering with the phone camera, a manual EV mode, lockable ISO / aperture / shutter in ⅓ stops limited to your camera and lens, out-of-range warnings, calibration, and a journal of frames per roll.

## 2026-11-19

### Changed
- All apps feel more native: text can no longer be selected (except links and input fields), there is no long-press menu on regular text, and double-tap no longer zooms the page. Pinch-to-zoom still works.
- All apps update themselves: service workers are now network-first, and installed apps check for a new version on launch and when reopened, then reload once (never while you are typing or on a call). No more reinstalling from the home screen.

### Fixed
- Bookshelf: the book card no longer slides up a second time after opening.
- Bookshelf: closing a card no longer leaves its top edge visible under the tab bar in the installed iOS app.

### Added
- Every app shows its version (e.g. “v7”) at the bottom of the sign-in/settings screen, so it is easy to see whether an update has arrived.
- Project homepage (`site/`) with a short description of every app.
- Onboarding screens before sign-in in Mood, Habits and Bookshelf.
- "This site is powered by Netlify" and source-code links in every app.

### Changed
- All apps translated to English.

## 2026-11-19 — Initial release

- Monorepo with five apps: Video Call, Mood, Habits, Timer and Bookshelf.
- Each app deploys as its own Netlify site from `apps/<name>`.
- MIT license, Code of Conduct, contributing guide and per-app READMEs.
