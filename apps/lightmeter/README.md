# Lightmeter

An exposure meter for film photography. Live at https://lightmeter2.netlify.app

## Features

- **Metering with the phone camera** — tap the picture for a spot reading, double-tap to go back to a centre-weighted average of the whole frame. **Hold** freezes the reading; **Manual** sets the EV by hand without the camera.
- **Exposure triangle in ⅓ stops** — ISO, aperture and shutter, each with a lock. A new reading keeps the locked values and solves the free ones (shutter first, then aperture, then ISO). Turning a free dial by hand makes the other free value follow. ISO is locked to the loaded film by default.
- **Your gear** — cameras (shutter range), lenses (focal length, aperture range) and films (ISO, exposures). Dials only offer values your camera and lens can do; if the light needs more, the meter clamps and says how many stops over or under you are.
- **Journal** — load a film into a camera to start a roll; the shutter button logs each frame (aperture, shutter, ISO, EV, lens, time and optionally location). Browse rolls, add notes, finish or delete rolls.
- Google sign-in, offline-first sync through Firestore, installable PWA, dark camera-style UI.

## How accurate is the metering?

A web page cannot read the phone camera's real exposure on every device:

- **Camera data mode** — if the browser reports the camera's exposure time and ISO (`MediaStreamTrack.getSettings()`), the app computes absolute EV from them and the picture's brightness, assuming the phone lens is f/1.8 (adjustable in Calibration).
- **Relative mode** — otherwise only the picture's brightness is known, and the phone's automatic exposure evens it out. Readings then follow changes in the scene only partially. Calibrate once against a real meter or Sunny 16 (Calibration → “Match the reference”), check important shots, and use Manual when in doubt.

Calibration is stored per device.

## Data (Firestore)

`users/{uid}/lm_cameras`, `lm_lenses`, `lm_films`, `lm_rolls`, `lm_frames`. Rules: [`firebase/firestore.rules`](../../firebase/firestore.rules) — owner-only.

## Run locally

```bash
npm install
npm test             # exposure maths
npm run build        # src/main.js → public/app.js
npx serve public     # demo mode: open http://localhost:3000/#demo (camera needs localhost or HTTPS)
```

## Deploy

Deployed by [`.github/workflows/netlify-apps.yml`](../../.github/workflows/netlify-apps.yml) on every push that changes this folder (`netlify deploy --prod --no-build`, publish directory `public`). For Google sign-in on a new domain, also add `https://<domain>/__/auth/handler` to the Google OAuth client's redirect URIs.

## License

MIT — see the [root LICENSE](../../LICENSE).

## Dials and haptics

- Dials snap to the nearest ⅓-stop value after you let go.
- The dial you turned last keeps its value when the light changes (shutter → shutter priority, aperture → aperture priority); locked values never move.
- Haptics: Android uses the Vibration API (a tick on every step). iPhone has no web vibration API; since iOS 18 Safari plays the system haptic of a native `<input type="checkbox" switch>`, but only for user-initiated events, so the reliable tick is when the finger lifts.
