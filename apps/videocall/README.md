# Video Call

A one-to-one video calling PWA in a single page — no accounts, no app store, no media server.

## Features

- **Permanent call link** — open the same link on both devices; whoever comes first waits, the other one joins automatically.
- **Peer-to-peer WebRTC** — audio and video go directly between devices (via [PeerJS](https://peerjs.com/) for signalling).
- **HD video** up to 720p / 30 fps with bitrate caps you can lower for mobile data.
- iOS-style call screen: draggable picture-in-picture, mute, camera on/off, front/back camera switch, call timer, auto-hiding controls.
- Installable to the home screen; works on iPhone and Android browsers.

## Run locally

```bash
npx serve .
```

Camera access requires HTTPS or `localhost`.

## Deploy

Netlify → import this repository → **Base directory** `apps/videocall`. No build step.
In a fork, delete `ignore = "exit 0"` from `netlify.toml` first — this repository deploys with release tags instead of Netlify Git builds.

### Optional configuration

At the top of `app.js`:

| Setting | Purpose |
|---------|---------|
| `VIDEO_KBPS` / `AUDIO_KBPS` | Bitrate caps. Lower `VIDEO_KBPS` (e.g. 800) to save mobile data. |
| `TURN_URL` | A TURN server for networks where a direct connection fails. |

## Notes

- Without a TURN server some calls on strict mobile networks may not connect.
- `_headers` sets a Content-Security-Policy that only allows scripts from the site itself.

## License

MIT — see the [root LICENSE](../../LICENSE).
