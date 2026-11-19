# Changelog

All notable changes to Pocket Tools are listed here, newest first.

## 2026-11-19

### Changed
- All apps update themselves: service workers are now network-first, and installed apps check for a new version on launch and when reopened, then reload once (never while you are typing or on a call). No more reinstalling from the home screen.

### Fixed
- Bookshelf: the book card no longer slides up a second time after opening.
- Bookshelf: closing a card no longer leaves its top edge visible under the tab bar in the installed iOS app.

### Added
- Project homepage (`site/`) with a short description of every app.
- Onboarding screens before sign-in in Mood, Habits and Bookshelf.
- "This site is powered by Netlify" and source-code links in every app.

### Changed
- All apps translated to English.

## 2026-11-19 — Initial release

- Monorepo with five apps: Video Call, Mood, Habits, Timer and Bookshelf.
- Each app deploys as its own Netlify site from `apps/<name>`.
- MIT license, Code of Conduct, contributing guide and per-app READMEs.
