"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useApp } from "@/state/AppContext";
import {
  POST_NEW_SLUG,
  buildRoutePatch,
  parseAppPath,
  parseChatSearchParam,
} from "@/lib/routes";
import type { NoteFromScreen, Post } from "@/lib/types";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const syncKeyRef = useRef("");

  useEffect(() => {
    const path = pathname ?? "/";
    const syncKey = `${path}?${searchParams.toString()}`;
    if (syncKeyRef.current === syncKey) return;
    syncKeyRef.current = syncKey;

    const parsed = parseAppPath(path);
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

    if (parsed.screen === "post" && path.includes(`/post/${POST_NEW_SLUG}/`)) {
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

    dispatch({ type: "SET_STATE", patch });
  }, [pathname, searchParams, dispatch, state.posts, state.globalChats, state.globalNotes]);

  return null;
}
