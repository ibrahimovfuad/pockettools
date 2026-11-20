import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { test, expect } from '@playwright/test';

// Every deployable folder and the directory it publishes (from its netlify.toml)
const folders = [...readdirSync('apps').filter(n => n !== '_template' && existsSync(`apps/${n}/netlify.toml`)).map(n => `apps/${n}`), 'site'];
const publishDir = d => { const m = readFileSync(`${d}/netlify.toml`, 'utf8').match(/^\s*publish\s*=\s*"([^"]*)"/m); return join(d, m ? m[1] : '.'); };

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.ico': 'image/x-icon' };

function serve(root) {
  const server = createServer(async (req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    let file = join(root, p);
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch { file = join(root, 'index.html'); } // SPA fallback
    try { res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); }
    catch { res.writeHead(404); res.end('not found'); }
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

for (const dir of folders) {
  test(`${dir} opens without errors`, async ({ page }, info) => {
    const server = await serve(publishDir(dir));
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: info.outputPath(`${dir.replace('/', '-')}.png`) });
      await info.attach('screenshot', { path: info.outputPath(`${dir.replace('/', '-')}.png`), contentType: 'image/png' });
      expect(errors, 'uncaught script errors').toEqual([]);
      await expect(page.locator('body')).not.toBeEmpty();
      if (dir.startsWith('apps/')) {
        // Netlify Open Source plan: both links must be on the first screen the visitor sees
        await expect(page.locator('a[href^="https://www.netlify.com"]').first()).toBeAttached();
        await expect(page.locator('a[href*="github.com/ibrahimovfuad/pockettools"]').first()).toBeAttached();
      }
    } finally { server.close(); }
  });
}
