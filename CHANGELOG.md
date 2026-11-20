# Changelog

All notable changes to Pocket Tools are listed here, newest first.

## 2026-11-20

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
