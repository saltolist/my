"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDomainActions, useDomainSelector, useNavigation } from "@/app/model/store";
import { processCombinedPatch } from "@/app/model/store/navigation/buildPatch";
import {
  POST_NEW_SLUG,
  buildRoutePatch,
  parseAppPath,
  parseChatSearchParam,
  parseGChatLegacyPath,
  parseGChatSearchParam,
  parsePostLegacySub,
  routes,
} from "@/shared/lib/routes";
import type { NoteFromScreen, Post, PostMode } from "@/shared/types";

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
  const domain = useDomainSelector((s) => s);
  const { applyPatchWithTelegram } = useDomainActions();
  const { navDispatch, ...navState } = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const syncKeyRef = useRef("");
  const navStateRef = useRef(navState);
  const domainRef = useRef(domain);
  navStateRef.current = navState;
  domainRef.current = domain;

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
    const gchatId =
      parsed.gchatId ?? parseGChatSearchParam(searchParams.get("id"));
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

    const currentDomain = domainRef.current;
    let posts = currentDomain.posts;
    let postId = parsed.postId;

    if (parsed.screen === "post" && pathForParse.includes(`/post/${POST_NEW_SLUG}/`)) {
      const ensured = ensureNewPost(posts);
      posts = ensured.posts;
      postId = ensured.postId;
    }

    const routePatch = buildRoutePatch(
      { ...parsedNote, postId },
      {
        posts,
        globalChats: currentDomain.globalChats,
        globalNotes: currentDomain.globalNotes,
      },
      chatId,
      noteFrom,
    );

    const patch: Record<string, unknown> = { ...routePatch };
    if (posts !== currentDomain.posts) patch.posts = posts;
    if (postId != null && parsed.screen === "post") patch.currentPostId = postId;
    if (postModeOverride) {
      patch.postMode = postModeOverride;
      patch.postViewStack = [];
    }

    const { domainPatch, navPatch } = processCombinedPatch(
      navStateRef.current,
      currentDomain,
      patch,
    );
    applyPatchWithTelegram(domainPatch);
    if (Object.keys(navPatch).length) {
      navDispatch({ type: "SET_NAV", patch: navPatch });
    }
  }, [pathname, searchParams, navDispatch, applyPatchWithTelegram, router]);

  return null;
}
