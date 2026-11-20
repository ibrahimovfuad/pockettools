# Habits

A habit tracker: tick off habits every day, keep streaks going and watch your progress grow.

## Features

- Daily or weekly habits with schedules — scheduled days off don't break a streak.
- Streaks in days or weeks, history and per-habit detail view.
- Google sign-in, data synced through Firebase Firestore.
- Dark mode, installable PWA.

## Stack

Vanilla JS bundled with esbuild · Firebase Auth + Firestore.

```
public/        the site (public/app.js is the built bundle)
src/main.js    app source → npm run build
```

## Data stored

`users/{uid}/habits/{id}` (name, emoji, colour, archive state) and `users/{uid}/logs/{habitId_year}` (check-ins and notes).

## Delete your data

Settings has an **Account & data** section (in Bookshelf: Profile), identical in every Pocket Tools app and powered by [`shared/account.js`](../../shared/account.js):

- **Export my data** downloads one JSON file with everything stored about you in *all* Pocket Tools apps.
- **Delete this app’s data** deletes only the data listed above and keeps your account.
- **Delete account** deletes the data of every app, notification subscriptions on the servers and finally your sign-in account (type `DELETE` to confirm; Google may ask you to sign in again). If any step fails the account is kept and the failed steps are shown.

Privacy policy: <https://pockettools2.netlify.app/privacy.html>. The list of collections lives in [`shared/user-data.json`](../../shared/user-data.json); if this app stores something new, register it there.

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
   In a fork, delete `ignore = "exit 0"` from `netlify.toml` first — this repository deploys with release tags instead of Netlify Git builds.
4. Add your Netlify domain to Firebase **Authorized domains** and to the Google OAuth client redirect URIs (`https://<site>/__/auth/handler`).

Notes in Russian: [README.ru.md](README.ru.md).

## License

MIT — see the [root LICENSE](../../LICENSE).
