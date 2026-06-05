import type {
  AiProfileConfig,
  ChannelProfileConfig,
  ComposerScope,
  ComposerTarget,
  GlobalChat,
  GlobalNote,
  Post,
  TelegramProfileConfig,
} from "@/lib/types";

type ComposerTargets = Record<ComposerScope, ComposerTarget>;

export type DomainState = {
  posts: Post[];
  globalChats: GlobalChat[];
  globalNotes: GlobalNote[];
  channelProfileConfig: ChannelProfileConfig;
  aiProfileConfig: AiProfileConfig;
  telegramProfileConfig: TelegramProfileConfig;
  pinnedPostIds: number[];
  composerTargets: ComposerTargets;
  systemPromptSavedSnapshot: string;
  modelSettingsSavedSnapshot: string;
  telegramSettingsSavedSnapshot: string;
  channelProfileSavedSnapshot: string;
};
