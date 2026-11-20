#!/usr/bin/env node
// Command-line alternative to Actions → Release → Run workflow.
// Creates the next release tag on origin/main and pushes it. Pushing a v* tag is what deploys:
// .github/workflows/release.yml then ships every folder whose files changed since the previous v* tag.
//
//   npm run release                 show what would ship, ask, then tag and push
//   npm run release -- --dry-run    show everything, change nothing
//   npm run release -- --yes        no confirmation question
//   npm run release -- --force      tag even when nothing deployable has changed
//
// Plain Node, no dependencies. Needs git and python3 on the PATH and push access to origin.

import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = 'origin/main';
const ACTIONS_URL = 'https://github.com/ibrahimovfuad/pockettools/actions/workflows/release.yml';
const RULE_FILES = ['firebase/firestore.rules', 'firebase.json'];

const args = new Set(process.argv.slice(2));
const known = new Set(['--dry-run', '--yes', '-y', '--force', '--help', '-h']);
for (const a of args) {
  if (!known.has(a)) fail(`Unknown option: ${a}\nOptions: --dry-run, --yes (-y), --force, --help (-h)`);
}
if (args.has('--help') || args.has('-h')) {
  console.log('Usage: npm run release -- [--dry-run] [--yes|-y] [--force]\n' +
    `Tags ${TARGET} as vYYYY.MM.DD (.2, .3 … for more releases on one day) and pushes the tag, which deploys.`);
  process.exit(0);
}
const DRY = args.has('--dry-run');
const YES = args.has('--yes') || args.has('-y');
const FORCE = args.has('--force');

function fail(message) {
  console.error(`\nError: ${message}`);
  process.exit(1);
}

function run(cmd, cmdArgs, { allowFail = false } = {}) {
  try {
    return execFileSync(cmd, cmdArgs, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (allowFail) return null;
    const detail = (e.stderr || e.message || '').toString().trim();
    throw new Error(`${cmd} ${cmdArgs.join(' ')} failed${detail ? `:\n${detail}` : ''}`);
  }
}
const git = (...a) => run('git', a);

try {
  // 1. Latest state of the remote, including tags.
  console.log('Fetching origin (branches and tags) …');
  git('fetch', 'origin', '--tags', '--force');

  const target = run('git', ['rev-parse', '--verify', '--quiet', `${TARGET}^{commit}`], { allowFail: true });
  if (!target) fail(`${TARGET} does not exist. Check that the "origin" remote points to GitHub.`);
  const short = target.slice(0, 7);

  // 2. Is there anything to do?
  const tagsHere = git('tag', '--points-at', target, '--list', 'v*').split('\n').filter(Boolean);
  if (tagsHere.length) {
    console.log(`${TARGET} (${short}) is already released as ${tagsHere.join(', ')}. Nothing to do.`);
    process.exit(0);
  }

  const lastTag = run('git', ['describe', '--tags', '--abbrev=0', '--match', 'v*', TARGET], { allowFail: true });
  if (!lastTag) {
    fail(`There is no v* tag before ${TARGET} to compare with.\n` +
      'Create the first tag on GitHub (Releases → Draft a new release, target main) or run the Release workflow ' +
      'from the Actions tab with apps = all.');
  }

  // 3. What would ship.
  const changed = run('python3', ['.github/scripts/pt.py', 'changed', lastTag, TARGET])
    .split('\n').map((l) => l.trim()).filter(Boolean);
  const rulesChanged = run('git', ['diff', '--name-only', lastTag, TARGET, '--', ...RULE_FILES]).length > 0;
  const commits = git('log', '--oneline', `${lastTag}..${TARGET}`);

  console.log(`\nLast release: ${lastTag}`);
  console.log(`Target:       ${TARGET} (${short})`);
  console.log('\nCommits since the last release:');
  console.log(commits ? commits.split('\n').map((l) => `  ${l}`).join('\n') : '  (none)');
  console.log('\nWill deploy:');
  console.log(changed.length ? changed.map((d) => `  - ${d}`).join('\n') : '  (no app or site changed)');
  console.log(`Firestore rules: ${rulesChanged ? 'changed, will be tested and published' : 'unchanged'}`);

  if (!changed.length && !rulesChanged && !FORCE) {
    console.log('\nNothing deployable has changed since the last release, so no tag is needed. ' +
      'Use --force to tag anyway.');
    process.exit(0);
  }

  // 4. Next tag name: vYYYY.MM.DD, then .2, .3 …
  const base = `v${new Date().toISOString().slice(0, 10).replaceAll('-', '.')}`;
  const exists = (name) => run('git', ['rev-parse', '--verify', '--quiet', `refs/tags/${name}`], { allowFail: true }) !== null;
  let name = base;
  for (let n = 2; exists(name); n++) name = `${base}.${n}`;
  console.log(`\nNew tag: ${name}  →  ${short}`);

  if (DRY) {
    console.log('\nDry run: no tag was created and nothing was pushed.');
    process.exit(0);
  }

  // 5. Confirm.
  if (!YES) {
    if (!process.stdin.isTTY) fail('No terminal to ask for confirmation. Run it in a terminal or pass --yes.');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question('Create the tag and push it (this deploys)? [y/N] ')).trim().toLowerCase();
    rl.close();
    if (answer !== 'y' && answer !== 'yes') {
      console.log('Cancelled. Nothing was created.');
      process.exit(0);
    }
  }

  // 6. Tag and push.
  git('tag', '-a', name, '-m', `Release ${name}`, target);
  try {
    git('push', 'origin', name);
  } catch (e) {
    run('git', ['tag', '-d', name], { allowFail: true });
    fail(`Could not push the tag ${name}. The local tag was removed.\n${e.message}\n\n` +
      'You can create the tag on GitHub instead: Releases → Draft a new release → choose a new tag ' +
      `(for example ${name}), target main → Publish. That triggers the same deploy.`);
  }

  console.log(`\nTag ${name} pushed. The deploy is running; follow it here:\n${ACTIONS_URL}`);
} catch (e) {
  fail(e.message);
}
