// Copy every file in shared/ to the apps listed in shared/manifest.json.
//   node scripts/sync-shared.mjs          copy, and list the apps whose CACHE you now need to bump
//   node scripts/sync-shared.mjs --check  only report copies that differ (exit code 1)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const check = process.argv.includes('--check');
const manifest = JSON.parse(readFileSync('shared/manifest.json', 'utf8'));
const touched = new Set();
let drift = 0;
for (const [name, targets] of Object.entries(manifest)) {
  if (name.startsWith('_')) continue;
  const src = readFileSync(`shared/${name}`);
  for (const dir of targets) {
    const dest = `${dir}/${name}`;
    if (existsSync(dest) && readFileSync(dest).equals(src)) continue;
    if (check) { console.log(`differs: ${dest}`); drift++; continue; }
    writeFileSync(dest, src);
    console.log(`updated: ${dest}`);
    touched.add(dir.split('/').slice(0, 2).join('/'));
  }
}
if (check) process.exit(drift ? 1 : 0);
if (touched.size) console.log(`\nBump CACHE in sw.js of: ${[...touched].join(', ')}`);
else console.log('All copies are up to date.');
