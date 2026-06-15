# План: авторизация, регистрация и онбординг канала

План внедрения экранов **входа / регистрации** при первом заходе на сайт и сценария **нулевого аккаунта** с подключением демо-канала.

**Статус:** план утверждён (константы demo зафиксированы), к реализации не приступали.

**Контекст:** сейчас приложение открывается сразу на `/` без auth-gate; данные — MSW + seed (`@dengibeznpaniki`, 5 постов, чаты, заметки). Профиль Telegram уже симулирует подключение канала в `useTelegramBlock`, но без привязки к сессии пользователя.

**Связанные документы:** [local-first.md](./local-first.md), [routing.md](./routing.md), [github-pages-architecture.md](./github-pages-architecture.md), [09-profile.md](../ux/wireframes/09-profile.md).

---

## Цели

| # | Цель |
|---|------|
| 1 | Первый заход → экран **входа** (не shell с sidebar) |
| 2 | Логин и пароль **уже заполнены**, можно редактировать; одна кнопка «Войти» |
| 3 | Ссылка **«Не помню пароль»** (stub-flow, как смена пароля в профиле) |
| 4 | Переключение на **регистрацию**: почта → пароль → код из почты |
| 5 | После регистрации — **нулевой аккаунт**: пустая лента, нет чатов/заметок, канал не подключён |
| 6 | В поле канала — заготовка **`@demo_kanal`** (не «Деньги без паники»); по «Подключить» подтягиваются посты из «базы» |
| 7 | Демо-вход по prefilled-логину — быстрый путь на **полный demo** (текущий seed) для презентации |

---

## Зафиксированные константы (demo)

| Параметр | Значение |
|----------|----------|
| Demo email | `demo@mail.ru` |
| Demo password | `Demo!2026` |
| Канал fresh-аккаунта (handle) | `@demo_kanal` |
| Канал fresh-аккаунта (title) | `Демо канал` |
| MSW account id (demo-login) | `demo-full` |

Prefill на `/login/`: email и пароль уже в полях (`demo@mail.ru` / `Demo!2026`), редактируемые.  
MSW `POST /auth/login` принимает **только** эту пару для входа в `demo-full` (регистрация не перезаписывает demo-учётку).

---

## Два типа аккаунта (demo)

```
┌─────────────────────┐     Войти (prefilled)      ┌──────────────────────────┐
│  /login/            │ ─────────────────────────► │  account: demo-full       │
│  demo@mail.ru       │                            │  seed как сейчас          │
│  Demo!2026          │                            │  @dengibeznpaniki connected│
└─────────────────────┘                            └──────────────────────────┘

┌─────────────────────┐     Регистрация            ┌──────────────────────────┐
│  /register/         │ ─────────────────────────► │  account: fresh-{id}      │
│  новая почта        │                            │  пусто + онбординг канала │
│  код из почты       │                            │  @demo_kanal → импорт постов│
└─────────────────────┘                            └──────────────────────────┘
```

| Аккаунт | Назначение | Данные после входа |
|---------|------------|-------------------|
| `demo-full` | Prefilled login, QA, GitHub Pages demo | Текущий `seed-data.ts` (5 постов, gc1/gc2, gn1–gn4, профиль «Деньги без паники») |
| `fresh-*` | Новый пользователь после регистрации | Пустые списки; Telegram `idle`; в поле канала `@demo_kanal`; после connect — посты из пула канала |

---

## Пользовательские сценарии

### 1. Первый визит → Вход

1. Пользователь открывает сайт → редирект на `/login/` (нет сессии).
2. Форма: **Email**, **Пароль** — поля уже заполнены (`demo@mail.ru` / `Demo!2026`).
3. Поля редактируемые.
4. **«Войти»** → `POST /api/v1/auth/login` → сессия `demo-full` → redirect `/feed/` (или `/` — решить в UX).
5. Ошибка при неверных данных — toast.

### 2. Не помню пароль

1. На `/login/` ссылка «Не помню пароль» → `/login/forgot/` (или модалка).
2. Email (prefill из формы входа).
3. «Отправить код» → stub (как `useUserBlock`: `confirm-send` → `code`).
4. Код: для demo принять фиксированный, напр. `000000`, или любой 6-значный в MSW.
5. Новый пароль + подтверждение → успех → возврат на `/login/` с toast.

**MVP:** без реальной почты; баннер «Демо: код 000000».

### 3. Регистрация

1. На `/login/` ссылка «Создать аккаунт» → `/register/`.
2. Шаги (одна страница с stepper или 2–3 экрана):
   - **Email** — валидация, предпочтительно домен `@mail.ru` (не блокировать другие в demo).
   - **Пароль** — минимальная сила (переиспользовать `passwordStrength` из профиля).
   - **Код из почты** — `POST /auth/register/send-code`, затем `POST /auth/register/verify`.
3. Успех → сессия `fresh-{uuid}` → redirect **`/onboarding/channel/`** (не feed).

### 4. Онбординг канала (нулевой аккаунт)

1. Экран без sidebar (или shell с урезанным header): «Подключите Telegram-канал».
2. Поле канала **предзаполнено** `@demo_kanal` (редактируемое).
3. Кнопка **«Подключить канал»** — переиспользовать логику `useTelegramBlock.connectChannel` + MSW:
   - `telegram.channelStatus: connected`
   - `channel: @demo_kanal`, `channelTitle: Демо канал`
   - Импорт постов из **пула канала** (не из текущего глобального seed).
4. После успеха → `/feed/` с подтянутыми постами.
5. Профиль канала (core/voice/rules) — **пустой шаблон** или минимальный preset для `demo_kanal`.

### 5. Повторный визит

- Сессия в `localStorage` (+ опционально MSW store привязан к `accountId`).
- Valid session → сразу shell, без `/login/`.
- Logout в профиле → clear session → `/login/`.

---

## Маршрутизация

Новая группа **`app/(auth)/`** — без `AppShell` / sidebar.

| URL | Экран | Доступ |
|-----|-------|--------|
| `/login/` | Вход | только без сессии |
| `/login/forgot/` | Восстановление пароля | без сессии |
| `/register/` | Регистрация | без сессии |
| `/onboarding/channel/` | Подключение канала | `fresh-*`, канал не connected |

Существующая **`app/(shell)/`** — только с валидной сессией.

```
app/
  (auth)/
    layout.tsx          # центрированная карточка, без sidebar
    login/page.tsx
    login/forgot/page.tsx
    register/page.tsx
    onboarding/channel/page.tsx
  (shell)/
    layout.tsx          # + AuthGuard
    ...
```

**`AuthGuard`** (client): нет сессии → `router.replace(routes.login())`; `fresh` + channel не connected + не на onboarding → `routes.onboardingChannel()`.

Обновить [`routes.ts`](../../src/shared/lib/routes.ts) и [routing.md](./routing.md).

---

## UI / UX (черновик)

- Одна **карточка** по центру viewport (как profile-section, но крупнее).
- Переключатель вкладок **Вход | Регистрация** или ссылка внизу формы.
- Mobile: те же экраны, `font-size: 16px` на inputs (см. [mobile-ux-fix-plan.md](./mobile-ux-fix-plan.md)).
- Стили: `shell-auth.css` или секция в `shell-profile-page.css` — **не** копировать legacy (новый экран).

Wireframe-задача (после утверждения плана): `docs/ux/wireframes/10-auth.md`.

---

## Данные и MSW

### Сессия (клиент)

```ts
type AuthSession = {
  token: string;           // demo: random uuid
  accountId: string;       // "demo-full" | "fresh-{uuid}"
  email: string;
  createdAt: string;
};
```

- Хранение: `localStorage` ключ `tg-platform-auth-session`.
- Provider: `AuthProvider` + `useAuth()`; заголовок `Authorization: Bearer` для HTTP repos (MSW читает).

### MSW: новые endpoints

| Method | Path | Поведение |
|--------|------|-----------|
| POST | `/api/v1/auth/login` | `demo@mail.ru` + `Demo!2026` → `demo-full`; иначе 401 |
| POST | `/api/v1/auth/logout` | invalidate (client clear) |
| POST | `/api/v1/auth/register/send-code` | сохранить pending registration в store |
| POST | `/api/v1/auth/register/verify` | создать `fresh-*`, вернуть session |
| POST | `/api/v1/auth/forgot-password/send-code` | stub OK |
| POST | `/api/v1/auth/forgot-password/reset` | stub OK (demo-full only) |

Обновить [API_CONTRACT.yaml](./API_CONTRACT.yaml) и [api-schemas.md](./api-schemas.md).

### MSW store: multi-tenant

Сейчас один глобальный `msw store` из seed. Нужно:

```ts
type MswAccountState = {
  posts: Post[];
  globalChats: GlobalChat[];
  globalNotes: GlobalNote[];
  channelProfile: ChannelProfileConfig;
  aiProfile: AiProfileConfig;
  telegramProfile: TelegramProfileConfig;
};

accounts: Map<accountId, MswAccountState>;
```

- **`demo-full`:** клон текущего `seed-data.ts` при старте worker.
- **`fresh-*`:** `emptyAccountState()` — пустые массивы, telegram `idle`, channel field `@demo_kanal` в UI (не connected).
- **Handlers** фильтруют по `accountId` из Bearer token.

### Пул постов канала `@demo_kanal`

Отдельный файл, напр. `shared/data/channel-pools/demo_kanal-posts.ts`:

- 3–5 постов (можно адаптировать текущий seed или упростить тексты).
- При `connectChannel` + handle `@demo_kanal` (нормализация: `demo_kanal`, `@demo_kanal`) → `posts.list()` для аккаунта = клон пула.
- `importedPosts: N`, `lastSync: сейчас` — как в текущем Telegram stub.

**Важно:** аккаунт `demo-full` **не** использует `@demo_kanal` — остаётся `@dengibeznpaniki`.

---

## FSD: слои и файлы

| Слой | Что добавить |
|------|----------------|
| `entities/auth` | типы `AuthSession`, `LoginDto`, repository `auth.login/register/...` |
| `features/auth-login` | форма входа, forgot password |
| `features/auth-register` | форма регистрации + verify code |
| `features/auth-guard` | `AuthGuard`, `useRequireAuth` |
| `screens/login` | `LoginScreen`, `ForgotPasswordScreen` |
| `screens/register` | `RegisterScreen` |
| `screens/onboarding` | `ChannelOnboardingScreen` |
| `app/(auth)/` | layouts + pages |
| `shared/api/msw` | auth handlers + account-scoped store |

Переиспользовать:

- `useTelegramBlock` / `TelegramChannelSection` — вынести «только подключение канала» для onboarding или упростить копию.
- Валидация пароля из `useUserBlock` / `passwordStrength`.

---

## Фазы реализации

### Фаза 0 — Контракт и каркас (0.5–1 д)

- [ ] Документ API auth + типы `AuthSession`
- [ ] `routes.login()`, `register()`, `onboardingChannel()`
- [ ] `app/(auth)/layout` + пустые страницы
- [ ] `AuthProvider` + localStorage session
- [ ] `AuthGuard` на `(shell)/layout`

### Фаза 1 — Вход (1 д)

- [ ] `LoginScreen`: prefilled email/password, submit
- [ ] MSW `POST /auth/login` → `demo-full`
- [ ] Redirect в shell; E2E: open site → login → feed visible

### Фаза 2 — Регистрация (1 д)

- [ ] `RegisterScreen`: email, password, code step
- [ ] MSW register handlers + создание `fresh-*` state
- [ ] Redirect → onboarding

### Фаза 3 — Нулевой аккаунт и канал (1–1.5 д)

- [ ] `emptyAccountState()` + account-scoped MSW handlers для posts/chats/notes/profile
- [ ] `ChannelOnboardingScreen` с `@demo_kanal`
- [ ] `demo_kanal-posts.ts` + импорт при connect
- [ ] Пустая лента → connect → посты появляются
- [ ] E2E: register → onboarding → connect → feed has posts

### Фаза 4 — Забыл пароль (0.5 д)

- [ ] `/login/forgot/` stub flow
- [ ] Демо-подсказка с кодом

### Фаза 5 — Полировка (0.5 д)

- [ ] Logout в профиле
- [ ] Обновить `local-first.md`, `routing.md`, `parity.md`
- [ ] Smoke на GitHub Pages (сессия в localStorage сохраняется между reload)

**Оценка суммарно:** ~4–5 дней.

---

## Критерии готовности

- [ ] Без сессии любой URL shell → `/login/`
- [ ] Prefilled login → полный demo (5 постов, sidebar, профиль «Деньги без паники»)
- [ ] Регистрация → пустой feed, нет gc/gn
- [ ] Onboarding: поле `@demo_kanal`, connect → посты из пула
- [ ] «Не помню пароль» — проходимый stub
- [ ] `npm run check` + E2E smoke auth paths
- [ ] MSW на Pages: auth работает после reload (session в localStorage)

---

## Оставшиеся решения (не блокируют старт)

| # | Вопрос | Предложение по умолчанию |
|---|--------|-------------------------|
| 1 | Куда редирект после demo-login | `/feed/` |
| 2 | Обязателен ли `@mail.ru` при регистрации | мягкая подсказка, не hard block |
| 3 | Нужен ли Telegram API шаг до канала для fresh | **нет** в MVP — сразу поле канала |
| 4 | Сброс MSW при logout | да — fresh-аккаунты теряются; demo-full пересоздаётся из seed |

---

## Вне scope (сейчас)

- Реальный SMTP / OAuth
- JWT с expiry и refresh
- Backend M7 (перенос контракта на настоящий API)
- Подключение каналов кроме `@demo_kanal` в fresh-аккаунте (можно разрешить ввод, но посты только для demo pool)

---

## История

| Дата | Изменение |
|------|-----------|
| 2026-06-15 | Первый черновик плана |
| 2026-06-15 | Зафиксированы demo@mail.ru / Demo!2026, канал @demo_kanal |
