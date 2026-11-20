// Create a new app from apps/_template and register it everywhere it needs to be listed.
//
//   npm run new-app -- notes --title "Notes" --desc "Quick notes to self." [--site notes2] [--firebase]
//
// Makes apps/<name>, adds the Netlify site name to .github/netlify-sites.json, the shared files to
// shared/manifest.json, a row to README.md and AGENTS.md, and a card to the homepage (site/index.html).
// With --firebase it also copies the Firebase config, adds the sign-in proxy and CSP hosts, and lists the
// domain in firebase/authorized-domains.txt. The site itself is created by the first release.
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const name = args[0];
if (!name || name.startsWith('--') || !/^[a-z][a-z0-9-]{1,30}$/.test(name)) {
  console.error('Usage: npm run new-app -- <folder-name> --title "Title" --desc "One sentence." [--site <netlify-name>] [--firebase]');
  process.exit(1);
}
const dir = `apps/${name}`;
if (existsSync(dir)) { console.error(`${dir} already exists.`); process.exit(1); }
const title = opt('title', name[0].toUpperCase() + name.slice(1));
const desc = opt('desc', 'One sentence about what this app does.');
const site = opt('site', name + '2');
const firebase = args.includes('--firebase');
if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(site)) { console.error(`Bad Netlify site name: ${site}`); process.exit(1); }
if (/[А-Яа-яЁё]/.test(title + desc)) { console.error('Title and description must be in English.'); process.exit(1); }

// 1. copy the template and fill in the placeholders
cpSync('apps/_template', dir, { recursive: true });
const fill = s => s.replaceAll('__NAME__', name).replaceAll('__TITLE__', title).replaceAll('__DESC__', desc).replaceAll('__SITE__', site);
const walk = d => readdirSync(d).forEach(f => {
  const p = join(d, f);
  if (statSync(p).isDirectory()) return walk(p);
  if (/\.(js|html|json|md|toml|webmanifest)$|_headers$/.test(f)) writeFileSync(p, fill(readFileSync(p, 'utf8')));
});
walk(dir);

// 2. shared files (nozoom.js always; Firebase config with --firebase)
const manifest = JSON.parse(readFileSync('shared/manifest.json', 'utf8'));
const share = file => { manifest[file] = [...new Set([...(manifest[file] || []), `${dir}/public`])]; copyFileSync(`shared/${file}`, `${dir}/public/${file}`); };
share('nozoom.js');
if (firebase) {
  share('config.js');
  const idx = `${dir}/public/index.html`;
  writeFileSync(idx, readFileSync(idx, 'utf8').replace('<script src="nozoom.js"></script>', '<script src="nozoom.js"></script>\n<script src="config.js"></script>'));
  const sw = `${dir}/public/sw.js`;
  writeFileSync(sw, readFileSync(sw, 'utf8').replace("'nozoom.js',", "'nozoom.js', 'config.js',"));
  writeFileSync(`${dir}/public/_headers`, readFileSync(`${dir}/public/_headers`, 'utf8')
    .replace('# Disallow inline', '# Google hosts are needed for Firebase sign-in.\n# Disallow inline')
    .replaceAll("script-src 'self'", "script-src 'self' https://apis.google.com https://www.gstatic.com https://www.google.com"));
  writeFileSync(`${dir}/public/_redirects`, readFileSync('apps/spend/public/_redirects', 'utf8'));
  const pkg = JSON.parse(readFileSync(`${dir}/package.json`, 'utf8'));
  pkg.devDependencies.firebase = JSON.parse(readFileSync('apps/spend/package.json', 'utf8')).devDependencies.firebase;
  writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2) + '\n');
  const domains = 'firebase/authorized-domains.txt';
  writeFileSync(domains, readFileSync(domains, 'utf8').trimEnd() + `\n${site}.netlify.app\n`);
}
writeFileSync('shared/manifest.json', JSON.stringify(manifest, null, 2) + '\n');

// 3. Netlify site name
const sites = JSON.parse(readFileSync('.github/netlify-sites.json', 'utf8'));
sites.sites = Object.fromEntries(Object.entries(sites.sites).filter(([k]) => k !== 'site').concat([[dir, site], ['site', sites.sites.site]]));
writeFileSync('.github/netlify-sites.json', JSON.stringify(sites, null, 2) + '\n');

// 4. README and AGENTS tables, homepage card
const addRow = (file, after, row) => {
  const lines = readFileSync(file, 'utf8').split('\n');
  const i = lines.findLastIndex(l => l.startsWith(after));
  lines.splice(i + 1, 0, row);
  writeFileSync(file, lines.join('\n'));
};
addRow('README.md', '| [', `| [${title}](${dir}) | ${desc.replace(/\.$/, '')} | JS${firebase ? ', Firebase' : ''} |`);
addRow('AGENTS.md', '| `apps/', `| \`${dir}\` | ${site}.netlify.app | esbuild bundle |`);
const home = readFileSync('site/index.html', 'utf8');
const card = `    <a class="app" href="https://${site}.netlify.app">\n      <img src="icons/${name}.png" alt="">\n      <div class="t"><b>${title}</b><p>${desc}</p></div>\n      <span class="open">Open</span>\n    </a>\n`;
const at = home.lastIndexOf('    </a>\n') + '    </a>\n'.length;
writeFileSync('site/index.html', home.slice(0, at) + card + home.slice(at));
copyFileSync(`${dir}/public/icon-192.png`, `site/icons/${name}.png`);

console.log(`Created ${dir} (Netlify site: ${site}${firebase ? ', Firebase sign-in' : ''}).

Next:
  1. Check that https://${site}.netlify.app is free (the release stops if the name is taken).
  2. cd ${dir} && npm install && npm run build
  3. Replace the placeholder icons in ${dir}/public and site/icons/${name}.png.
${firebase ? '  4. Add Firestore rules for the new collections in firebase/firestore.rules, with tests in firebase/test/.\n' : ''}  Then open a pull request; after it is merged, run the Release workflow.`);
