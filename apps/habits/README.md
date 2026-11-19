# Habits

A habit tracker: tick off habits every day, keep streaks going and watch your progress grow.

## Features

- Daily or weekly habits with schedules — scheduled days off don't break a streak.
- Streaks in days or weeks, history and per-habit detail view.
- Google sign-in, data synced through Firebase Firestore.
- Dark mode, installable PWA. UI language: Russian.

## Stack

Vanilla JS bundled with esbuild · Firebase Auth + Firestore.

```
public/        the site (public/app.js is the built bundle)
src/main.js    app source → npm run build
```

## Run locally

```bash
npm install
npm run build
npx serve public
```

After changing the app, bump the cache version in `public/sw.js` so installed copies update.

## Deploy your own

1. Create a Firebase project with Google sign-in and Firestore; publish [`firebase/firestore.rules`](../../firebase/firestore.rules).
2. Put your Firebase web config into `public/config.js` and your project ID into `public/_redirects`.
3. Netlify → import this repository → **Base directory** `apps/habits`. No build runs on Netlify — the bundle is committed.
4. Add your Netlify domain to Firebase **Authorized domains** and to the Google OAuth client redirect URIs (`https://<site>/__/auth/handler`).

Notes in Russian: [README.ru.md](README.ru.md).

## License

MIT — see the [root LICENSE](../../LICENSE).
