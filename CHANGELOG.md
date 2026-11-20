# Changelog

All notable changes to Pocket Tools are listed here, newest first.

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
