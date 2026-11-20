# Mood

Rate your day from 0 to 10, add an optional note, and see how your mood changes over weeks, months and years.

## Features

- **Today screen** — one big score, a 0–10 scale and a short label; edit or delete a rating; rate *yesterday* if you remember after midnight.
- **Statistics** — week / month / year views with averages, comparison with the previous period, best day and an interactive chart.
- **Daily reminder** via Web Push at the hour you choose — skipped if the day is already rated.
- **Offline-first** — ratings are saved on the device and synced to Firebase later.
- Google sign-in, dark mode, installable PWA.
- **Demo mode** — with placeholder config the app runs without sign-in and keeps data on the device only.

## Stack

Vanilla JS bundled with esbuild · Firebase Auth + Firestore · Netlify Functions + Netlify Blobs + scheduled function for reminders · `web-push`.

```
public/              the site (public/app.js is the built bundle)
src/main.js          app source → npm run build
netlify/functions/   reminder API + hourly sender
netlify/lib/         shared push helpers
```

## Data stored

`users/{uid}/days/{YYYY-MM-DD}` (score 0–10, note), `users/{uid}/mood_consent/consent` (`{ at, version }`: when you agreed to cloud storage; Mood asks once, before the first entry is saved, and asks again if the consent text version changes). On the server (Netlify Blobs, store `reminders`, key = your Firebase uid): reminder hour, time zone, whether it is on, the last rated day and your Web Push subscriptions. `POST /api/reminder` also understands `export` and `delete` (Firebase ID token required, verified server-side); the other apps call `delete` when you delete your account.

## Delete your data

Settings has an **Account & data** section (in Bookshelf: Profile), identical in every Pocket Tools app and powered by [`shared/account.js`](../../shared/account.js):

- **Export my data** downloads one JSON file with everything stored about you in *all* Pocket Tools apps.
- **Delete this app’s data** deletes only the data listed above and keeps your account.
- **Delete account** deletes the data of every app, notification subscriptions on the servers and finally your sign-in account (type `DELETE` to confirm; Google may ask you to sign in again). If any step fails the account is kept and the failed steps are shown.

Privacy policy: <https://pockettools2.netlify.app/privacy.html>. The list of collections lives in [`shared/user-data.json`](../../shared/user-data.json); if this app stores something new, register it there.

## Run locally

```bash
npm install
npm run build        # rebuilds public/app.js from src/main.js
npx netlify-cli dev
```

## Deploy your own

1. Create a Firebase project with Google sign-in and Firestore; publish the rules from [`firebase/firestore.rules`](../../firebase/firestore.rules).
2. Put your Firebase web config into `public/config.js` and your project ID into `public/_redirects`.
3. Netlify → import this repository → **Base directory** `apps/mood`.
   In a fork, delete `ignore = "exit 0"` from `netlify.toml` first — this repository deploys with release tags instead of Netlify Git builds.
4. Set environment variables (generate VAPID keys with `npx web-push generate-vapid-keys`):

| Variable | Description |
|----------|-------------|
| `VAPID_PUBLIC_KEY` | Web Push public key |
| `VAPID_PRIVATE_KEY` | Web Push private key — **never commit it** |
| `VAPID_SUBJECT` | `mailto:` contact for the push service |
| `FIREBASE_PROJECT_ID` | Used to verify Firebase ID tokens |

5. Add your Netlify domain to Firebase **Authorized domains** and to the Google OAuth client redirect URIs (`https://<site>/__/auth/handler`).

A detailed step-by-step guide in Russian is in [README.ru.md](README.ru.md).

> The Firebase web config in `public/config.js` is not a secret — it is shipped to every browser. Data is protected by the Firestore security rules.

## License

MIT — see the [root LICENSE](../../LICENSE).
