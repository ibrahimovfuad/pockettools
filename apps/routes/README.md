# Routes

Ad-free public transport routes for Polish cities, with live vehicles. Live at https://pocketroutes2.netlify.app

Plan a journey, see departures at a stop and follow one bus, tram or train on the map while the app is open. No ads, no ticket sales, no analytics, no tracking. It works without an account; signing in with Google is optional and only syncs what you save.

## Features

- **Search** from your current location (or any place) to any place, now, at a chosen departure time or to arrive by a chosen time; filter by tram, bus, metro or train; sort by fewest changes or least walking; "Later connections".
- **City picker** with the big Polish networks (Warszawa, Kraków, Wrocław, Poznań, Trójmiasto, Łódź, Katowice/GZM, Lublin, Szczecin, Bydgoszcz and more), a search box and "Use my location". The city only biases place search and the starting map position — routing itself is not limited to a city.
- **Results and route**: times, changes, walking, live delays where the data has them, every stop of a leg, and a map with the route.
- **Stop departures** (also nearby stops on the start screen, after you allow location): next departures with a "live" or "timetable" label, platform filter, refresh every 15 s, save a stop with the star.
- **Live tracking** of one chosen vehicle, only while the app is open (refresh about every 12 s): minutes and stops away, a progress strip, the vehicle on the map, a vibration (where the browser supports it) and an on-screen message when it is one stop away. The screen is kept awake while tracking if the browser allows it. Metro has no position, so it shows a timetable countdown.
- **Your position** on the map: a blue dot with an accuracy circle (only while a map is visible) and a direction beam from the compass. iOS asks for compass permission after a tap on the "Direction" button; Android starts it by itself. Optional "Rotate map as I turn".
- **Saved places** (Home, Work, favourite stops) and the last 10 searches; **export / import** of saved places as a file or as a share link (`#import=…`).
- Light and dark mode, installable PWA, works at 375–430 px, reduced motion respected.

## Data sources and attribution

| What | Source | Terms |
|---|---|---|
| Routing, place search, stop departures, trips | [Transitous](https://transitous.org/api/) (MOTIS 2 API, `api.transitous.org`), built from open timetable feeds listed on [transitous.org/sources](https://transitous.org/sources/) | Free and open-source, non-commercial, light use; every request identifies the app with a `User-Agent`; a visible link to the sources page (in the footer of every screen) |
| Map | [OpenFreeMap](https://openfreemap.org) "liberty" style, data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), rendered with [MapLibre GL JS](https://maplibre.org) (BSD-3-Clause) | Free, no key; the attribution is always visible on the map. If the style cannot be loaded the app falls back to plain OpenStreetMap tiles |
| Warsaw bus and tram GPS positions (optional) | [Miasto Stołeczne Warszawa, api.um.warszawa.pl](https://api.um.warszawa.pl) | Free API key needed; shown with the name "Miasto Stołeczne Warszawa", the download time and a link, as the city asks |

Transitous asks that apps show *Transitous* and its sources; the footer of every screen does. Please keep the number of `/plan` requests low (the policy asks to talk to the Transitous team beyond roughly 720 per day): the proxy caches answers for a few seconds to share them between users.

### How live vehicles work

Transitous / MOTIS does **not** publish GPS positions. It returns the timetable adjusted with real-time delays where the city shares a GTFS-Realtime feed. Routes therefore tries, per tracked trip:

1. **GPS** — the city's own vehicle API, through `/api/vehicles/<provider>` (today only Warsaw buses and trams, and only when `UM_WARSAW_API_KEY` is set). The vehicle is matched to the trip by line number and by being close to the route line and the timetable position.
2. **Live timetable** — the position is interpolated along the route from MOTIS times that include real-time delays ("Position follows the live timetable").
3. **Estimated** — the same from the plain timetable ("Estimated from the timetable — no live data for this trip").

The screen always says which of the three it is using. Adding another city's API means adding one entry to `PROVIDERS` in `src/live.js` and in `netlify/functions/vehicles.mjs`, and a `live` field to the city in `src/cities.js`.

## Privacy

- No ads, no analytics, no push notifications, no trip statistics, no tickets.
- Saved places, the last 10 searches and settings live in `localStorage` on the device.
- Searches (start and end coordinates or stop IDs) go to Transitous through this app's own Netlify Function, which adds the `User-Agent`, forwards nothing about the visitor (no IP address, cookies or headers) and does not log or store queries. Place-name suggestions are sent the same way.
- Your position is used only inside the page (blue dot, nearby stops, routes from "Current location") and is sent to Transitous only as the start of a search or a nearby-stops lookup.
- **Optional Google sign-in** (same Firebase project as the other apps): syncs saved places, search history and settings between devices. Nothing else is stored, never where you travelled.

### Data stored (when signed in)

| Path in Firestore | Contents | Rules |
|---|---|---|
| `users/{uid}/routes_places/{id}` | one document per saved place: `kind` (`home`, `work`, `stop`, `place`), `name`, `sub`, `lat`, `lon`, `stopId`, `ts` | owner only, fields validated |
| `users/{uid}/routes_meta/settings` | `direction`, `rotate`, `live`, `city`, `ts` | owner only |
| `users/{uid}/routes_meta/history` | `items` (the last 10 searched places), `ts` | owner only, at most 10 items |

Settings → Account & data (the shared Pocket Tools section, `src/account.js` copied from `shared/`) offers **Export my data** (one JSON file with everything Pocket Tools stores about you), **Delete this app's data** (removes the `routes_*` documents; this phone's copy is cleared too when the sync sees them gone) and **Delete account** (every Pocket Tools app's data, then the Google sign-in account). On the first sign-in the device data is merged with the account; a different Google account on the same device never inherits the previous person's places. Rules and tests: [`firebase/firestore.rules`](../../firebase/firestore.rules), [`firebase/test/rules.test.mjs`](../../firebase/test/rules.test.mjs).


## Stack

Vanilla JS bundled with esbuild · MapLibre GL JS · Firebase Auth + Firestore (optional sign-in) · two small Netlify Functions without dependencies.

```
public/                      the site (public/app.js is the built bundle)
public/maplibre-gl-worker.mjs  MapLibre's web worker, copied by the build and loaded from our own origin (CSP)
src/main.js                  screens, navigation, actions      src/views.js  HTML builders
src/api.js                   Transitous client                 src/live.js   vehicle position providers
src/map.js                   MapLibre wrapper                  src/locate.js position and compass
src/store.js                 device storage, export/import     src/cloud.js   sign-in and sync; src/account.js (shared) export and delete
netlify/functions/transitous.mjs  /api/transitous/*  proxy with User-Agent, endpoint whitelist and short cache
netlify/functions/vehicles.mjs    /api/vehicles/warsaw  city vehicle API (optional key)
```

## Run locally

```bash
npm install
npm run build      # bundles src/main.js into public/app.js and copies the MapLibre worker and stylesheet (commit the result)
npm run dev        # http://localhost:8888 — serves public/ and runs the two functions, using the real Transitous API
```

`npx netlify-cli dev` works too. If `public/config.js` holds a placeholder Firebase key, the sign-in section is simply hidden.

Content-Security-Policy: `public/_headers` allows scripts only from the site itself (plus the Google hosts for sign-in). MapLibre's worker is therefore a separate same-origin file selected with `setWorkerUrl`; no inline scripts and no CDN.

## Deploy

Deployed by the repository's release workflow (`.github/workflows/release.yml`) to the Netlify site `pocketroutes2`; `netlify.toml` lists the functions directory, so the functions ship with the site. In a fork, import the repository in Netlify with **Base directory** `apps/routes` and delete `ignore = "exit 0"` from `netlify.toml`.

For Google sign-in on a new domain (once, by hand):

1. Firebase → Authentication → Settings → Authorized domains: add `pocketroutes2.netlify.app` (the repository workflow also adds domains listed in `firebase/authorized-domains.txt`).
2. Google Cloud console → APIs & Services → Credentials → the OAuth 2.0 web client: add the redirect URI `https://pocketroutes2.netlify.app/__/auth/handler`.
3. Same page → the browser API key: add the website restriction `https://pocketroutes2.netlify.app/*`.

### Environment variables

| Name | Required | Description |
|------|----------|-------------|
| `UM_WARSAW_API_KEY` | No | Free API key for [api.um.warszawa.pl](https://api.um.warszawa.pl) (register a free account on the site; the key is shown in your profile). Enables GPS positions of Warsaw buses and trams. Without it the app uses the live/estimated timetable position. Set it in Netlify → Site configuration → Environment variables (never in the repository). |

## License

MIT — see the [root LICENSE](../../LICENSE). MapLibre GL JS is BSD-3-Clause; map data © OpenStreetMap contributors (ODbL).
