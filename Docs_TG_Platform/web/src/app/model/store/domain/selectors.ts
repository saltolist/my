import type { DomainState } from "@/app/model/store/domain/types";
import type { GlobalChat, GlobalNote, LocalChat, Post } from "@/shared/types";

export function postById(state: DomainState, id: number | null): Post | null {
  if (id == null) return null;
  return state.posts.find((p) => p.id === id) ?? null;
}

export function globalChatById(state: DomainState, id: string | null): GlobalChat | null {
  if (id == null) return null;
  return state.globalChats.find((c) => c.id === id) ?? null;
}

export const selectPostById = postById;

export function selectActiveLocalChat(
  state: DomainState,
  postId: number | null,
  chatId: number | null,
): LocalChat | null {
  if (postId == null || chatId == null) return null;
  return state.posts.find((p) => p.id === postId)?.chats.find((c) => c.id === chatId) ?? null;
}

export function selectGlobalNotes(state: DomainState): GlobalNote[] {
  return state.globalNotes;
}

export function selectPostNotes(state: DomainState, postId: number) {
  const post = postById(state, postId);
  return post?.notes ?? [];
}
