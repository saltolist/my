"use client";

import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useEffect, useRef, type MutableRefObject } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useNavigationStore } from "@/app/model/store/navigation-store";
import type { NavigationPatch } from "@/app/model/store/navigation/types";
import { usePostNavigationStore } from "@/app/model/store/post-navigation-store";
import { queryKeys } from "@/shared/api/queryKeys";
import {
  isNoteRouteDataQuery,
  mergeNoteCachePatch,
  routeNeedsCachedData,
  routeSyncKey,
  syncRouteFromUrl,
} from "@/widgets/app-shell/lib/syncRoute";
import type { GlobalChat, GlobalNote, Post, PostMode } from "@/shared/types";

function applyRouteSync(
  path: string,
  searchParams: URLSearchParams,
  queryClient: QueryClient,
  syncKeyRef: MutableRefObject<string>,
  postModeOverrideRef: MutableRefObject<PostMode | null>,
  router: ReturnType<typeof useRouter>,
  setNav: (patch: NavigationPatch) => void,
  setPostMode: ReturnType<typeof usePostNavigationStore.getState>["setMode"],
  options: { urlDedup: boolean },
): void {
  const syncKey = routeSyncKey(path, searchParams);
  if (options.urlDedup) {
    if (syncKeyRef.current === syncKey) return;
    syncKeyRef.current = syncKey;
  }

  const posts = queryClient.getQueryData<Post[]>(queryKeys.posts.list()) ?? [];
  const globalChats = queryClient.getQueryData<GlobalChat[]>(queryKeys.globalChats.list()) ?? [];
  const globalNotes = queryClient.getQueryData<GlobalNote[]>(queryKeys.globalNotes.list()) ?? [];

  const result = syncRouteFromUrl(path, searchParams, { posts, globalChats, globalNotes }, {
    postModeOverride: postModeOverrideRef.current,
    getPostMode: (postId) => usePostNavigationStore.getState().getMode(postId),
  });
  postModeOverrideRef.current = null;

  if (result.kind === "redirect") {
    if (result.postMode) {
      postModeOverrideRef.current = result.postMode.mode;
      setPostMode(result.postMode.postId, result.postMode.mode, result.postMode.chatId);
    }
    router.replace(result.href);
    return;
  }

  if (result.postMode) {
    setPostMode(result.postMode.postId, result.postMode.mode, result.postMode.chatId);
  }

  let patch = result.patch;
  if (!options.urlDedup) {
    patch = mergeNoteCachePatch(useNavigationStore.getState(), patch);
  }
  setNav(patch);
}

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
    applyRouteSync(
      pathname ?? "/",
      searchParams,
      queryClient,
      syncKeyRef,
      postModeOverrideRef,
      router,
      setNav,
      setPostMode,
      { urlDedup: true },
    );
  }, [pathname, searchParams, router, queryClient, setNav, setPostMode]);

  useEffect(() => {
    const path = pathname ?? "/";
    if (!routeNeedsCachedData(path)) return;

    return queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || !isNoteRouteDataQuery(path, event.query.queryKey)) return;
      applyRouteSync(
        path,
        searchParams,
        queryClient,
        syncKeyRef,
        postModeOverrideRef,
        router,
        setNav,
        setPostMode,
        { urlDedup: false },
      );
    });
  }, [pathname, searchParams, router, queryClient, setNav, setPostMode]);

  return null;
}
