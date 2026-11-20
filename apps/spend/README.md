# Spend

Log an expense in two taps: type the amount, tap a category. Live at https://spendlog2.netlify.app

## Features

- **Two steps** — a keypad for the amount (comma decimals, złoty), then a grid of your categories; tapping one saves right away, with Undo.
- **Hold a category** to add a note or pick another date before saving.
- **Quick chips** for your three most frequent amount + category pairs.
- **Your categories** — add, rename, recolor, choose an icon, delete and drag to reorder (Settings). Eight defaults are created on first sign-in.
- **Month view** — total, optional monthly budget bar, spending by category and every expense by day; tap one to edit or delete it.
- **Apple Pay** — a Shortcuts automation (Automation → Wallet / Transaction → Open URLs) opens
  `https://spendlog2.netlify.app/?amount=<Amount>&merchant=<Merchant>`; the app jumps to the category step with the amount and shop filled in. Turn on “Always file <shop> under…” and the next payment there is saved automatically.
- CSV export, Google sign-in, offline-first sync through Firestore, installable PWA, iOS look with light/dark mode.

## Data (Firestore)

`users/{uid}/spend_categories`, `users/{uid}/spend_expenses` (amount in zł, catId, date `YYYY-MM-DD`, note, merchant, source), `users/{uid}/spend_meta/settings` (budget, shop rules). Rules: [`firebase/firestore.rules`](../../firebase/firestore.rules) — owner-only.

## Run locally

```bash
npm install
npm run build        # src/main.js → public/app.js
npx serve public     # demo mode: open http://localhost:3000/#demo
```

## Deploy

Deployed by the release workflow ([`.github/workflows/release.yml`](../../.github/workflows/release.yml)) when a release includes changes to `public/` (`netlify deploy --prod --no-build`). For Google sign-in on a new domain, also add `https://<domain>/__/auth/handler` to the Google OAuth client's redirect URIs.

## License

MIT — see the [root LICENSE](../../LICENSE).
