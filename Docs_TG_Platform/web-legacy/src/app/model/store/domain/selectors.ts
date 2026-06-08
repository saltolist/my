import type { DomainState } from "@/app/model/store/domain/types";
import type { ComposerScope, GlobalChat, GlobalNote, LocalChat, Post } from "@/shared/types";

export function postById(state: DomainState, id: number | null): Post | null {
  if (id == null) return null;
  return state.posts.find((p) => p.id === id) ?? null;
}

export function globalChatById(state: DomainState, id: string | null): GlobalChat | null {
  if (id == null) return null;
  return state.globalChats.find((c) => c.id === id) ?? null;
}

export const selectPostById = postById;

export const selectPosts = (state: DomainState) => state.posts;
export const selectGlobalChats = (state: DomainState) => state.globalChats;
export const selectGlobalNotes = (state: DomainState) => state.globalNotes;
export const selectAiProfileConfig = (state: DomainState) => state.aiProfileConfig;
export const selectComposerTargets = (state: DomainState) => state.composerTargets;
export const selectComposerTarget =
  (scope: ComposerScope) =>
  (state: DomainState) =>
    state.composerTargets[scope];
export const selectChannelProfileConfig = (state: DomainState) => state.channelProfileConfig;
export const selectTelegramProfileConfig = (state: DomainState) => state.telegramProfileConfig;
export const selectPinnedPostIds = (state: DomainState) => state.pinnedPostIds;
export const selectChannelProfileSavedSnapshot = (state: DomainState) => state.channelProfileSavedSnapshot;
export const selectModelSettingsSavedSnapshot = (state: DomainState) => state.modelSettingsSavedSnapshot;
export const selectSystemPromptSavedSnapshot = (state: DomainState) => state.systemPromptSavedSnapshot;
export const selectTelegramSettingsSavedSnapshot = (state: DomainState) => state.telegramSettingsSavedSnapshot;

/** Subset used by sidebar recent-items builders. */
export const selectSidebarDomain = (state: DomainState) => ({
  posts: state.posts,
  globalChats: state.globalChats,
  globalNotes: state.globalNotes,
});

export function selectActiveLocalChat(
  state: DomainState,
  postId: number | null,
  chatId: number | null,
): LocalChat | null {
  if (postId == null || chatId == null) return null;
  return state.posts.find((p) => p.id === postId)?.chats.find((c) => c.id === chatId) ?? null;
}

export function selectPostNotes(state: DomainState, postId: number) {
  const post = postById(state, postId);
  return post?.notes ?? [];
}
