# Timer

A fast kitchen-style countdown timer built for one-handed use.

## Features

- Three configurable quick-add buttons; **press and hold** to keep adding time, with adjustable delay, step and acceleration (try it right in settings).
- Optional **keep screen awake** while counting down (Screen Wake Lock, iOS 18.4+).
- Sound signal, optionally ringing until you stop it.
- Works fully offline, no account, no build step. Installable PWA.

## Run locally

```bash
npx serve public
```

## Deploy

Netlify → import this repository → **Base directory** `apps/timer`. No build step.
In a fork, delete `ignore = "exit 0"` from `netlify.toml` first — this repository deploys with release tags instead of Netlify Git builds.

## License

MIT — see the [root LICENSE](../../LICENSE).
