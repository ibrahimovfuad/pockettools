# Bookshelf

A personal reading tracker: what you're reading, what's next and what you've finished — in one place.

## Features

- Add books by **scanning the barcode** (ISBN) with the camera or by searching title/author.
- Covers and descriptions from [Google Books](https://developers.google.com/books) and [Open Library](https://openlibrary.org/developers).
- Reading statuses, dates, quotes and notes per book.
- Import (flexible date formats) and export of your library.
- **Share with friends** — an optional read-only link (`/u/<code>`) that opens your shelf without sign-in.
- Google sign-in, Firebase sync, installable PWA.

## Stack

Vanilla JS bundled with esbuild · Firebase Auth + Firestore · [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) for barcode scanning.

```
public/        the site (public/app.js is the built bundle, zxing_reader.wasm the scanner)
src/main.js    app source → npm run build
```

## Data stored

`users/{uid}/books/{id}`, `users/{uid}/quotes/{id}`, the profile document `users/{uid}` (friends-link settings, including the random link id) and, while the friends link is on, the public copy `public/{id}`. Deleting Bookshelf data or the account deletes the public copy found through the id in your profile.

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

## Deploy your own

1. Create a Firebase project with Google sign-in and Firestore; publish [`firebase/firestore.rules`](../../firebase/firestore.rules).
2. Put your Firebase web config into `public/config.js` and your project ID into `public/_redirects`.
3. Netlify → import this repository → **Base directory** `apps/bookshelf`. No build runs on Netlify — the bundle is committed.
   In a fork, delete `ignore = "exit 0"` from `netlify.toml` first — this repository deploys with release tags instead of Netlify Git builds.
4. Add your Netlify domain to Firebase **Authorized domains**, and to the Google OAuth client's JavaScript origins and redirect URIs (`https://<site>/__/auth/handler`).

Step-by-step guide in Russian: [README.ru.md](README.ru.md).

## License

MIT — see the [root LICENSE](../../LICENSE).
