import type { DomainAction } from "@/app/model/store/domain/actions";
import type { DomainState } from "@/app/model/store/domain/types";

export function handlePostsAction(state: DomainState, action: DomainAction): DomainState | null {
  switch (action.type) {
    case "UPDATE_POSTS":
      return { ...state, posts: action.posts };
    case "UPDATE_POST":
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.postId ? { ...p, ...action.patch } : p)),
      };
    case "DELETE_POST":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.postId) };
    case "ADD_POST_COMMENT":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? { ...p, comments: [...(p.comments ?? []), action.comment] }
            : p,
        ),
      };
    case "REORDER_POSTS":
      return { ...state, posts: action.posts };
    default:
      return null;
  }
}
