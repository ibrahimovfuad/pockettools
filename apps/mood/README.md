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
