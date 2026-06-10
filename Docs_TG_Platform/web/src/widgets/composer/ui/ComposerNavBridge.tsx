"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useComposer } from "@/app/model/store/composer-store";
import { usePostNavigationStore } from "@/app/model/store/post-navigation-store";
import { parseAppPath, parseChatSearchParam, parseGChatSearchParam } from "@/shared/lib/routes";

export function ComposerNavBridge() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const { registerNavBridge } = useComposer();

  useEffect(() => {
    return registerNavBridge({
      goToHref: (href, opts) => {
        if (opts?.replace) router.replace(href);
        else router.push(href);
        return true;
      },
      getCurrentGChatId: () => {
        const parsed = parseAppPath(pathname);
        return parsed.gchatId ?? parseGChatSearchParam(searchParams.get("id"));
      },
      getCurrentPostId: () => {
        const parsed = parseAppPath(pathname);
        return parsed.postId;
      },
      getCurrentPostChatId: () => {
        const parsed = parseAppPath(pathname);
        if (parsed.postId == null) return null;
        const fromUrl = parseChatSearchParam(searchParams.get("chat"));
        if (fromUrl != null) return fromUrl;
        return usePostNavigationStore.getState().getCurrentPostChatId(parsed.postId);
      },
      setCurrentPostChatId: (chatId: number) => {
        const parsed = parseAppPath(pathname);
        if (parsed.postId == null) return;
        usePostNavigationStore.getState().setMode(parsed.postId, "chat", chatId);
      },
    });
  }, [pathname, registerNavBridge, router, searchParams]);

  return null;
}
