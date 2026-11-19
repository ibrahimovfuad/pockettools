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

1. Copy `apps/_template/` to `apps/<your-app-name>/`.
2. Keep the app independent: it should not import files from other app folders.
3. Fill in its `README.md` and adjust `netlify.toml`.
4. Keep the "This site is powered by Netlify" link on the app's main screen (see any existing app, class `nf`).
5. Add a row to the apps table in the root `README.md`.

## Guidelines

- Keep apps small, dependency-light and readable.
- Never commit secrets (API keys, private keys, tokens). Use environment variables and document them in the app's README.
- Make sure the app still works on mobile Safari and Chrome.
- One topic per pull request, with a short description of what changed and why.

By contributing you agree that your contribution is licensed under the [MIT License](LICENSE) and that you will follow the [Code of Conduct](CODE_OF_CONDUCT.md).
