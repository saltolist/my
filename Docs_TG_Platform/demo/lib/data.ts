import type {
  AiProfileConfig,
  GlobalChat,
  GlobalNote,
  Post,
  PostMedia,
  TelegramProfileConfig,
} from "./types";

function svgMedia(name: string, svg: string): PostMedia {
  return {
    name,
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`,
    type: "image/svg+xml",
  };
}

const mediaFirstStep = svgMedia(
  "Первый шаг.svg",
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#5b8ff9'/>
        <stop offset='1' stop-color='#7b5bf9'/>
      </linearGradient>
    </defs>
    <rect width='600' height='600' fill='url(#g)'/>
    <circle cx='300' cy='270' r='140' fill='rgba(255,255,255,0.18)'/>
    <text x='300' y='335' text-anchor='middle' fill='white' font-family='Inter,-apple-system,sans-serif' font-size='190' font-weight='700'>₽</text>
    <text x='300' y='465' text-anchor='middle' fill='rgba(255,255,255,0.85)' font-family='Inter,-apple-system,sans-serif' font-size='28' font-weight='500' letter-spacing='3'>ПЕРВЫЙ ШАГ</text>
  </svg>`,
);

const mediaIisA = svgMedia(
  "ИИС тип А.svg",
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='#1f9d5b'/>
        <stop offset='1' stop-color='#0e6b3e'/>
      </linearGradient>
    </defs>
    <rect width='600' height='600' fill='url(#g)'/>
    <text x='300' y='220' text-anchor='middle' fill='rgba(255,255,255,0.85)' font-family='Inter,-apple-system,sans-serif' font-size='30' font-weight='500' letter-spacing='4'>ИИС · ТИП А</text>
    <text x='300' y='350' text-anchor='middle' fill='white' font-family='Inter,-apple-system,sans-serif' font-size='90' font-weight='800'>52 000 ₽</text>
    <text x='300' y='415' text-anchor='middle' fill='rgba(255,255,255,0.85)' font-family='Inter,-apple-system,sans-serif' font-size='24' font-weight='500'>возврат налога / год</text>
  </svg>`,
);

const mediaIisB = svgMedia(
  "ИИС тип Б.svg",
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stop-color='#1c7ec6'/>
        <stop offset='1' stop-color='#0c5293'/>
      </linearGradient>
    </defs>
    <rect width='600' height='600' fill='url(#g)'/>
    <text x='300' y='220' text-anchor='middle' fill='rgba(255,255,255,0.85)' font-family='Inter,-apple-system,sans-serif' font-size='30' font-weight='500' letter-spacing='4'>ИИС · ТИП Б</text>
    <text x='300' y='370' text-anchor='middle' fill='white' font-family='Inter,-apple-system,sans-serif' font-size='150' font-weight='800'>0%</text>
    <text x='300' y='435' text-anchor='middle' fill='rgba(255,255,255,0.85)' font-family='Inter,-apple-system,sans-serif' font-size='24' font-weight='500'>налога на прибыль</text>
  </svg>`,
);

const mediaBuyButton = svgMedia(
  "Кнопка Купить.svg",
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#222'/>
        <stop offset='1' stop-color='#3a3a3a'/>
      </linearGradient>
      <linearGradient id='btn' x1='0' y1='0' x2='1' y2='0'>
        <stop offset='0' stop-color='#33b96b'/>
        <stop offset='1' stop-color='#5ed68d'/>
      </linearGradient>
    </defs>
    <rect width='600' height='600' fill='url(#bg)'/>
    <rect x='100' y='240' width='400' height='120' rx='24' fill='url(#btn)'/>
    <text x='300' y='320' text-anchor='middle' fill='white' font-family='Inter,-apple-system,sans-serif' font-size='44' font-weight='700'>Купить</text>
    <text x='300' y='460' text-anchor='middle' fill='rgba(255,255,255,0.55)' font-family='Inter,-apple-system,sans-serif' font-size='22' font-weight='500' letter-spacing='2'>ПЕРВАЯ СДЕЛКА</text>
  </svg>`,
);

export const initialPosts: Post[] = [
  {
    id: 1,
    status: "published",
    date: "28 апр",
    rubric: "Психология денег",
    metrics: {
      views: "5 100",
      reposts: 23,
      reactions: [
        { emoji: "🔥", count: 412 },
        { emoji: "❤", count: 89 },
        { emoji: "👍", count: 56 },
        { emoji: "🤔", count: 34 },
        { emoji: "👏", count: 21 },
      ],
    },
    text: `Два года я не мог нажать кнопку "Открыть счёт". Не потому что не было денег. Просто мозг не пускал.

Это называется "паралич анализа" — когда знаешь что делать, понимаешь зачем, но всё равно откладываешь.

Вот что мне помогло:

1. Убрал "правильность" из уравнения. Нет идеального момента.
2. Сделал минимальный шаг — 1 000 рублей в индекс.
3. Перестал читать прогнозы.`,
    media: [mediaFirstStep],
    notes: [
      {
        id: 101,
        title: "Барьер №2 — первая сделка",
        date: "29 апр",
        ai: false,
        body: "Следующий барьер после открытия счёта — первая сделка.",
      },
      {
        id: 102,
        title: "Альтернативный финал поста",
        date: "28 апр",
        ai: false,
        body: "Другой финал: сфокусироваться на маленьком шаге.",
      },
      {
        id: 103,
        title: "Факты для поста про ИИС",
        date: "27 апр",
        ai: true,
        body: "Налоговый вычет типа А: до 52 000 руб/год.",
      },
    ],
    chats: [
      {
        id: 1001,
        title: "Почему пост зашёл",
        preview: "Этот пост работает лучше обычного. Как думаешь, почему?",
        date: "29 апр",
        history: [
          { role: "user", text: "Этот пост работает лучше обычного. Как думаешь, почему?" },
          {
            role: "ai",
            llmLabel: "OpenAI / gpt-4o",
            webLabel: "Perplexity / sonar-pro",
            text:
              "По паттернам канала — посты от первого лица с личной историей преодоления страха получают на 35% больше охватов. Здесь сработало три вещи: конкретный числовой заголовок, универсальная боль аудитории и практичные шаги в конце.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    status: "published",
    date: "25 апр",
    rubric: "Разбор",
    metrics: {
      views: "4 200",
      reposts: 18,
      reactions: [
        { emoji: "👍", count: 142 },
        { emoji: "❤", count: 38 },
        { emoji: "📌", count: 15 },
        { emoji: "🎯", count: 9 },
      ],
    },
    text: `ИИС пугает людей аббревиатурой. Расшифруем: индивидуальный инвестиционный счёт.

Две причины открыть прямо сейчас:
→ Налоговый вычет типа А: возвращаешь до 52 000 рублей в год.
→ Типа Б: освобождение прибыли от налогов.

Минус один: деньги нужно держать 3 года.`,
    media: [mediaIisA, mediaIisB],
    notes: [],
    chats: [],
  },
  {
    id: 3,
    status: "scheduled",
    date: "5 мая 19:00",
    rubric: "Психология денег",
    text: `Ты уже открыл счёт. Теперь смотришь на кнопку "Купить" — и снова что-то останавливает.

Первая сделка — это особый психологический порог.`,
    media: [mediaBuyButton],
    notes: [],
    chats: [],
  },
  {
    id: 4,
    status: "draft",
    created: "1 мая",
    rubric: null,
    text: "Апрель закрыт. Разбираю что покупал и почему.",
    notes: [],
    chats: [],
  },
];

export const initialGlobalChats: GlobalChat[] = [
  {
    id: "gc1",
    title: "Анализ недели",
    preview: "Три поста за неделю. Лучший...",
    date: "1 мая",
    history: [
      { role: "user", text: "Проанализируй эту неделю" },
      {
        role: "ai",
        llmLabel: "OpenAI / gpt-4o",
        webLabel: "Perplexity / sonar-pro",
        text:
          'Три поста за неделю. Лучший — "Синдром чистого листа" (+34% к среднему). Рубрика "Психология денег" обогнала "Разбор" по охватам второй раз подряд.',
      },
    ],
  },
  {
    id: "gc2",
    title: "Контент-план на май",
    preview: "Составь контент-план на следующую...",
    date: "28 апр",
    history: [
      { role: "user", text: "Составь контент-план на следующую неделю" },
      {
        role: "ai",
        llmLabel: "OpenAI / gpt-4o",
        webLabel: "Perplexity / sonar-pro",
        text:
          "📅 Пн — «Психология денег»: продолжение серии про барьеры\n📅 Ср — «Разбор»: ошибки начинающих инвесторов\n📅 Пт — «Личный опыт»: что купил в апреле",
      },
    ],
  },
];

export const initialGlobalNotes: GlobalNote[] = [
  {
    id: "gn1",
    title: "Структура серии про барьеры инвестора",
    ai: true,
    date: "1 мая",
    body:
      'Серия "Барьеры инвестора"\n\n1. Синдром чистого листа — открыть счёт\n2. Первая сделка — что и когда купить\n3. Первый убыток — как не паниковать\n4. Регулярные пополнения — автоматизация\n\nФормат: личный опыт + практика',
  },
  { id: "gn2", title: "Мониторинг конкурентов", ai: false, date: "28 апр", body: "Подборка каналов о финансах..." },
  { id: "gn3", title: "Правила канала (расширенные)", ai: true, date: "25 апр", body: "Запреты, тон, структура..." },
  {
    id: "gn4",
    title: "Идеи постов на май",
    ai: false,
    date: "20 апр",
    body: "- Психология сложного %\n- Как читать отчётность\n- Первые ETF",
  },
];

export const initialAiProfileConfig: AiProfileConfig = {
  llmModels: [
    {
      id: "llm-1",
      provider: "OpenAI",
      model: "gpt-4o",
      apiKey: "sk-openai-demo",
      active: true,
      includeInMulti: true,
    },
    {
      id: "llm-2",
      provider: "Anthropic",
      model: "claude-3-7-sonnet",
      apiKey: "sk-anthropic-demo",
      active: true,
      includeInMulti: false,
    },
  ],
  webSearchModels: [
    {
      id: "web-1",
      provider: "Perplexity",
      model: "sonar-pro",
      apiKey: "pk-perplexity-demo",
      active: true,
      includeInMulti: true,
    },
    {
      id: "web-2",
      provider: "Tavily",
      model: "search-v1",
      apiKey: "tvly-demo",
      active: true,
      includeInMulti: false,
    },
  ],
  multiResponseEnabled: false,
  systemPrompt: "Ты помогаешь автору Telegram-канала о личных финансах...",
};

export const initialTelegramProfileConfig: TelegramProfileConfig = {
  authStatus: "connected",
  authStep: "connected",
  apiId: "20483651",
  apiHash: "••••••••••••••••",
  phone: "+7 999 123-45-67",
  sessionName: "author-main.session",
  channel: "@dengibeznpaniki",
  channelTitle: "Деньги без паники",
  channelStatus: "connected",
  syncMode: "history-and-live",
  lastSync: "сегодня, 12:40",
  importedPosts: 128,
};

export const initialPinnedPostIds: number[] = [1, 2];
