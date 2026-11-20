"""Repository helper for CI and releases.

  pt.py changed BASE [HEAD]   print the deployable folders whose deployed files changed between two commits
  pt.py check BASE [HEAD]     run the repository checks (cache bump, English UI, CSP, required links, homepage cards, shared files)
  pt.py sites DIR...          find (or create) the Netlify site of each folder;
                              prints "<dir> <site_id> <domain> <firebase> <publish dir> <functions dir or ->"

A folder is deployable if it has a netlify.toml (apps/* except apps/_template, and site/). What ships is its
publish directory plus its functions directory; README/Markdown files, src/, tests and package files never
trigger a deploy on their own.
"""
import json, os, re, subprocess, sys, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CFG = json.loads((ROOT / '.github/netlify-sites.json').read_text())
REPO_URL = 'github.com/ibrahimovfuad/pockettools'


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout


def folders():
    out = [str(p.parent.relative_to(ROOT)) for p in sorted(ROOT.glob('apps/*/netlify.toml')) if p.parent.name != '_template']
    return out + (['site'] if (ROOT / 'site/netlify.toml').exists() else [])


def toml_value(folder, key, text=None):
    text = text if text is not None else (ROOT / folder / 'netlify.toml').read_text()
    m = re.search(rf'^\s*{key}\s*=\s*"([^"]*)"', text, re.M)
    return m.group(1).strip('/') if m else None


def layout(folder):
    publish = toml_value(folder, 'publish') or '.'
    return publish, toml_value(folder, 'functions')


def served(folder, rel):
    """True if the file (relative to the folder) is part of what browsers download."""
    publish, _ = layout(folder)
    if rel.lower().endswith('.md'):
        return False
    if publish == '.':
        return not (rel.startswith(('src/', 'test/', 'tests/', 'node_modules/', 'netlify/'))
                    or rel in ('netlify.toml', 'package.json', 'package-lock.json'))
    return rel.startswith(publish + '/')


def deployed(folder, rel):
    _, functions = layout(folder)
    return served(folder, rel) or bool(functions and rel.startswith(functions + '/') and not rel.lower().endswith('.md'))


def changed_files(base, head='HEAD'):
    return [l for l in git('diff', '--name-only', '--no-renames', base, head).splitlines() if l]


def per_folder(files, pred):
    hit = {}
    for f in files:
        for d in folders():
            if f.startswith(d + '/') and pred(d, f[len(d) + 1:]):
                hit.setdefault(d, []).append(f)
    return hit


# ---------------------------------------------------------------- checks
CYR = re.compile(r'[А-Яа-яЁё]')
REGEX_LITERAL = re.compile(r'([(\[,=:!&|?]\s*)/(?:\\.|\[[^\]\n]*\]|[^/\\\n\[])+/[a-z]*')


def cache_of(text):
    m = re.search(r"const CACHE = '([a-z0-9-]+)-v(\d+)'", text or '')
    return (m.group(1), int(m.group(2))) if m else None


def show(rev, path):
    try:
        return git('show', f'{rev}:{path}')
    except subprocess.CalledProcessError:
        return None


def check(base, head='HEAD'):
    errors = []
    files = changed_files(base, head)

    # 1. every app whose served files changed must bump CACHE in its sw.js by at least one
    for d, fs in per_folder(files, served).items():
        publish, _ = layout(d)
        sw = f'{d}/sw.js' if publish == '.' else f'{d}/{publish}/sw.js'
        new = cache_of(show(head, sw))
        if not new:
            continue                                   # no service worker (the homepage)
        old = cache_of(show(base, sw))
        if old and new[1] <= old[1]:
            errors.append(f'{sw}: files in {d} changed ({", ".join(fs[:3])}{"…" if len(fs) > 3 else ""}) '
                          f'but CACHE is still {new[0]}-v{new[1]} — bump it to {new[0]}-v{old[1] + 1}.')

    for d in folders():
        base_dir = ROOT / d
        publish, _ = layout(d)
        pub = base_dir if publish == '.' else base_dir / publish
        bundled = (base_dir / 'src').is_dir()
        htmls = sorted(pub.glob('*.html'))
        scripts = sorted((base_dir / 'src').rglob('*.js')) if bundled else []
        scripts += [p for p in sorted(pub.glob('*.js')) if not (bundled and p.name == 'app.js') and not p.name.endswith('.min.js')]

        # 2. English UI: Cyrillic only inside regex literals or on lines marked "cyrillic-ok" (import aliases, legacy values)
        for p in htmls + scripts:
            for n, line in enumerate(p.read_text(encoding='utf-8').splitlines(), 1):
                if not CYR.search(line) or 'cyrillic-ok' in line:
                    continue
                if p.suffix == '.js' and not CYR.search(REGEX_LITERAL.sub(r'\1', line)):
                    continue
                errors.append(f'{p.relative_to(ROOT)}:{n}: Cyrillic text — the UI must be English '
                              f'(mark intentional aliases with a "cyrillic-ok" comment).')

        # 3. CSP: no inline scripts or inline event handlers
        for p in htmls + scripts:
            text = p.read_text(encoding='utf-8')
            for m in re.finditer(r'<script\b(?![^>]*\bsrc=)[^>]*>', text) if p.suffix == '.html' else []:
                errors.append(f'{p.relative_to(ROOT)}: inline {m.group(0)} — the CSP blocks it; move the code to a .js file.')
            for m in re.finditer(r'<[a-zA-Z][^<>]*\son[a-z]+\s*=\s*["\'`]', text):
                errors.append(f'{p.relative_to(ROOT)}: inline event handler in "{m.group(0)[:60]}…" — use addEventListener.')

        # 4. required links (Netlify Open Source plan)
        if d.startswith('apps/'):
            blob = '\n'.join(p.read_text(encoding='utf-8') for p in htmls + scripts)
            for needle, what in (('https://www.netlify.com', '"This site is powered by Netlify" link'), (REPO_URL, '"Open source on GitHub" link')):
                if needle not in blob:
                    errors.append(f'{d}: the {what} is missing from the main screen.')

    # 5. every app is listed on the project homepage (site/index.html) with a link to its Netlify site
    home = ROOT / 'site/index.html'
    if home.exists():
        html = home.read_text(encoding='utf-8')
        for d in folders():
            if not d.startswith('apps/'):
                continue
            name = CFG['sites'].get(d) or Path(d).name + '2'
            if f'href="https://{name}.netlify.app"' not in html:
                errors.append(f'site/index.html: no card for {d} — add <a class="app" href="https://{name}.netlify.app"> '
                              f'with an icon in site/icons/ (npm run new-app does this for new apps).')

    # 6. shared files must match their copies
    manifest = ROOT / 'shared/manifest.json'
    if manifest.exists():
        for name, targets in json.loads(manifest.read_text()).items():
            if name.startswith('_'):
                continue
            src = (ROOT / 'shared' / name).read_bytes()
            for t in targets:
                p = ROOT / t / name
                if not p.exists() or p.read_bytes() != src:
                    errors.append(f'{t}/{name} differs from shared/{name} — edit shared/{name} and run "node scripts/sync-shared.mjs".')

    for e in errors:
        print('::error::' + e if os.environ.get('GITHUB_ACTIONS') else 'ERROR ' + e)
    print(f'{len(errors)} problem(s) found.' if errors else 'All checks passed.')
    return 1 if errors else 0


# ---------------------------------------------------------------- Netlify sites
NAME = re.compile(r'^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')


def call(method, path, body=None):
    req = urllib.request.Request('https://api.netlify.com/api/v1' + path, method=method,
                                 data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + os.environ['NETLIFY_AUTH_TOKEN'],
                                          'Content-Type': 'application/json', 'User-Agent': 'pockettools-ci'})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def ensure_site(folder):
    """Find the folder's site by name, or create it. Never deletes or changes an existing site."""
    name = CFG['sites'].get(folder) or Path(folder).name + '2'
    if not NAME.match(name):
        sys.exit(f'Bad site name {name!r} for {folder}')
    for s in call('GET', f'/sites?name={name}&filter=all&per_page=100'):
        if s.get('name') == name:
            return s
    try:
        site = call('POST', f"/{CFG['accountSlug']}/sites", {'name': name})
    except urllib.error.HTTPError as e:
        if e.code == 422:
            sys.exit(f'The site name "{name}" is taken on Netlify. Choose another one in .github/netlify-sites.json → sites → "{folder}".')
        raise
    print(f'Created site {name} for {folder}', file=sys.stderr)
    return site


def sites(dirs):
    for d in dirs:
        s = ensure_site(d)
        domain = (s.get('ssl_url') or s.get('url') or '').split('//')[-1].rstrip('/')
        publish, functions = layout(d)
        firebase = int((ROOT / d / ('' if publish == '.' else publish) / 'config.js').exists())
        # absolute paths: the Netlify CLI resolves netlify.toml paths from the Git root, not from the app folder
        pub = (ROOT / d / ('' if publish == '.' else publish)).resolve()
        fns = (ROOT / d / functions).resolve() if functions else '-'
        print(d, s['id'], domain, firebase, pub, fns)


if __name__ == '__main__':
    cmd, *rest = sys.argv[1:] or ['help']
    if cmd == 'changed':
        for d in per_folder(changed_files(*rest), deployed):
            print(d)
    elif cmd == 'check':
        sys.exit(check(*rest))
    elif cmd == 'sites':
        sites(rest)
    else:
        print(__doc__)
