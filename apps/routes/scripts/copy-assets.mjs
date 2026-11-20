// Copies the files MapLibre needs next to the app: its web worker (loaded from our own origin, because the
// Content-Security-Policy only allows scripts from 'self') and its stylesheet. Run by "npm run build".
import { copyFileSync } from 'node:fs';
const dist = new URL('../node_modules/maplibre-gl/dist/', import.meta.url);
const pub = new URL('../public/', import.meta.url);
for (const f of ['maplibre-gl-worker.mjs', 'maplibre-gl.css']) copyFileSync(new URL(f, dist), new URL(f, pub));
