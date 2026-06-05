import {
  countVisibleChatMessages,
  lastUserPreviewFromVisibleHistory,
} from "@/shared/lib/chatPaths";
import { isOmnichannelChatId, syncOmnichannelGlobalChats } from "@/shared/lib/omnichannel";
import type { ChatMessage, TelegramProfileConfig } from "@/shared/types";
import type { DomainState } from "@/app/model/store/domain/types";

export function withTelegramDomainSync(
  domain: DomainState,
  config: TelegramProfileConfig,
): Pick<DomainState, "telegramProfileConfig" | "globalChats"> {
  const globalChats = syncOmnichannelGlobalChats(domain.globalChats, config);
  const omni = globalChats.find((c) => isOmnichannelChatId(c.id));
  const botMessageCount = omni ? countVisibleChatMessages(omni.history) : 0;
  return {
    telegramProfileConfig: { ...config, botMessageCount },
    globalChats,
  };
}

export function patchGlobalChatHistory(
  domain: DomainState,
  chatId: string,
  history: ChatMessage[],
): DomainState {
  const globalChats = domain.globalChats.map((c) =>
    c.id === chatId
      ? {
          ...c,
          history,
          preview: lastUserPreviewFromVisibleHistory(history),
          date: "сейчас",
        }
      : c,
  );
  if (!globalChats.some((c) => c.id === chatId)) return domain;
  if (!isOmnichannelChatId(chatId)) return { ...domain, globalChats };
  return {
    ...domain,
    globalChats,
    telegramProfileConfig: {
      ...domain.telegramProfileConfig,
      botMessageCount: countVisibleChatMessages(history),
    },
  };
}
