import type { DomainState } from "@/app/model/store/domain/types";
import type { DomainAction } from "@/app/model/store/domain/actions";
import { handlePostsAction } from "@/app/model/store/domain/reducers/posts";
import { handleChatsAction } from "@/app/model/store/domain/reducers/chats";
import { handleNotesAction } from "@/app/model/store/domain/reducers/notes";
import { handleProfileAction } from "@/app/model/store/domain/reducers/profile";

export type { DomainAction, ComposerTargets } from "@/app/model/store/domain/actions";
export { initialDomainState } from "@/app/model/store/domain/initialState";

export function domainReducer(state: DomainState, action: DomainAction): DomainState {
  if (action.type === "SET_DOMAIN") {
    return { ...state, ...action.patch };
  }

  return (
    handlePostsAction(state, action) ??
    handleChatsAction(state, action) ??
    handleNotesAction(state, action) ??
    handleProfileAction(state, action) ??
    state
  );
}
