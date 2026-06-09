"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usePostNavigationStore } from "@/app/model/store/post-navigation-store";
import {
  parseGChatLegacyPath,
  parsePostLegacySub,
  routes,
} from "@/shared/lib/routes";

export function LegacyRouteRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setMode = usePostNavigationStore((s) => s.setMode);
  const syncKeyRef = useRef("");

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
    if (legacySub) {
      setMode(legacySub.postId, legacySub.mode);
      const chatQ = searchParams.get("chat");
      const href = chatQ != null ? `${routes.post(legacySub.postId)}?chat=${chatQ}` : routes.post(legacySub.postId);
      router.replace(href);
    }
  }, [pathname, searchParams, router, setMode]);

  return null;
}
