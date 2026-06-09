"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useNavigationStore } from "@/app/model/store/navigation-store";
import { usePostNavigationStore } from "@/app/model/store/post-navigation-store";
import { queryKeys } from "@/shared/api/queryKeys";
import {
  buildRoutePatch,
  parseAppPath,
  parseChatSearchParam,
  parseGChatLegacyPath,
  parseGChatSearchParam,
  parsePostLegacySub,
  routes,
} from "@/shared/lib/routes";
import type { GlobalChat, GlobalNote, NoteFromScreen, Post, PostMode } from "@/shared/types";

export function RouteSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setNav = useNavigationStore((s) => s.setNav);
  const setPostMode = usePostNavigationStore((s) => s.setMode);
  const syncKeyRef = useRef("");
  const postModeOverrideRef = useRef<PostMode | null>(null);

  useEffect(() => {
    const path = pathname ?? "/";
    const syncKey = `${path}?${searchParams.toString()}`;
    if (syncKeyRef.current === syncKey) return;
    syncKeyRef.current = syncKey;

    const legacyGchatId = parseGChatLegacyPath(path);
    if (legacyGchatId) {
      router.replace(routes.gchat(legacyGchatId));
      return;
    }

    const legacySub = parsePostLegacySub(path);
    let pathForParse = path;

    if (legacySub) {
      postModeOverrideRef.current = legacySub.mode;
      setPostMode(legacySub.postId, legacySub.mode);
      pathForParse = routes.post(legacySub.postId);
      const chatQ = searchParams.get("chat");
      const href =
        chatQ != null ? `${routes.post(legacySub.postId)}?chat=${chatQ}` : routes.post(legacySub.postId);
      router.replace(href);
      return;
    }

    const parsed = parseAppPath(pathForParse);
    const gchatId = parsed.gchatId ?? parseGChatSearchParam(searchParams.get("id"));
    const chatId = parseChatSearchParam(searchParams.get("chat"));
    const fromParam = searchParams.get("from");
    const noteFrom: NoteFromScreen = fromParam === "post" ? "post" : "notes";
    const notePostId = Number(searchParams.get("postId"));
    const parsedNote = {
      ...parsed,
      gchatId,
      notePostId:
        parsed.noteIsNew && Number.isFinite(notePostId) && notePostId > 0
          ? notePostId
          : parsed.notePostId,
    };

    const posts = queryClient.getQueryData<Post[]>(queryKeys.posts.list()) ?? [];
    const globalChats = queryClient.getQueryData<GlobalChat[]>(queryKeys.globalChats.list()) ?? [];
    const globalNotes = queryClient.getQueryData<GlobalNote[]>(queryKeys.globalNotes.list()) ?? [];

    const routePatch = buildRoutePatch(parsedNote, { posts, globalChats, globalNotes }, chatId, noteFrom);

    let postMode = routePatch.postMode ?? "chat";
    if (parsed.screen === "post" && parsed.postId != null) {
      postMode = postModeOverrideRef.current ?? usePostNavigationStore.getState().getMode(parsed.postId);
      postModeOverrideRef.current = null;
      setPostMode(parsed.postId, postMode, chatId);
    }

    setNav({
      screen: routePatch.screen ?? parsed.screen,
      currentPostId: routePatch.currentPostId ?? null,
      currentPostChatId: routePatch.currentPostChatId ?? chatId,
      postMode,
      postViewStack: routePatch.postViewStack ?? [],
      isEditing: routePatch.isEditing ?? false,
      currentGChatId: routePatch.currentGChatId ?? gchatId,
      currentNote: routePatch.currentNote ?? null,
      noteMode: routePatch.noteMode ?? "view",
      noteFrom: routePatch.noteFrom ?? noteFrom,
      noteSavedSnapshot: routePatch.noteSavedSnapshot ?? "",
    });
  }, [pathname, searchParams, router, queryClient, setNav, setPostMode]);

  return null;
}
