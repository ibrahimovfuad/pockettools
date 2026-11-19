# Pocket Tools

A collection of small, open-source **Progressive Web Apps** for everyday life — lightweight helpers that install to your home screen, work offline where possible, and need no app store.

Every app lives in its own folder under [`apps/`](apps/) and is deployed as an independent site on [Netlify](https://www.netlify.com).

**Homepage:** [pockettools2.netlify.app](https://pockettools2.netlify.app) — a short overview of all apps (source in [`site/`](site/)). You are welcome to use them, fork them, deploy your own copy, or borrow pieces for your own projects.

## Apps

| App | What it does | Stack |
|-----|--------------|-------|
| [Video Call](apps/videocall) | One-to-one video calls over a permanent link, peer-to-peer WebRTC | HTML/JS, PeerJS |
| [Mood](apps/mood) | Rate each day 0–10, see trends, get a daily push reminder | JS, Firebase, Netlify Functions |
| [Habits](apps/habits) | Track daily/weekly habits and streaks | JS, Firebase |
| [Timer](apps/timer) | One-handed countdown timer with press-and-hold buttons | HTML/JS, offline |
| [Bookshelf](apps/bookshelf) | Reading tracker with barcode scanning, quotes and a shareable shelf | JS, Firebase, zxing-wasm |

Each app folder has its own `README.md` with features, setup steps and deployment notes.

## Why

These tools started as personal helpers. They are published openly so that anyone can:

- **Use them** — each app is a plain web page you can open and add to your home screen.
- **Self-host them** — every app can be deployed to your own Netlify account in a few minutes.
- **Learn from them** — the apps are deliberately small and readable: WebRTC calls, Web Push reminders, service workers, offline caching and installable PWAs with minimal or no build tooling.

The project is non-commercial and **ad-free**: no ads, no tracking, no paid tiers and no hosted service for sale.

## Repository layout

```
apps/
  <app-name>/         one app = one folder = one Netlify site
    README.md
    netlify.toml      build settings + "ignore" rule (only rebuild when this folder changes)
    ...
  _template/          starting point for a new app
firebase/
  firestore.rules     security rules shared by the Firebase-based apps
site/                 project homepage (its own Netlify site, base directory `site`)
```

## Deploy your own copy

1. Fork this repository.
2. In Netlify: **Add new project → Import an existing project → GitHub** and pick your fork.
3. Set **Base directory** to the app folder, e.g. `apps/<app-name>`. Build command and publish directory are read from that folder's `netlify.toml`.
4. Repeat for every app you want — each one becomes its own site with its own URL.

Some apps need extra configuration (API keys, environment variables). Their README explains exactly what to set.

## Contributing

Bug reports, ideas and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) — free to use, modify and redistribute.

---

<a href="https://www.netlify.com">This site is powered by Netlify</a>
