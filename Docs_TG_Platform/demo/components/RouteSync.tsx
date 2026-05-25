"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/state/AppContext";
import {
  POST_NEW_SLUG,
  buildRoutePatch,
  parseAppPath,
  parseChatSearchParam,
  parsePostLegacySub,
  routes,
} from "@/lib/routes";
import type { NoteFromScreen, Post, PostMode } from "@/lib/types";

function ensureNewPost(posts: Post[]): { posts: Post[]; postId: number } {
  const newPost: Post = {
    id: Date.now(),
    status: "draft",
    created: "только что",
    rubric: null,
    text: "",
    notes: [],
    chats: [],
  };
  return { posts: [...posts, newPost], postId: newPost.id };
}

export default function RouteSync() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const syncKeyRef = useRef("");

  useEffect(() => {
    const path = pathname ?? "/";
    const syncKey = `${path}?${searchParams.toString()}`;
    if (syncKeyRef.current === syncKey) return;
    syncKeyRef.current = syncKey;

    const legacySub = parsePostLegacySub(path);
    let postModeOverride: PostMode | undefined;
    let pathForParse = path;

    if (legacySub) {
      postModeOverride = legacySub.mode;
      pathForParse = routes.post(legacySub.postId);
      const chatQ = searchParams.get("chat");
      const href =
        chatQ != null ? `${pathForParse}?chat=${chatQ}` : pathForParse;
      router.replace(href);
    }

    const parsed = parseAppPath(pathForParse);
    const chatId = parseChatSearchParam(searchParams.get("chat"));
    const fromParam = searchParams.get("from");
    const noteFrom: NoteFromScreen = fromParam === "post" ? "post" : "notes";
    const notePostId = Number(searchParams.get("postId"));
    const parsedNote = {
      ...parsed,
      notePostId:
        parsed.noteIsNew && Number.isFinite(notePostId) && notePostId > 0
          ? notePostId
          : parsed.notePostId,
    };

    let posts = state.posts;
    let postId = parsed.postId;

    if (parsed.screen === "post" && pathForParse.includes(`/post/${POST_NEW_SLUG}/`)) {
      const ensured = ensureNewPost(posts);
      posts = ensured.posts;
      postId = ensured.postId;
    }

    const routePatch = buildRoutePatch(
      { ...parsedNote, postId },
      { posts, globalChats: state.globalChats, globalNotes: state.globalNotes },
      chatId,
      noteFrom,
    );

    const patch: Record<string, unknown> = { ...routePatch };
    if (posts !== state.posts) patch.posts = posts;
    if (postId != null && parsed.screen === "post") patch.currentPostId = postId;
    if (postModeOverride) {
      patch.postMode = postModeOverride;
      patch.postViewStack = [];
    }

    dispatch({ type: "SET_STATE", patch });
  }, [pathname, searchParams, dispatch, router, state.posts, state.globalChats, state.globalNotes]);

  return null;
}
