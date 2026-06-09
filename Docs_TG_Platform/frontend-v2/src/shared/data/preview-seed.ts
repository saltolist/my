/** Preview data for shell UI until entities + API are wired. */

export type PreviewChat = {
  id: number;
  title: string;
  historyLen: number;
};

export type PreviewGlobalChat = {
  id: string;
  title: string;
  historyLen: number;
};

export type PreviewNote = {
  id: string | number;
  title: string;
  body: string;
  isGlobal: boolean;
  postId?: number;
};

export type PreviewPost = {
  id: number;
  title: string;
  chats: PreviewChat[];
  notes: PreviewNote[];
};

export type PreviewDomain = {
  posts: PreviewPost[];
  globalChats: PreviewGlobalChat[];
  globalNotes: PreviewNote[];
};

export const previewDomain: PreviewDomain = {
  posts: [
    {
      id: 1,
      title: "Как писать длинные посты",
      chats: [
        { id: 1, title: "Структура абзацев", historyLen: 8 },
        { id: 2, title: "Хук в первой строке", historyLen: 4 },
      ],
      notes: [
        {
          id: 1,
          title: "Черновик вступления",
          body: "Три способа удержать внимание…",
          isGlobal: false,
          postId: 1,
        },
      ],
    },
    {
      id: 2,
      title: "Итоги недели #12",
      chats: [{ id: 1, title: "Сводка метрик", historyLen: 6 }],
      notes: [],
    },
  ],
  globalChats: [
    { id: "gc1", title: "Идеи для рубрики «Разбор»", historyLen: 12 },
    { id: "gc2", title: "Тон для анонса", historyLen: 5 },
    { id: "gc3", title: "Конкуренты в нише", historyLen: 3 },
  ],
  globalNotes: [
    {
      id: "gn1",
      title: "Референсы оформления",
      body: "Каналы с сильной типографикой…",
      isGlobal: true,
    },
    {
      id: "gn2",
      title: "Список тем на май",
      body: "1. Кейс 2. Интервью 3. Подборка…",
      isGlobal: true,
    },
    {
      id: "gn3",
      title: "Запретные формулировки",
      body: "Не использовать кликбейт без факта…",
      isGlobal: true,
    },
  ],
};
