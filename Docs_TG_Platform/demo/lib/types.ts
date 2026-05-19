export type ScreenId =
  | "home"
  | "gchat"
  | "feed"
  | "post"
  | "note"
  | "chats"
  | "notes"
  | "analytics"
  | "profile";

export type ComposerScope = "home" | "gchat" | "post";

export type PostStatus = "published" | "scheduled" | "draft";

export type AiVariant = {
  key: string;
  label: string;
  text: string;
  /** Подпись LLM в футере (иконка мозга) */
  llmCaption?: string;
  /** Подпись Web Search в футере (иконка лупы) */
  webCaption?: string;
};

export type ChatRole = "user" | "ai";

/** Версия пользовательского сообщения (ветка после редактирования, как в ChatGPT). */
export type UserMessageBranch = {
  text: string;
  continuation: ChatMessage[];
};

export type ChatMessage = {
  role: ChatRole;
  text?: string;
  /** Если задано — несколько версий текста с отдельными продолжениями; `text` игнорируется для отображения. */
  userBranches?: UserMessageBranch[];
  activeUserBranch?: number;
  variants?: AiVariant[];
  selectedVariant?: number;
  mode?: "single" | "multi";
  targetLabel?: string;
  llmLabel?: string;
  webLabel?: string;
};

export type NoteFile = { id?: string; name: string; type: string; url?: string };

export type LocalNote = {
  id: number;
  title: string;
  date: string;
  ai: boolean;
  body: string;
  files?: NoteFile[];
};

export type GlobalNote = {
  id: string;
  title: string;
  ai: boolean;
  date: string;
  body: string;
  files?: NoteFile[];
};

export type PostReaction = { emoji: string; count: number };

export type PostMetrics = { views: string; reposts: number; reactions: PostReaction[] };

export type PostComment = {
  id: number;
  author: string;
  text: string;
  date: string;
  replyToId?: number;
};

export type PostMedia = {
  name: string;
  url: string;
  type: string;
};

export type LocalChat = {
  id: number;
  title: string;
  preview: string;
  date: string;
  history: ChatMessage[];
};

export type Post = {
  id: number;
  status: PostStatus;
  date?: string;
  created?: string;
  rubric: string | null;
  metrics?: PostMetrics;
  text: string;
  media?: PostMedia[];
  notes: LocalNote[];
  chats: LocalChat[];
  comments?: PostComment[];
};

export type GlobalChatKind = "default" | "omnichannel";

export type GlobalChat = {
  id: string;
  kind?: GlobalChatKind;
  title: string;
  preview: string;
  date: string;
  history: ChatMessage[];
};

export type LlmModel = {
  id: string;
  provider: string;
  model: string;
  apiKey: string;
  active: boolean;
  includeInMulti: boolean;
};

export type WebSearchModel = LlmModel;

export type ChannelProfileRubric = {
  id: string;
  title: string;
  description: string;
};

export type ChannelProfileConfig = {
  core: {
    topic: string;
    audience: string;
    promise: string;
    angle: string;
    author: string;
  };
  voice: {
    tone: string;
    format: string;
    phrases: string;
  };
  rules: {
    must: string;
    avoid: string;
  };
  rubrics: ChannelProfileRubric[];
};

export type AiProfileConfig = {
  llmModels: LlmModel[];
  webSearchModels: WebSearchModel[];
  orchestratorModels: LlmModel[];
  webReasonerModels: LlmModel[];
  ragReasonerModels: LlmModel[];
  multiResponseEnabled: boolean;
  systemPrompt: string;
};

export type TelegramAuthStatus = "idle" | "code-sent" | "authorized" | "connected";
export type TelegramChannelStatus = "idle" | "pending" | "connected";
export type TelegramSyncMode = "live-only" | "history-and-live" | "publish-only";

export type TelegramBotStatus = "idle" | "connected";

export type TelegramProfileConfig = {
  authStatus: TelegramAuthStatus;
  authStep: string;
  apiId: string;
  apiHash: string;
  phone: string;
  sessionName: string;
  channel: string;
  channelTitle: string;
  channelStatus: TelegramChannelStatus;
  syncMode: TelegramSyncMode;
  lastSync: string;
  importedPosts: number;
  botApiToken: string;
  botStatus: TelegramBotStatus;
  botUsername: string;
  botLastActivity: string;
  botMessageCount: number;
};

export type ComposerTarget = { llmId: string; webId: string };

export type ChatsTab = "all" | "global" | "local";
export type NoteScope = "all" | "global" | "local";
export type NoteListFilter = "all" | "ai" | "noai";
export type PostMode = "chat" | "chats" | "notes" | "comments";
export type NoteMode = "view" | "edit";
export type NoteFromScreen = "notes" | "post";

export type ActiveNote =
  | (GlobalNote & { isGlobal: true; files: NoteFile[]; isNew?: boolean })
  | (LocalNote & { isGlobal: false; postId: number; files: NoteFile[]; isNew?: boolean });

export type ComposerAttachment =
  | { id: string; kind: "post"; postId: number; title: string }
  | { id: string; kind: "file"; name: string; file?: File }
  | { id: string; kind: "media"; postId: number; postTitle: string; media: string };

export type ThemeMode = "light" | "system" | "dark";
