import type {
  AiProfileConfig,
  ChannelProfileConfig,
  TelegramProfileConfig,
} from "@/shared/types";
import { DEMO_CHANNEL_HANDLE } from "@/shared/lib/auth/constants";
import { createInitialMswStore, type MswStore } from "@/shared/api/msw/store";

function emptyChannelProfile(): ChannelProfileConfig {
  return {
    core: {
      topic: "",
      audience: "",
      promise: "",
      angle: "",
      author: "",
    },
    voice: {
      tone: "",
      format: "",
      phrases: "",
    },
    rules: {
      must: "",
      avoid: "",
    },
    rubrics: [],
  };
}

function emptyAiProfile(): AiProfileConfig {
  const seed = createInitialMswStore().aiProfile;
  return {
    ...seed,
    systemPrompt: "",
    multiResponseEnabled: false,
  };
}

function emptyTelegramProfile(): TelegramProfileConfig {
  return {
    authStatus: "idle",
    authStep: "channel",
    apiId: "",
    apiHash: "",
    phone: "",
    sessionName: "",
    channel: DEMO_CHANNEL_HANDLE,
    channelTitle: "",
    channelStatus: "idle",
    syncMode: "history-and-live",
    lastSync: "—",
    importedPosts: 0,
    botApiToken: "",
    botStatus: "idle",
    botUsername: "",
    botLastActivity: "—",
    botMessageCount: 0,
  };
}

export function createEmptyAccountStore(): MswStore {
  return {
    posts: [],
    globalChats: [],
    globalNotes: [],
    channelProfile: emptyChannelProfile(),
    aiProfile: emptyAiProfile(),
    telegramProfile: emptyTelegramProfile(),
  };
}
