"""Add the domains listed in firebase/authorized-domains.txt (plus EXTRA_DOMAINS) to Firebase Auth's authorized domains.

Additive only: domains already in Firebase are kept, nothing is ever removed.
Needs an OAuth access token in TOKEN for a service account with the Firebase Authentication Admin role.
"""
import json, os, re, sys, urllib.request

PROJECT = 'login-e91f7'
URL = f'https://identitytoolkit.googleapis.com/admin/v2/projects/{PROJECT}/config'
DOMAIN = re.compile(r'^(localhost|([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63})$')

wanted = []
for line in open('firebase/authorized-domains.txt', encoding='utf-8'):
    d = line.split('#', 1)[0].strip().lower()
    if not d:
        continue
    if not DOMAIN.match(d):
        sys.exit(f'Not a valid domain: {d!r}')
    wanted.append(d)
for d in os.environ.get('EXTRA_DOMAINS', '').split():
    d = d.strip().lower()
    if d and DOMAIN.match(d) and d not in wanted:
        wanted.append(d)

headers = {'Authorization': 'Bearer ' + os.environ['TOKEN'], 'Content-Type': 'application/json', 'X-Goog-User-Project': PROJECT}
with urllib.request.urlopen(urllib.request.Request(URL, headers=headers)) as r:
    current = json.load(r).get('authorizedDomains', [])

missing = [d for d in wanted if d not in current]
print('Current domains:', ', '.join(current))
if not missing:
    print('Nothing to add.')
    sys.exit(0)

body = json.dumps({'authorizedDomains': current + missing}).encode()
req = urllib.request.Request(URL + '?updateMask=authorizedDomains', data=body, headers=headers, method='PATCH')
with urllib.request.urlopen(req) as r:
    after = json.load(r).get('authorizedDomains', [])
print('Added:', ', '.join(missing))
print('Now:', ', '.join(after))
