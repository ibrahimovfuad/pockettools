// Local development server: serves public/ and runs the Netlify functions in netlify/functions on the same port,
// so the app can be tried with the real Transitous API without the Netlify CLI.
//   npm run dev            (then open http://localhost:8888)
//   PORT=3000 UM_WARSAW_API_KEY=... npm run dev
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../public/', import.meta.url).pathname;
const fnDir = new URL('../netlify/functions/', import.meta.url);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
const routes = [[/^\/api\/transitous\//, 'transitous.mjs'], [/^\/api\/vehicles\//, 'vehicles.mjs']];

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const fn = routes.find(([re]) => re.test(url.pathname));
  if (fn) {
    try {
      const { default: handler } = await import(new URL(fn[1], fnDir));
      const r = await handler(new Request(url, { method: req.method }));
      res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
    } catch (e) { res.writeHead(500); res.end('function error'); }
    return;
  }
  let file = join(root, normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, ''));
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch { file = join(root, 'index.html'); }
  try { res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); }
  catch { res.writeHead(404); res.end('not found'); }
}).listen(process.env.PORT || 8888, () => console.log(`Routes: http://localhost:${process.env.PORT || 8888}`));
