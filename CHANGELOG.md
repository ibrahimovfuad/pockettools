# Changelog

All notable changes to Pocket Tools are listed here, newest first.

## 2026-11-21

Security hardening after an audit.

- Bookshelf: friends links are treated as untrusted input. A public shelf is cleaned before it is shown (known fields only, ratings 0–5, statuses from the known set, covers and photos only as https links, valid dates and ids, capped lengths), every value is escaped where it is put into a page, and the reason for skipping a book is published only together with ratings and reviews. Turning a link off or making a new one now shows an error if the old shelf could not be removed. Importing a backup keeps only safe ids and known fields.
- Firestore rules: habits, check-ins, books, quotes and the Bookshelf profile accept only the fields the apps write, with sizes limited; friends-link documents need a well-formed id, known fields and bounded lists, and an owner can list only their own shelves (used by Delete account to find old ones). The removed Lightmeter collections can now only be read and deleted. Nobody can list the users collection. Rules tests cover every change.
- All Firebase apps: Sign out now also stops Firestore and deletes the offline copy of your data on the device (unsent changes get a few seconds to reach the server first), then reloads. Bookshelf also empties its cover cache and keeps at most 200 covers.
- Delete account (Bookshelf): also removes older friends-link shelves that still carry your account id.
- Mood and Weekly Digest reminders: only real push services (Google, Apple, Mozilla, Windows) are accepted as notification addresses; key and request sizes are limited; every send has a timeout and a time budget and runs in parallel; devices that fail five times in a row are dropped; test notifications are limited to one every 30 seconds; sign-in tokens must be RS256-signed.
- Routes: the Transitous and vehicle proxies limit each visitor to 60 requests a minute, clamp numeric parameters, always answer as JSON with `nosniff`, and look up endpoints safely.
- Video Call: new links use 20 random characters from the browser's cryptographic generator (links made earlier keep working). An incoming call now has to be answered with a button; a second caller while a call is on is turned away instead of replacing it.
- Spend: a link with ?amount=…&merchant=… never saves by itself any more: a known shop pre-selects its category and one tap on Save confirms it. CSV export protects cells that start with = + - @ so spreadsheets do not run them as formulas.
- All sites: Content-Security-Policy now also sets object-src, base-uri, form-action and frame-ancestors; every response gets X-Content-Type-Options, Referrer-Policy and a Permissions-Policy (camera and microphone only for Video Call, camera for the Bookshelf scanner, location and motion only for Routes).
- Privacy page: mentions the OpenStreetMap tile fallback in Routes, the vehicle-position lookup and the account identifier stored with a friends link.
- Repository: the release workflow gives secrets only to the steps that need them, installs without install scripts, uses pinned CLIs from `tools/deploy`, refuses commits that are not on main, runs its secret-using jobs in the `production` environment and no longer expands expressions inside scripts. New `SECURITY.md` details and a Security section in AGENTS.md. CI reports (does not fail on) `npm audit` findings and has tests for the push helpers (`npm run test:push`).

## 2026-11-20

- Routes: many more connection options. One search now asks the routing service several slightly different questions at once (30-minute window with at least 8 options; only stops within a 5-minute walk; no changes at all; trains only) and merges the answers, because the service otherwise returns only the "best" few and drops useful alternatives such as a direct bus with a shorter walk or an S/R/KM train. Results are listed by departure time with the best connection (earliest arrival) highlighted, and "Later connections" loads the next window of every query.
- Routes: removed the floating "Enable direction" button from the map. Direction is controlled only by Settings → Show my direction; on iPhone the compass permission is requested silently on the first tap on the map (or when switching the setting on) and a refusal is remembered, with a "Try again" button in Settings. The direction beam is smoothed and no longer resets when you open another screen.
- Routes: fixes in the route details: the train line badge no longer overlaps the step text, service alerts show as "Service alert" with the full text on tap, walking steps name the start and destination you searched for instead of "END", and result cards wrap cleanly.
- Routes: address search results now show kind (Address, Stop, Place) with a different icon, street, district/neighbourhood, postcode and city (and region when needed); duplicates are merged and places in or near the chosen city come first.
- Routes: the route and live-tracking screens use a proper bottom sheet (expanded, half, collapsed to a peek bar) so the map can be seen almost full screen; the page no longer rubber-bands over the map. The on-screen keyboard (and the iOS accessory bar) no longer covers the bottom of search results or dialogs.
- Repository: new "iOS UI pitfalls" section in AGENTS.md (no floating pills over content, keyboard accessory bar, page rubber-band, bottom sheets, touch targets), linked from CONTRIBUTING.md.
- Routes: new app. Ad-free public transport journey planner for Polish cities: routes, stop departures, a map with your position and direction, and live tracking of one vehicle while the app is open (Transitous routing data, OpenFreeMap/OpenStreetMap map; GPS positions for Warsaw buses and trams when an API key is configured, otherwise live-timetable or estimated positions). Works without an account; optional Google sign-in syncs saved places, search history and settings. Firestore rules: new owner-only `routes_places` and `routes_meta` collections.
- All Firebase apps (Mood, Habits, Bookshelf, Spend, Weekly Digest): new **Account & data** section with *Export my data* (one JSON file with your data from every Pocket Tools app), *Delete this app’s data* and *Delete account* (deletes every app’s data, notification subscriptions, Bookshelf’s public link and your sign-in account; shows progress and reports any failure). Privacy policy added at `site/privacy.html`, linked from the homepage, every sign-in screen and every settings screen.
- Mood: asks for explicit consent once before the first entry is saved (existing users see it once on their next launch); the consent is stored in your own data (`users/{uid}/mood_consent/consent`). Firestore rules: new owner-only, validated `mood_consent` collection. The reminder function also answers `export` and `delete` (Firebase ID token required), and allows calls from the other Pocket Tools apps.
- Repository: `shared/user-data.json` lists everything stored per user; CI fails if a Firestore collection is missing from it. New `npm run test:account`.
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
