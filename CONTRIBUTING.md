# Contributing

Thanks for your interest! This is a small hobby project, so contributions of every size are welcome — a typo fix is just as appreciated as a new feature.

## Ways to help

- **Report a bug** — open an issue with the "Bug report" template. Tell us which app, which device/browser, and how to reproduce it.
- **Suggest an idea** — open an issue with the "Feature request" template.
- **Send a pull request** — fixes, improvements, translations, or a whole new tool.

## Working on an app

Each app is self-contained in `apps/<app-name>/`. Its README explains how to run it locally. Most apps are plain HTML/JS and only need a static server:

```bash
cd apps/<app-name>
npx serve .
```

Apps with a build step (for example Vite) use:

```bash
npm install
npm run dev
```

## Adding a new app

```bash
npm install                      # repository tooling, once
npm run new-app -- notes --title "Notes" --desc "Quick notes to self." [--firebase]
```

This copies `apps/_template/` to `apps/notes/` and lists the new app everywhere it has to appear (README, AGENTS.md, the homepage, the Netlify site list, shared files and, with `--firebase`, the Firebase domains). Keep the app independent: it must not import files from other app folders.

## Pull requests and checks

`main` is protected: every change goes through a pull request from a branch, and the **CI** workflow must pass before it can be merged. CI checks that bundles are rebuilt, service-worker versions are bumped, the UI is in English, there are no inline scripts, the required links are present and shared files are in sync; it also opens every app in an iPhone-sized WebKit window and runs the Firestore rules tests on the emulator. You can run most of it locally:

```bash
npm run check                    # repository checks against origin/main
npm run test:smoke               # needs: npx playwright install webkit
npm run test:rules               # needs Java 11+
```

Merging does not deploy anything — releases do. The maintainer creates a release with `npm run release` (it tags the latest `main` and pushes the tag; the tag deploys every folder that changed since the previous release), or from GitHub → Releases → Draft a new release. The Actions "Run workflow" button is only for emergency redeploys. See [AGENTS.md](AGENTS.md#releases).

## Guidelines

See [AGENTS.md](AGENTS.md) for the full list of project rules (build steps, service-worker versions, CSP, required links). It is written for AI coding agents but applies to everyone.


- Keep apps small, dependency-light and readable.
- Never commit secrets (API keys, private keys, tokens). Use environment variables and document them in the app's README.
- Make sure the app still works on mobile Safari and Chrome.
- One topic per pull request, with a short description of what changed and why.

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE) and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
