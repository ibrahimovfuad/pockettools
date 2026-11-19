# Настроение — трекер дня

Оцениваешь день по шкале 0–10, по желанию пишешь комментарий, смотришь графики за неделю, месяц и год. Вход через Google, данные в Firebase, ежедневное напоминание через push-уведомления.

## Что где лежит

```
public/            ← сам сайт (это и выкладывается)
  config.js        ← сюда вставить настройки Firebase (шаг 2)
  _redirects       ← сюда вставить ID проекта Firebase (шаг 2)
netlify/functions/ ← сервер напоминаний
../../firebase/firestore.rules ← правила доступа к данным (шаг 1)
src/main.js        ← исходник приложения (после правок: npm run build)
```

**Попробовать сразу:** перетащи папку `public` в Netlify Drop. Пока в `config.js` стоят заглушки, приложение работает в демо-режиме: без входа, данные хранятся только на этом устройстве.

---

## 1. Firebase (≈10 минут)

1. Открой https://console.firebase.google.com → **Create a project**. Google Analytics можно выключить.
2. **Build → Authentication → Get started → Sign-in method → Google** → Enable → выбери свою почту → Save.
3. **Build → Firestore Database → Create database** → регион `eur3 (europe-west)` → **Production mode**.
4. Там же вкладка **Rules** → удали всё → вставь содержимое файла `../../firebase/firestore.rules` → **Publish**.
5. **⚙ Project settings → General → Your apps → значок `</>`** → придумай имя → Register app. Откроется блок `firebaseConfig`, он нужен в шаге 2.

## 2. Вставить настройки

- В `public/config.js` замени `PASTE_...` на значения из `firebaseConfig`: `apiKey`, `projectId`, `appId`, `messagingSenderId`, `storageBucket`.
- В `public/_redirects` замени `PASTE_PROJECT_ID` (в двух местах) на `projectId`.

## 3. Выложить на Netlify через CLI

Drag & drop не умеет выкладывать серверные функции, а они нужны для напоминаний. Поэтому в Терминале на Маке (нужен Node.js — https://nodejs.org):

```bash
cd путь/к/папке/mood
npm install
npx netlify-cli login
npx netlify-cli deploy --prod
```

На вопрос выбери **Create & configure a new project**, придумай имя (например `mood-fuad`). В конце будет адрес вида `https://mood-fuad.netlify.app` — запомни его.

## 4. Ключи для напоминаний

```bash
npx web-push generate-vapid-keys
```

Скопируй оба ключа и выполни (подставь свои значения):

```bash
npx netlify-cli env:set VAPID_PUBLIC_KEY  "Public Key из вывода"
npx netlify-cli env:set VAPID_PRIVATE_KEY "Private Key из вывода"
npx netlify-cli env:set VAPID_SUBJECT     "mailto:твоя@почта"
npx netlify-cli env:set FIREBASE_PROJECT_ID "projectId из Firebase"
npx netlify-cli deploy --prod
```

Private Key никому не показывай.

## 5. Разрешить вход с твоего домена

1. Firebase → **Authentication → Settings → Authorized domains → Add domain** → `mood-fuad.netlify.app`.
2. https://console.cloud.google.com → выбери этот же проект → **APIs & Services → Credentials** → в разделе OAuth 2.0 Client IDs открой **Web client (auto created by Google Service)** → **Authorized redirect URIs → Add URI** → `https://mood-fuad.netlify.app/__/auth/handler` → Save. Применяется до 5 минут.

## 6. На iPhone

Открой адрес в Safari → «Поделиться» → «На экран Домой» → запусти с иконки → войди через Google → **Настройки → Напоминание**. Кнопкой «Прислать проверочное уведомление» можно проверить, что всё работает.

Уведомления на iPhone приходят только в установленном приложении и только на iOS 16.4+. Напоминание не придёт, если день уже оценён.

---

## Если что-то не так

- **«Этот домен не добавлен…» при входе** — шаг 5.1.
- **Ошибка `redirect_uri_mismatch` на странице Google** — шаг 5.2.
- **Напоминание включается, но не приходит в выбранный час** — Netlify → твой сайт → **Logs & metrics → Functions → reminder-cron** — нажми **Run now** и посмотри лог. Функция запускается раз в час, поэтому время напоминания — с точностью до часа.
- **Поменял файлы** — в `public/sw.js` увеличь версию `mood-v1` → `mood-v2` и снова `npx netlify-cli deploy --prod`. Если менял `src/main.js`, перед этим `npm run build`.
