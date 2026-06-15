import type {
  AiProfileConfig,
  ChannelProfileConfig,
  GlobalChat,
  GlobalNote,
  Post,
  TelegramProfileConfig,
} from "@/shared/types";
import {
  PRESENTATION_CHANNEL_HANDLE,
  PRESENTATION_CHANNEL_TITLE,
} from "@/shared/lib/auth/constants";
import type { MswStore } from "@/shared/api/msw/store";

export const PRESENTATION_POST_IDS = [21, 22, 23, 24] as const;
export const PRESENTATION_GLOBAL_NOTE_IDS = ["pn1", "pn2", "pn3"] as const;
export const PRESENTATION_GLOBAL_CHAT_IDS = ["pc1", "pc2"] as const;

const presentationPosts: Post[] = [
  {
    id: 21,
    status: "published",
    date: "12 июн · 10:00",
    rubric: "Обзор",
    metrics: {
      views: "1 240",
      reposts: 8,
      reactions: [
        { emoji: "👋", count: 42 },
        { emoji: "✨", count: 18 },
      ],
    },
    text: `Добро пожаловать в TG Platform — рабочее пространство для автора Telegram-канала.

Здесь вы ведёте ленту, планируете публикации, собираете заметки и общаетесь с ИИ в контексте канала. Всё в одном интерфейсе: без переключения между десятком сервисов.

Это демо-канал «Презентация»: посты ниже показывают, как устроена платформа. Нажмите «Войти» внизу слева, чтобы создать свой аккаунт или войти в демо.`,
    notes: [],
    comments: [],
    chats: [],
  },
  {
    id: 22,
    status: "published",
    date: "12 июн · 11:15",
    rubric: "Лента",
    metrics: { views: "980", reposts: 5, reactions: [{ emoji: "📰", count: 31 }] },
    text: `Лента — центр работы с контентом канала.

✦ Опубликованные посты сгруппированы по дням
✦ Черновики и отложенные публикации — отдельные секции
✦ Композер внизу: текст, медиа и быстрая отправка в черновик
✦ Клик по посту открывает чат, заметки и комментарии

После подключения своего Telegram-канала в настройках сюда подтягиваются реальные публикации.`,
    notes: [],
    comments: [],
    chats: [],
  },
  {
    id: 23,
    status: "published",
    date: "12 июн · 12:30",
    rubric: "ИИ",
    metrics: { views: "860", reposts: 4, reactions: [{ emoji: "🤖", count: 27 }] },
    text: `Заметки и чаты с ИИ помогают готовить контент осознанно.

Заметки бывают глобальными (для всего канала) и локальными (привязаны к посту). Чаты — глобальные обсуждения и локальные диалоги внутри поста.

ИИ видит базу знаний канала, системный промпт и выбранные модели из настроек. Вы сами решаете, какие заметки включать в контекст.`,
    notes: [],
    comments: [],
    chats: [],
  },
  {
    id: 24,
    status: "published",
    date: "12 июн · 14:00",
    rubric: "Аналитика",
    metrics: { views: "720", reposts: 3, reactions: [{ emoji: "📊", count: 19 }] },
    text: `Аналитика и настройки закрывают цикл «планирую → публикую → смотрю результат».

В разделе аналитики — динамика канала, тепловая карта активности и топ постов. В профиле — подключение Telegram, ИИ-движок, база знаний канала и метрики использования моделей.

Создайте аккаунт через «Войти», подключите канал и начните с чистого листа — или войдите в полное демо с готовым наполнением.`,
    notes: [],
    comments: [],
    chats: [],
  },
];

const presentationGlobalNotes: GlobalNote[] = [
  {
    id: "pn1",
    title: "С чего начать на платформе",
    ai: true,
    date: "12 июн",
    body:
      "1. Изучите ленту и боковое меню\n2. Откройте заметки и чаты — там примеры работы с ИИ\n3. Загляните в аналитику\n4. Нажмите «Войти» и зарегистрируйте аккаунт\n5. В профиле подключите Telegram-канал",
  },
  {
    id: "pn2",
    title: "Навигация и разделы",
    ai: false,
    date: "12 июн",
    body:
      "Главная — быстрый глобальный чат. Лента — посты канала. Чаты и заметки — личное рабочее пространство. Аналитика — метрики канала. Профиль доступен после входа.",
  },
  {
    id: "pn3",
    title: "ИИ-движок в двух словах",
    ai: true,
    date: "12 июн",
    body:
      "В настройках профиля задаются LLM, веб-поиск, оркестраторы и системный промпт. База знаний канала — на отдельной вкладке. Каждый аккаунт настраивает ИИ под себя.",
  },
];

const presentationGlobalChats: GlobalChat[] = [
  {
    id: "pc1",
    title: "Что умеет TG Platform?",
    preview: "Кратко перечисли возможности платформы для автора канала",
    date: "12 июн",
    history: [
      { role: "user", text: "Кратко перечисли возможности платформы для автора канала" },
      {
        role: "ai",
        llmLabel: "OpenAI / gpt-4o",
        text:
          "TG Platform объединяет ленту постов, планирование публикаций, заметки, чаты с ИИ, аналитику канала и настройки Telegram + ИИ-движка. Всё заточено под ежедневную работу автора, а не под разовую генерацию текста.",
      },
    ],
  },
  {
    id: "pc2",
    title: "Как перейти к своему аккаунту?",
    preview: "Я смотрю демо — что делать дальше?",
    date: "12 июн",
    history: [
      { role: "user", text: "Я смотрю демо — что делать дальше?" },
      {
        role: "ai",
        llmLabel: "OpenAI / gpt-4o",
        text:
          "Нажмите «Войти» внизу бокового меню. Можно зарегистрировать новый аккаунт или войти в полное демо (demo@mail.ru). После входа подключите свой Telegram-канал в настройках профиля.",
      },
    ],
  },
];

const emptyChannelProfile = (): ChannelProfileConfig => ({
  core: {
    topic: "Платформа TG Platform для авторов Telegram-каналов",
    audience:
      "Авторы каналов, которые хотят понять возможности продукта до регистрации: лента, заметки, чаты с ИИ, аналитика и подключение Telegram",
    promise:
      "Краткий обзор того, как платформа помогает вести канал в одном рабочем пространстве — без обязательства сразу подключать свой канал",
    angle:
      "Демо-канал «Презентация» показывает интерфейс и сценарии работы; после входа можно подключить свой Telegram или войти в полное демо",
    author:
      "Команда TG Platform. Это не реальный авторский канал — материалы объясняют разделы продукта и типовые сценарии использования.",
  },
  voice: {
    tone: "Спокойный, понятный, без жаргона и без давления",
    format: "Короткие абзацы, списки с одним видом эмодзи, выводы можно выделять жирным",
    phrases: "Обращение на «вы»; без «народ», «ребят» и агрессивных продаж",
  },
  rules: {
    must: "Объяснять разделы платформы на примерах из интерфейса",
    avoid: "Обещания доходности, финансовые советы, кликбейт",
  },
  rubrics: [
    {
      id: "rubric-overview",
      title: "Обзор",
      description: "Что умеет платформа и с чего начать.",
    },
    {
      id: "rubric-workflow",
      title: "Рабочий процесс",
      description: "Лента, заметки, чаты и аналитика в одном месте.",
    },
  ],
});

const presentationAiProfile = (): AiProfileConfig => ({
  llmModels: [
    {
      id: "llm-presentation-openai",
      provider: "OpenAI",
      model: "gpt-4o",
      apiKey: "sk-openai-demo",
      active: true,
      includeInMulti: true,
    },
    {
      id: "llm-presentation-claude",
      provider: "Anthropic",
      model: "claude-3-7-sonnet",
      apiKey: "sk-anthropic-demo",
      active: true,
      includeInMulti: false,
    },
  ],
  webSearchModels: [
    {
      id: "web-presentation-tavily",
      provider: "Tavily",
      model: "search-v1",
      apiKey: "tvly-demo",
      active: true,
      includeInMulti: true,
    },
    {
      id: "web-presentation-exa",
      provider: "Exa",
      model: "exa-neural",
      apiKey: "exa-demo",
      active: true,
      includeInMulti: false,
    },
    {
      id: "web-presentation-responses",
      provider: "OpenAI",
      model: "responses-api-web-search",
      apiKey: "sk-openai-demo",
      active: true,
      includeInMulti: false,
    },
  ],
  orchestratorModels: [],
  webReasonerModels: [],
  ragReasonerModels: [],
  multiResponseEnabled: false,
  systemPrompt:
    "Ты помощник на демо-канале «Презентация». Кратко объясняй возможности TG Platform и подсказывай нажать «Войти», чтобы создать свой аккаунт.",
});

const presentationTelegramProfile = (): TelegramProfileConfig => ({
  authStatus: "connected",
  authStep: "connected",
  apiId: "",
  apiHash: "",
  phone: "",
  sessionName: "",
  channel: PRESENTATION_CHANNEL_HANDLE,
  channelTitle: PRESENTATION_CHANNEL_TITLE,
  channelStatus: "connected",
  syncMode: "history-and-live",
  lastSync: "только что",
  importedPosts: presentationPosts.length,
  botApiToken: "",
  botStatus: "idle",
  botUsername: "",
  botLastActivity: "—",
  botMessageCount: 0,
});

export function createPresentationMswStore(): MswStore {
  return {
    posts: structuredClone(presentationPosts),
    globalChats: structuredClone(presentationGlobalChats),
    globalNotes: structuredClone(presentationGlobalNotes),
    channelProfile: emptyChannelProfile(),
    aiProfile: presentationAiProfile(),
    telegramProfile: presentationTelegramProfile(),
  };
}
