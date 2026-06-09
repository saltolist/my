# Связь с reusable-modules

> **Не входит в legacy UI.** Документ про **целевую модульную сборку backend** и интеграции (MemPalace, оркестрация, persistence). Экраны и поведение web-клиента задаёт [pages.md](../ux/pages.md) и `web-legacy`.

Документ описывает, как `TG Platform` собирается на базе модулей из `reusable-modules`.

Цель: использовать не монолит, а переиспользуемые блоки с понятной ответственностью, чтобы:

- быстро собрать рабочий MVP;
- поэтапно усиливать архитектуру без переписывания ядра;
- сохранить совместимость с будущими проектами на том же модульном стеке.

---

## Базовый принцип сборки

`TG Platform` = продуктовый слой + набор подключаемых модулей.

- Продуктовый слой: UI, сценарии, структура страниц, предметная логика (канал, посты, заметки).
- Модульный слой: контекст, оркестрация, агентные действия, синхронизация каналов, безопасность.

Каждый модуль может работать отдельно. `AI Orchestrator Layer` подключается как мета-координатор, когда нужна единая маршрутизация сложных сценариев.

---

## Карта соответствия: функции платформы -> модуль

### 1) Генерация и вариативность ответов ИИ

- Модуль: `AI Model & Search Bundles`
- Роль в TG Platform:
  - выбор связок `модель + AI-поиск`,
  - альтернативные ответы в глобальном и локальном чате,
  - управляемое качество вместо жесткой зависимости от одной модели.

### 2) Контекст, память, RAG/MemPalace

- Модуль: `Memory & Context Engine`
- Роль в TG Platform:
  - сбор контекста для глобального и локального ИИ,
  - переключение `mempalace / RAG / hybrid`,
  - формирование summary pack перед LLM.

### 3) Действия ассистента (publish/schedule/edit/delete)

- Модуль: `Agent Actions Layer`
- Роль в TG Platform:
  - перевод команд пользователя в операции с постами,
  - валидируемый action-пайплайн,
  - trace выполнения для прозрачности.

### 4) Центральная координация сложных запросов

- Модуль: `AI Orchestrator Layer` (опционально)
- Роль в TG Platform:
  - intent-routing между модулями,
  - единые правила маршрутизации и fallback,
  - выбор режима исполнения (последовательный/параллельный).

### 5) Синхронизация ленты и метрик Telegram <-> Web

- Модуль: `TG Feed Sync & Analytics Layer`
- Роль в TG Platform:
  - единый источник правды по постам,
  - статусы `черновик / отложен / опубликован`,
  - метрики и аналитика по постам/рубрикам/периодам.

### 6) Омниканальный контур Web <-> Telegram-бот

- Модуль: `Omnichannel Sync (Web <-> Telegram)`
- Роль в TG Platform:
  - общий синхронизируемый чат между web и bot,
  - непрерывный диалог без потери состояния при смене канала.

### 7) Privacy-by-design и защита данных

- Модуль: `Data Depersonalization Layer`
- Роль в TG Platform:
  - маскирование PII/секретов до LLM,
  - очистка контекста, логов и аналитических контуров,
  - контроль безопасности в self-hosted и production-сценариях.

---

## Рекомендуемый порядок подключения

### Фаза A (минимальный рабочий AI-контур)

1. `AI Model & Search Bundles`
2. `Memory & Context Engine`
3. `TG Feed Sync & Analytics Layer`

Результат: рабочая лента, базовый глобальный/локальный ИИ, контекст и метрики.

### Фаза B (управляемые действия ассистента)

4. `Agent Actions Layer`

Результат: ассистент не только отвечает, но и выполняет операции с постами.

### Фаза C (масштабирование сложных сценариев)

5. `AI Orchestrator Layer` (включается при необходимости)

Результат: централизованная маршрутизация multi-module запросов и fallback-логика.

### Фаза D (омниканальность и безопасность production)

6. `Omnichannel Sync (Web <-> Telegram)`
7. `Data Depersonalization Layer`

Результат: единый путь пользователя через web+telegram и защищенный контур данных.

---

## Базовые архитектурные связки

### MVP (быстрый старт)

- `TG Feed Sync & Analytics Layer`
- `Memory & Context Engine`
- `AI Model & Search Bundles`

### Extended MVP

- MVP +
- `Agent Actions Layer`

### Production stack

- Extended MVP +
- `AI Orchestrator Layer`
- `Omnichannel Sync (Web <-> Telegram)`
- `Data Depersonalization Layer`

---

## Правила интеграции в TG Platform

- `Memory & Context Engine` и `AI Model & Search Bundles` должны быть независимыми от UI-слоя.
- `Agent Actions Layer` должен вызывать только явно разрешенный каталог инструментов.
- `AI Orchestrator Layer` не заменяет модули, а координирует их.
- `TG Feed Sync & Analytics Layer` задает каноническое состояние постов для UI и действий агента.
- `Data Depersonalization Layer` ставится обязательным этапом перед LLM в production-контуре.

---

## Как это влияет на текущую документацию TG Platform

- `web/docs/product/02-modules.md` описывает продуктовые модули интерфейса.
- Этот документ (`11-reusable-modules-integration.md`) описывает системный слой реализации.
- `web/docs/product/04-ai-system.md` и `web/docs/product/04b-ai-system-mempalace.md` становятся прикладной проекцией `Memory & Context Engine`.
- `web/docs/product/06-analytics.md` и `web/docs/ux/wireframes/08-analytics.md` должны опираться на `TG Feed Sync & Analytics Layer`.

---

## Источник модулей

Модули и их детальные описания находятся в каталоге:

- `reusable-modules/README.md`
- `reusable-modules/docs/*.md`
