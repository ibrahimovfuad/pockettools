# Bookshelf

A personal reading tracker: what you're reading, what's next and what you've finished — in one place.

## Features

- Add books by **scanning the barcode** (ISBN) with the camera or by searching title/author.
- Covers and descriptions from [Google Books](https://developers.google.com/books) and [Open Library](https://openlibrary.org/developers).
- Reading statuses, dates, quotes and notes per book.
- Import (flexible date formats) and export of your library.
- **Share with friends** — an optional read-only link (`/u/<code>`) that opens your shelf without sign-in.
- Google sign-in, Firebase sync, installable PWA. UI language: Russian.

## Stack

Vanilla JS bundled with esbuild · Firebase Auth + Firestore · [zxing-wasm](https://github.com/Sec-ant/zxing-wasm) for barcode scanning.

```
public/        the site (public/app.js is the built bundle, zxing_reader.wasm the scanner)
src/main.js    app source → npm run build
```

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
4. Add your Netlify domain to Firebase **Authorized domains**, and to the Google OAuth client's JavaScript origins and redirect URIs (`https://<site>/__/auth/handler`).

Step-by-step guide in Russian: [README.ru.md](README.ru.md).

## License

MIT — see the [root LICENSE](../../LICENSE).
