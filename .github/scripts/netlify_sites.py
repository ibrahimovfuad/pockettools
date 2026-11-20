"""Find or create a Netlify site for every app folder that is not linked to Git.

Usage: netlify_sites.py CHANGED_PATHS_FILE|--all
Prints one line per app to deploy: "<dir> <site_id> <domain>". Needs NETLIFY_AUTH_TOKEN.
Only creates sites and reads site info — never deletes or changes existing sites.
"""
import json, os, re, sys, urllib.error, urllib.request
from pathlib import Path

API = 'https://api.netlify.com/api/v1'
CFG = json.loads(Path('.github/netlify-sites.json').read_text())
TOKEN = os.environ['NETLIFY_AUTH_TOKEN']
NAME = re.compile(r'^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body is not None else None,
                                 headers={'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'User-Agent': 'pockettools-ci'})
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def find(name):
    for s in call('GET', f'/sites?name={name}&filter=all&per_page=100'):
        if s.get('name') == name:
            return s
    return None

def ensure(app_dir):
    # Site name = the name chosen in .github/netlify-sites.json, else the folder name + "2". Never invented:
    # if it is taken by someone else, stop and ask for another name instead of adding a suffix.
    name = CFG['names'].get(app_dir) or Path(app_dir).name + '2'
    if not NAME.match(name):
        sys.exit(f'Bad site name {name!r} for {app_dir}')
    site = find(name)
    if site:
        return site, False
    try:
        site = call('POST', f"/{CFG['accountSlug']}/sites", {'name': name})
    except urllib.error.HTTPError as e:
        if e.code == 422:
            sys.exit(f'The site name "{name}" is already taken on Netlify. Pick another one and set it in '
                     f'.github/netlify-sites.json → names → "{app_dir}".')
        raise
    print(f'Created site {name} for {app_dir}', file=sys.stderr)
    return site, True

apps = sorted(str(p.parent) for p in Path('apps').glob('*/netlify.toml')
              if p.parent.name != '_template' and str(p.parent) not in CFG['gitLinked'])
deploy_all = sys.argv[1] == '--all'
changed = set() if deploy_all else {l.strip() for l in Path(sys.argv[1]).read_text().splitlines() if l.strip()}

for app in apps:
    site, created = ensure(app)
    touched = deploy_all or created or any(p == app or p.startswith(app + '/') for p in changed)
    domain = (site.get('ssl_url') or site.get('url') or '').split('//')[-1].rstrip('/')
    if touched:
        print(app, site['id'], domain)
    else:
        print(f'{app}: no changes, skipping deploy ({domain})', file=sys.stderr)
