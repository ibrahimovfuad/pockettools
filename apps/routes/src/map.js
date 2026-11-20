// The map: MapLibre GL JS (bundled, no CDN) with the OpenFreeMap "liberty" basemap and a plain OpenStreetMap
// raster fallback. MapLibre's web worker is loaded from our own origin (public/maplibre-gl-worker.mjs) because
// the Content-Security-Policy only allows scripts from 'self'.
import { Map as GlMap, Marker, AttributionControl, setWorkerUrl } from 'maplibre-gl';
import { circle, esc, MODE_COLOR } from './util.js';

let workerReady = false;
function prepareWorker() {
  if (workerReady) return;
  try { setWorkerUrl(new URL('maplibre-gl-worker.mjs', document.baseURI).href); } catch (e) {}
  workerReady = true;
}

const PRIMARY = 'https://tiles.openfreemap.org/styles/liberty';
const FALLBACK = {
  version: 8,
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>' } },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
};

export function mapSupported() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

const EMPTY = { type: 'FeatureCollection', features: [] };

export class RouteMap {
  constructor(el, { center, zoom = 13, onFail } = {}) {
    this.el = el; this.ok = false; this.route = EMPTY; this.stops = EMPTY; this.acc = EMPTY;
    this.vehicles = new Map(); this.me = null; this.heading = null; this.dead = false; this.usedFallback = false;
    this.pending = null;
    if (!mapSupported()) { this.fail(onFail, 'This browser cannot draw the map.'); return; }
    try {
      prepareWorker();
      this.map = new GlMap({
        container: el, style: PRIMARY, center: center ? [center.lon, center.lat] : [21.0122, 52.2297], zoom,
        attributionControl: false, pitchWithRotate: false, dragRotate: true, touchPitch: false, fadeDuration: 0
      });
      this.map.addControl(new AttributionControl({ compact: false }), 'bottom-left');   // © OpenStreetMap contributors stays visible
      this.map.on('style.load', () => { this.ok = true; this.addLayers(); });
      this.map.on('error', e => {
        const msg = String(e && e.error && e.error.message || '');
        if (!this.map.isStyleLoaded() && !this.usedFallback && !this.dead) this.useFallback();
        else if (this.usedFallback && !this.ok && onFail) onFail('The map could not be loaded. Check your connection.');
        void msg;
      });
      this.timeout = setTimeout(() => { if (!this.ok && !this.usedFallback && !this.dead) this.useFallback(); }, 9000);
    } catch (e) { this.fail(onFail, 'The map could not be started.'); }
  }
  fail(cb, msg) { this.map = null; this.ok = false; if (cb) cb(msg); }
  useFallback() {
    this.usedFallback = true;
    try { this.map.setStyle(FALLBACK); } catch (e) {}
  }
  addLayers() {
    const m = this.map;
    try {
      if (!m.getSource('route')) {
        m.addSource('route', { type: 'geojson', data: this.route });
        m.addSource('stops', { type: 'geojson', data: this.stops });
        m.addSource('acc', { type: 'geojson', data: this.acc });
        m.addLayer({ id: 'acc-fill', type: 'fill', source: 'acc', paint: { 'fill-color': '#0a63ce', 'fill-opacity': 0.14 } });
        m.addLayer({ id: 'route-casing', type: 'line', source: 'route', filter: ['!=', ['get', 'walk'], true], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 9 } });
        m.addLayer({ id: 'route-line', type: 'line', source: 'route', filter: ['!=', ['get', 'walk'], true], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': ['coalesce', ['get', 'opacity'], 1] } });
        m.addLayer({ id: 'route-walk', type: 'line', source: 'route', filter: ['==', ['get', 'walk'], true], layout: { 'line-cap': 'round' }, paint: { 'line-color': '#6b6b70', 'line-width': 4, 'line-dasharray': [0.1, 2] } });
        m.addLayer({ id: 'stops', type: 'circle', source: 'stops', paint: { 'circle-radius': ['coalesce', ['get', 'r'], 5], 'circle-color': '#ffffff', 'circle-stroke-width': 3, 'circle-stroke-color': ['get', 'color'] } });
      } else {
        m.getSource('route').setData(this.route); m.getSource('stops').setData(this.stops); m.getSource('acc').setData(this.acc);
      }
      if (this.pending) { const p = this.pending; this.pending = null; this.fit(p.coords, p.pad); }
    } catch (e) {}
  }
  // legs: [{ coords: [[lon,lat]…], color, walk, opacity }]; stops: [{ lon, lat, color, r }]
  setRoute(legs, stops = []) {
    this.route = { type: 'FeatureCollection', features: legs.filter(l => l.coords && l.coords.length > 1).map(l => ({ type: 'Feature', properties: { color: l.color, walk: !!l.walk, opacity: l.opacity }, geometry: { type: 'LineString', coordinates: l.coords } })) };
    this.stops = { type: 'FeatureCollection', features: stops.map(s => ({ type: 'Feature', properties: { color: s.color, r: s.r }, geometry: { type: 'Point', coordinates: [s.lon, s.lat] } })) };
    if (this.map && this.ok && this.map.getSource('route')) { this.map.getSource('route').setData(this.route); this.map.getSource('stops').setData(this.stops); }
  }
  fit(coords, pad = 50) {
    if (!this.map || !coords.length) return;
    if (!this.ok) { this.pending = { coords, pad }; return; }
    let [w, s, e, n] = [180, 90, -180, -90];
    for (const [x, y] of coords) { w = Math.min(w, x); e = Math.max(e, x); s = Math.min(s, y); n = Math.max(n, y); }
    try { this.map.fitBounds([[w, s], [e, n]], { padding: pad, maxZoom: 16, duration: 0 }); } catch (e) {}
  }
  flyTo(lon, lat, zoom) { try { this.map && this.map.easeTo({ center: [lon, lat], zoom: zoom || this.map.getZoom(), duration: 500 }); } catch (e) {} }
  // ---- the user: blue dot, accuracy circle, direction beam ----
  setMe(pos, showBeam) {
    if (!this.map || !pos) return;
    if (!this.me) {
      const el = document.createElement('div');
      el.className = 'me';
      el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'Your position');
      el.innerHTML = '<svg class="beam" viewBox="-40 -40 80 80" aria-hidden="true"><defs><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0a63ce" stop-opacity=".55"/><stop offset="1" stop-color="#0a63ce" stop-opacity="0"/></radialGradient></defs><path d="M0 0 L-17 -36 A40 40 0 0 1 17 -36 Z" fill="url(#bg)"/></svg><span class="dot"></span>';
      this.me = new Marker({ element: el, rotationAlignment: 'map', pitchAlignment: 'map' }).setLngLat([pos.lon, pos.lat]).addTo(this.map);
    }
    this.me.setLngLat([pos.lon, pos.lat]);
    this.acc = { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circle(pos.lat, pos.lon, Math.min(pos.acc || 30, 500))] } }] };
    if (this.ok && this.map.getSource('acc')) this.map.getSource('acc').setData(this.acc);
    this.setBeam(this.heading, showBeam);
  }
  setBeam(heading, show) {
    this.heading = heading;
    if (!this.me) return;
    const beam = this.me.getElement().querySelector('.beam');
    if (!beam) return;
    beam.style.display = show && heading != null ? 'block' : 'none';
    if (heading != null) beam.style.transform = `rotate(${heading - (this.map ? this.map.getBearing() : 0)}deg)`;
  }
  clearMe() { if (this.me) { this.me.remove(); this.me = null; } this.acc = EMPTY; if (this.ok && this.map.getSource('acc')) this.map.getSource('acc').setData(EMPTY); }
  rotateTo(deg) { try { this.map.easeTo({ bearing: deg, duration: 120, easing: t => t }); } catch (e) {} }
  resetNorth() { try { this.map.easeTo({ bearing: 0, duration: 300 }); } catch (e) {} }
  // ---- vehicles: [{ id, line, kind, pos: [lon, lat], source }] ----
  setVehicles(list) {
    if (!this.map) return;
    const seen = new Set();
    for (const v of list) {
      seen.add(v.id);
      let mk = this.vehicles.get(v.id);
      if (!mk) {
        const el = document.createElement('div');
        el.className = 'veh'; el.style.background = MODE_COLOR[v.kind] || MODE_COLOR.other;
        el.setAttribute('role', 'img'); el.setAttribute('aria-label', `${v.kind} ${v.line}`);
        el.innerHTML = `<b>${esc(v.line)}</b>`;
        mk = new Marker({ element: el }).setLngLat(v.pos).addTo(this.map);
        this.vehicles.set(v.id, mk);
      } else mk.setLngLat(v.pos);
      mk.getElement().classList.toggle('est', v.source !== 'gps');
    }
    for (const [id, mk] of this.vehicles) if (!seen.has(id)) { mk.remove(); this.vehicles.delete(id); }
  }
  onRotate(f) { if (this.map) this.map.on('rotate', f); }
  resize() { try { this.map && this.map.resize(); } catch (e) {} }
  remove() {
    this.dead = true; clearTimeout(this.timeout);
    try { this.vehicles.forEach(m => m.remove()); if (this.me) this.me.remove(); if (this.map) this.map.remove(); } catch (e) {}
    this.map = null;
  }
}
