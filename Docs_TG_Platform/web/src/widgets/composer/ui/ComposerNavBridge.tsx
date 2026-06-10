"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useComposer } from "@/app/model/store/composer-store";
import { parseAppPath, parseGChatSearchParam } from "@/shared/lib/routes";

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
    });
  }, [pathname, registerNavBridge, router, searchParams]);

  return null;
}
