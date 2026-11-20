# Weekly Digest

Your week in review as Instagram-style stories: mood, habits, spending and reading. Live at https://weeklydigest2.netlify.app

Nothing new to enter: it reads what you already log in **Mood**, **Habits**, **Spend** and **Bookshelf** (same Google account, same Firebase project).

## Features

- **Stories** for the week (Monday–Sunday, your local time): a cover, then Mood, Habits, Spend and Reading, then a wrap-up. A story with no data for that week is skipped.
  Progress segments, auto-advance (about 6 s), tap right = next, tap left = back, press and hold = pause, swipe down or ✕ = close, arrow keys and Esc on a keyboard. With “reduce motion” turned on there is no auto-advance and no animation.
- **Mood** — average, change versus last week, a day-by-day line (with “your usual” from the previous eight weeks), best day and its note.
- **Habits** — share of habits done (same rules as the Habits app: daily, weekdays, N times a week, quit habits, targets), change versus last week, a week grid per habit and streaks.
- **Spend** — total, change versus last week, monthly budget, spending by day and by category (with notable changes) and the most visited place.
- **Reading** — a swipeable carousel of every book you are reading (cover, days since you started, quotes saved for it), then what moved on your shelf this week (finished, started, added to Want to read, skipped) and quotes “+N saved” / “−N removed”. Bookshelf stores no page counts, so there are none here.
- **Wrap-up** — highlights, **Share** (a short text summary through the share sheet, or copied to the clipboard) and **Open full report** (one scrollable page with every section).
- **Earlier weeks** — the home screen lists past weeks that have data; tap one to watch its stories. For an older week the “still reading” list is rebuilt from the books’ start and finish dates.
- **Sunday reminder** — an optional Web Push notification every Sunday at 19:00 Europe/Warsaw (daylight saving time is handled). It says “Your week in review is ready” and carries no numbers; the server never reads your data.
- Google sign-in, installable PWA, light/dark mode, offline use of the last synced data.
- **Demo mode** — with a placeholder Firebase config (or `#demo` in the address) the app shows a clearly labelled sample week. Nothing is stored.

## Data it reads (Firestore, owner-only)

| Collection under `users/{uid}/` | Written by | Fields used |
|---|---|---|
| `days/{YYYY-MM-DD}` | Mood | `score`, `note` |
| `habits`, `logs/{habitId}_{year}` | Habits | habit `name`, `kind`, `start`, `freq`, `target`, `archived`, `created`; log maps `d` / `n` keyed `MM-DD` |
| `spend_expenses`, `spend_categories`, `spend_meta/settings` | Spend | `amount`, `catId`, `date`, `merchant`; category `name`; `budget` |
| `books`, `quotes` | Bookshelf | book `title`, `author`, `cover`, `status` (`queue` = Want to read, `reading`, `done` = Read, `dropped` = Skipped), `start`, `end`, `created`; quote `bookId`, `created` |

It writes one collection of its own, `users/{uid}/digest_weeks/{YYYY-Www}` with `{ quotes, ts, removed? }`. Deleting a quote leaves no trace in Firestore, so on every visit the app stores the current number of quotes. “−N removed” is the number of quotes at the previous snapshot, plus quotes created since, minus quotes now; it is only shown once a previous snapshot exists, so the first week has no “removed” figure. It counts what disappeared between visits, which can be slightly longer than the week if you did not open the app. Rules and tests: [`firebase/firestore.rules`](../../firebase/firestore.rules), [`firebase/test/rules.test.mjs`](../../firebase/test/rules.test.mjs).

## Stack

Vanilla JS bundled with esbuild · Firebase Auth + Firestore · Netlify Functions + Netlify Blobs + a scheduled function for the reminder · `web-push`.

```
public/              the site (public/app.js is the built bundle)
src/main.js          app: home, stories, report, reminder, sign-in
src/digest.js        the week maths   src/views.js  story and report HTML
src/backend.js       Firebase / demo  src/demo.js   sample data for demo mode
netlify/functions/   reminder API (/api/reminder) + hourly sender
netlify/lib/         shared push helpers
```

## Data stored

`users/{uid}/digest_weeks/{YYYY-Www}` (one small snapshot per week) and, on the server (Netlify Blobs, store `digest-reminders`, key = your Firebase uid), whether the Sunday notification is on and your Web Push subscriptions. The app only reads Mood, Habits, Spend and Bookshelf data; it never stores it. Note: it saves a new snapshot for the current week the next time you open it, so after “Delete this app’s data” one fresh snapshot appears again.

## Delete your data

Settings has an **Account & data** section (in Bookshelf: Profile), identical in every Pocket Tools app and powered by [`shared/account.js`](../../shared/account.js):

- **Export my data** downloads one JSON file with everything stored about you in *all* Pocket Tools apps.
- **Delete this app’s data** deletes only the data listed above and keeps your account.
- **Delete account** deletes the data of every app, notification subscriptions on the servers and finally your sign-in account (type `DELETE` to confirm; Google may ask you to sign in again). If any step fails the account is kept and the failed steps are shown.

Privacy policy: <https://pockettools2.netlify.app/privacy.html>. The list of collections lives in [`shared/user-data.json`](../../shared/user-data.json); if this app stores something new, register it there.

## Run locally

```bash
npm install
npm run build        # rebuilds public/app.js from src/main.js (commit the result)
npx serve public     # open http://localhost:3000/#demo for the sample week
npx netlify-cli dev  # to try the functions too
```

## Deploy

Deployed by the release workflow (`.github/workflows/release.yml`) to the Netlify site `weeklydigest2`; `netlify.toml` lists the functions directory, so the functions ship with the site. In a fork, import the repository in Netlify with **Base directory** `apps/digest` and delete `ignore = "exit 0"` from `netlify.toml`.

1. Publish the Firestore rules from [`firebase/firestore.rules`](../../firebase/firestore.rules) (the release does this when they changed).
2. Add the site’s domain to Firebase **Authorized domains** (the release workflow does this) and `https://<domain>/__/auth/handler` to the Google OAuth client’s redirect URIs (by hand, in the Google Cloud console).
3. Set the environment variables below (generate VAPID keys with `npx web-push generate-vapid-keys`). Without them the app works; only the reminder switch stays off.

### Environment variables

Same names as the Mood app. Set them on the Netlify site for this app; never commit them.

| Variable | Required | Description |
|----------|----------|-------------|
| `VAPID_PUBLIC_KEY` | for the reminder | Web Push public key |
| `VAPID_PRIVATE_KEY` | for the reminder | Web Push private key — **never commit it** |
| `VAPID_SUBJECT` | for the reminder | `mailto:` contact for the push service |
| `FIREBASE_PROJECT_ID` | for the reminder | Used to verify Firebase ID tokens |

> The Firebase web config in `public/config.js` is not a secret — it is shipped to every browser. Data is protected by the Firestore security rules.

## License

MIT — see the [root LICENSE](../../LICENSE).
