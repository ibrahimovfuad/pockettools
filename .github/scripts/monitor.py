"""Daily check of every deployed site: it answers, and it runs the version of the latest release tag.

Prints a Markdown report and exits 1 if something is wrong. Used by .github/workflows/monitor.yml.
"""
import re, subprocess, sys, urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import pt  # noqa: E402

tag = subprocess.run(['git', 'describe', '--tags', '--abbrev=0', '--match', 'v*', 'origin/main'],
                     cwd=pt.ROOT, capture_output=True, text=True).stdout.strip()


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'pockettools-monitor', 'Cache-Control': 'no-cache'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.status, r.read().decode('utf-8', 'replace')


rows, problems = [], 0
for d in pt.folders():
    name = pt.CFG['sites'].get(d) or Path(d).name + '2'
    url = f'https://{name}.netlify.app'
    publish, _ = pt.layout(d)
    sw_path = f'{d}/sw.js' if publish == '.' else f'{d}/{publish}/sw.js'
    want = pt.cache_of(pt.show(tag, sw_path)) if tag else None
    try:
        status, _ = fetch(url + '/')
        state, live = ('ok' if status == 200 else f'HTTP {status}'), None
        if want:
            _, sw = fetch(url + '/sw.js')
            live = pt.cache_of(sw)
            if live != want:
                state = f'runs {live[0]}-v{live[1] if live else "?"}, release {tag} has {want[0]}-v{want[1]}' if live else 'no version in sw.js'
    except Exception as e:  # noqa: BLE001
        state = f'unreachable ({e.__class__.__name__}: {e})'
    bad = state != 'ok'
    problems += bad
    rows.append(f'| {"❌" if bad else "✅"} | [{name}]({url}) | `{d}` | {state} |')

print(f'Release tag: `{tag or "none"}`\n')
print('| | Site | Folder | State |\n|---|---|---|---|')
print('\n'.join(rows))
sys.exit(1 if problems else 0)
