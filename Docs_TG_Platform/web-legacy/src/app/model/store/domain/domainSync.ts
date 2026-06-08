import type { DomainDispatchAction } from "@/app/model/store/domain/actions";
import type { DomainState } from "@/app/model/store/domain/types";
import type { RepositoryBundle } from "@/shared/api/repositories";

function postFromState(state: DomainState, postId: number) {
  return state.posts.find((p) => p.id === postId);
}

async function syncPostSnapshot(
  repos: RepositoryBundle,
  state: DomainState,
  postId: number,
): Promise<void> {
  const post = postFromState(state, postId);
  if (!post) return;
  await repos.posts.update(postId, post);
}

const POST_SNAPSHOT_ACTIONS = new Set<DomainDispatchAction["type"]>([
  "ADD_LOCAL_CHAT",
  "PUSH_LOCAL_CHAT_MSG",
  "UPDATE_LOCAL_CHAT_MESSAGE",
  "DELETE_LOCAL_CHAT_MESSAGE",
  "DELETE_LOCAL_CHAT",
  "RENAME_LOCAL_CHAT",
  "ADD_POST_NOTE",
  "DELETE_POST_NOTE",
  "TOGGLE_POST_NOTE_AI",
  "UPDATE_POST_NOTE",
  "ADD_POST_COMMENT",
  "SET_AI_VARIANT",
  "SET_USER_BRANCH",
]);

function postIdFromAction(action: DomainDispatchAction): number | null {
  if ("postId" in action && typeof action.postId === "number") return action.postId;
  return null;
}

/** Persist domain mutation to repositories (fire-and-forget from store dispatch). */
export async function syncDomainAction(
  action: DomainDispatchAction,
  prev: DomainState,
  next: DomainState,
  repos: RepositoryBundle,
): Promise<void> {
  switch (action.type) {
    case "UPDATE_POST":
      await repos.posts.update(action.postId, action.patch);
      return;

    case "UPDATE_POSTS": {
      const prevIds = new Set(prev.posts.map((p) => p.id));
      for (const post of action.posts) {
        if (!prevIds.has(post.id)) await repos.posts.create(post);
      }
      return;
    }

    case "REORDER_POSTS":
      await repos.posts.reorder(action.posts);
      return;

    case "DELETE_POST":
      await repos.posts.remove(action.postId);
      return;

    case "UPSERT_GLOBAL_NOTE":
      await repos.notes.upsert(action.note);
      return;

    case "DELETE_GLOBAL_NOTE":
      await repos.notes.remove(action.noteId);
      return;

    case "PUSH_GLOBAL_CHAT":
      if (action.message.role === "user" && action.message.text?.trim()) {
        await repos.chats.pushMessage(action.chatId, action.message.text);
      }
      return;

    case "RENAME_GLOBAL_CHAT":
      await repos.chats.rename(action.chatId, action.title);
      return;

    case "DELETE_GLOBAL_CHAT":
      await repos.chats.remove(action.chatId);
      return;

    default:
      if (POST_SNAPSHOT_ACTIONS.has(action.type)) {
        const postId = postIdFromAction(action);
        if (action.type === "SET_USER_BRANCH" && action.scope === "post" && action.postId != null) {
          await syncPostSnapshot(repos, next, action.postId);
          return;
        }
        if (action.type === "SET_AI_VARIANT" && action.scope === "post") {
          const post = next.posts.find((p) => p.chats.some((c) => c.id === action.entityId));
          if (post) await syncPostSnapshot(repos, next, post.id);
          return;
        }
        if (postId != null) await syncPostSnapshot(repos, next, postId);
      }
  }
}
