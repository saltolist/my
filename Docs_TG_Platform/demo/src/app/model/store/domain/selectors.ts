import type { DomainState } from "@/app/model/store/domain/types";
import type { GlobalChat, Post } from "@/shared/types";

export function postById(state: DomainState, id: number | null): Post | null {
  if (id == null) return null;
  return state.posts.find((p) => p.id === id) || null;
}

export function globalChatById(state: DomainState, id: string | null): GlobalChat | null {
  if (id == null) return null;
  return state.globalChats.find((c) => c.id === id) || null;
}
