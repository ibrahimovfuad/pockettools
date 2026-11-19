# Привычки

`public/` — готовый сайт, его и перетаскивай в Netlify Drop.
`src/main.js` — исходник; после правок: `npm install && npm run build`, затем увеличь версию в `public/sw.js` (`habits-v1` → `habits-v2`).
`../../firebase/firestore.rules` — правила доступа (общие для «Настроения» и «Привычек»).

Используется тот же проект Firebase, что и у «Настроения» (`login-e91f7`).
