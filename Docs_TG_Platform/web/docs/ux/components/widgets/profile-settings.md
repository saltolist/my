# profile-settings

**Путь:** `web-legacy/src/widgets/profile-settings/`

Контент трёх вкладок профиля.

---

## Tab index

| Index | Tab | Default |
|-------|-----|---------|
| 0 | Настройки | **active on load** |
| 1 | Канал | |
| 2 | Аналитика платформы | |

Switch with dirty confirm on tabs 0 and 1.

---

## ThemeBlock

Section title: **«Тема»**

Three segment buttons:

| Button | data-theme |
|--------|------------|
| ☀ Светлая | light |
| 🖥 Системная | system |
| 🌙 Тёмная | dark |

Persists to localStorage immediately.

---

## AiModelsBlock

### Sections (AiModelListSection + AiModelRow)

Each row:
- ModelPicker (provider/model)
- API key input + PasswordToggleIcon
- «Включить в мультиответ» checkbox (LLM/Web only)
- «Сделать активной» / remove row

| Section | showMultiToggle | exclusive |
|---------|-----------------|-----------|
| LLM-модели | yes | no |
| Web Search модели | yes | no |
| Оркестратор | no | yes |
| Web Reasoner | no | yes |
| RAG Reasoner | no | yes |

### Multi-response block

- ProfileCheckbox «Мультиответ»
- Hint when <2 eligible model pairs
- Per-model includeInMulti flags

### SystemPromptBlock

Large textarea, bordered, explicit save with profile settings dirty state.

---

## TelegramBlock

### TelegramStatusHeader

Connection status + **Сбросить настройки**

### TelegramApiCredentialsSection

- api_id, api_hash inputs
- Save / Cancel when changed from saved

### TelegramAuthSection

- Phone input (formatted)
- Code input (hidden toggle)
- Send code / Confirm / Resend cooldown

### TelegramChannelSection

- Channel selector input
- Connect / Disconnect channel buttons

### TelegramOmnibotSection

- Bot API token input
- Separate from MTProto user auth

**Not in UI:** sessionName, syncMode (types exist in seed only).

---

## UserBlock

User account section (email, password steps) — partial auth UI.

---

## ChannelTab

Intro: «Канал как база знаний ИИ»

### ChannelProfileSection

| Subsection | Fields |
|------------|--------|
| Ядро канала | О чём канал, Цель, ЦА, Ценность, Портрет автора |
| Голос и формат | Тон, Обращение, Базовый формат поста |
| Правила | Обязательно, Избегать |

Save/Reset when `channelProfileDirty`.

### ChannelRubricsSection

Dynamic list: **название + описание** per rubric.

Add / remove rubric rows. Separate dirty state `rubricsDirty`.

### Footer note

«Технические настройки — на вкладке Настройки»

---

## PlatformAnalyticsBlock

| Section | Content |
|---------|---------|
| PlatformModelsChartSection | Cost/usage trend chart, model type filter, period |
| PlatformModelUsageSection | Table of model usage totals |
| PlatformActivitySection | Mini metrics: chats, notes, posts activity |

Period picker may move to PageHeader when `periodInHeader`.

---

## ProfileSyncRow

Pairs textarea fields that sync height when side-by-side on desktop.

---

## Primitives

- `ProfileCheckbox` — styled checkbox
- `ChannelFormPrimitives` — Area (label + textarea), ChannelSubsection
- `ProfileSyncRow` — paired field layout

---

## Related

- [ModelPicker](../shared-ui.md#modelpicker)
- [charts](./charts.md) — platform analytics charts
