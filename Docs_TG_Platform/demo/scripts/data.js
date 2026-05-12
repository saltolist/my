//  DATA
// ══════════════════════════════════════════════════
const posts = [
  {
    id: 1, status: 'published', date: '28 апр',
    rubric: 'Психология денег',
    metrics: { views: '5 100', reactions: 87, reposts: 23 },
    text: `Два года я не мог нажать кнопку "Открыть счёт". Не потому что не было денег. Просто мозг не пускал.

Это называется "паралич анализа" — когда знаешь что делать, понимаешь зачем, но всё равно откладываешь.

Вот что мне помогло:

1. Убрал "правильность" из уравнения. Нет идеального момента.
2. Сделал минимальный шаг — 1 000 рублей в индекс.
3. Перестал читать прогнозы.`,
    notes: [
      { id: 101, title: 'Барьер №2 — первая сделка', date: '29 апр', ai: false, body: 'Следующий барьер после открытия счёта — первая сделка.' },
      { id: 102, title: 'Альтернативный финал поста', date: '28 апр', ai: false, body: 'Другой финал: сфокусироваться на маленьком шаге.' },
      { id: 103, title: 'Факты для поста про ИИС', date: '27 апр', ai: true, body: 'Налоговый вычет типа А: до 52 000 руб/год.' },
    ],
    chatHistory: [
      { role: 'user', text: 'Этот пост работает лучше обычного. Как думаешь, почему?' },
      { role: 'ai', text: 'По паттернам канала — посты от первого лица с личной историей преодоления страха получают на 35% больше охватов. Здесь сработало три вещи: конкретный числовой заголовок, универсальная боль аудитории и практичные шаги в конце.' },
    ]
  },
  {
    id: 2, status: 'published', date: '25 апр',
    rubric: 'Разбор',
    metrics: { views: '4 200', reactions: 61, reposts: 18 },
    text: `ИИС пугает людей аббревиатурой. Расшифруем: индивидуальный инвестиционный счёт.

Две причины открыть прямо сейчас:
→ Налоговый вычет типа А: возвращаешь до 52 000 рублей в год.
→ Типа Б: освобождение прибыли от налогов.

Минус один: деньги нужно держать 3 года.`,
    notes: [], chatHistory: []
  },
  {
    id: 3, status: 'scheduled', date: '5 мая 19:00',
    rubric: 'Психология денег',
    text: `Ты уже открыл счёт. Теперь смотришь на кнопку "Купить" — и снова что-то останавливает.

Первая сделка — это особый психологический порог.`,
    notes: [], chatHistory: []
  },
  {
    id: 4, status: 'draft', created: '1 мая',
    rubric: null,
    text: 'Апрель закрыт. Разбираю что покупал и почему.',
    notes: [], chatHistory: []
  }
];

const globalChats = [
  {
    id: 'gc1', title: 'Анализ недели',
    preview: 'Три поста за неделю. Лучший...',
    date: '1 мая',
    history: [
      { role: 'user', text: 'Проанализируй эту неделю' },
      { role: 'ai',   text: 'Три поста за неделю. Лучший — "Синдром чистого листа" (+34% к среднему). Рубрика "Психология денег" обогнала "Разбор" по охватам второй раз подряд.' },
    ]
  },
  {
    id: 'gc2', title: 'Контент-план на май',
    preview: 'Составь контент-план на следующую...',
    date: '28 апр',
    history: [
      { role: 'user', text: 'Составь контент-план на следующую неделю' },
      { role: 'ai',   text: '📅 Пн — «Психология денег»: продолжение серии про барьеры\n📅 Ср — «Разбор»: ошибки начинающих инвесторов\n📅 Пт — «Личный опыт»: что купил в апреле' },
    ]
  }
];

const globalNotes = [
  { id: 'gn1', title: 'Структура серии про барьеры инвестора', ai: true,  date: '1 мая',  body: 'Серия "Барьеры инвестора"\n\n1. Синдром чистого листа — открыть счёт\n2. Первая сделка — что и когда купить\n3. Первый убыток — как не паниковать\n4. Регулярные пополнения — автоматизация\n\nФормат: личный опыт + практика' },
  { id: 'gn2', title: 'Мониторинг конкурентов',                ai: false, date: '28 апр', body: 'Подборка каналов о финансах...' },
  { id: 'gn3', title: 'Правила канала (расширенные)',           ai: true,  date: '25 апр', body: 'Запреты, тон, структура...' },
  { id: 'gn4', title: 'Идеи постов на май',                    ai: false, date: '20 апр', body: '- Психология сложного %\n- Как читать отчётность\n- Первые ETF' },
];

const aiProfileConfig = {
  llmModels: [
    { id: 'llm-1', provider: 'OpenAI', model: 'gpt-4o', apiKey: 'sk-openai-demo', active: true, includeInMulti: true },
    { id: 'llm-2', provider: 'Anthropic', model: 'claude-3-7-sonnet', apiKey: 'sk-anthropic-demo', active: true, includeInMulti: false },
  ],
  webSearchModels: [
    { id: 'web-1', provider: 'Perplexity', model: 'sonar-pro', apiKey: 'pk-perplexity-demo', active: true, includeInMulti: true },
    { id: 'web-2', provider: 'Tavily', model: 'search-v1', apiKey: 'tvly-demo', active: true, includeInMulti: false },
  ],
  multiResponseEnabled: false,
  systemPrompt: 'Ты помогаешь автору Telegram-канала о личных финансах...',
};

const telegramProfileConfig = {
  authStatus: 'connected',
  authStep: 'connected',
  apiId: '20483651',
  apiHash: '••••••••••••••••',
  phone: '+7 999 123-45-67',
  sessionName: 'author-main.session',
  channel: '@dengibeznpaniki',
  channelTitle: 'Деньги без паники',
  channelStatus: 'connected',
  syncMode: 'history-and-live',
  lastSync: 'сегодня, 12:40',
  importedPosts: 128,
};

// ══════════════════════════════════════════════════
