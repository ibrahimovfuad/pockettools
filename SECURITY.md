# Security Policy

If you find a security problem in any of the apps, please **do not open a public issue**. Instead, use GitHub's [private vulnerability reporting](../../security/advisories/new) for this repository.

Please include which app is affected, what the issue is, and how to reproduce it. You will get a response as soon as possible, and a fix will be published once it is ready.

## What is in scope

- Every app in `apps/` and the project homepage in `site/` as deployed on the `*.netlify.app` sites listed in the README.
- The Firestore security rules (`firebase/firestore.rules`): reading or changing another user's data, or data that should be rejected.
- The Netlify Functions (`apps/mood`, `apps/digest`, `apps/routes`): the reminder endpoints, the Transitous and vehicle proxies.
- Public Bookshelf friends links (`/u/<id>`): anything that lets a shelf's owner run code or track a visitor.
- The release pipeline in `.github/workflows/`: anything that exposes a secret or lets someone deploy without the owner.

## What is out of scope

- Findings that need a rooted or jailbroken device, malware already on the device, or physical access to an unlocked phone.
- Denial of service by sending large volumes of traffic, and missing rate limits on endpoints that only return public data.
- Third-party services (Firebase, Netlify, Transitous, OpenFreeMap, Open Library, Google Books, PeerJS): report those to the vendor.
- Reports from automated scanners without a demonstrated impact (for example "missing header" with no attack).
- Data you can see because you have the link: a friends link is readable by everyone who has it, by design.

## What the project already does

The rules the code is held to are in the "Security" section of [AGENTS.md](AGENTS.md). In short: every value is escaped when it is put into a page, every site sends a strict Content-Security-Policy and related headers, the Firestore rules accept only the fields the apps write, push endpoints and proxy parameters are checked on the server, and releases run from `main` only with secrets limited to the steps that need them.

## Secrets

No secret belongs in this repository. If you find one, report it the same way (privately) so it can be rotated.
