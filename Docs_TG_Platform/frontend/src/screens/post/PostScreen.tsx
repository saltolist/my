"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { routes } from "@/shared/config/routes";
import { parseAppPath } from "@/shared/lib/routes";
import { PageHeader } from "@/widgets/page-header";
import { PostWorkspace } from "@/widgets/post-workspace";

export function PostScreen() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const postId = useMemo(() => parseAppPath(pathname).postId, [pathname]);

  const handleBack = useCallback(() => {
    router.push(routes.feed());
  }, [router]);

  const handleDeleted = useCallback(() => {
    router.push(routes.feed());
  }, [router]);

  if (postId == null) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <PageHeader title="Пост" onBack={handleBack} />
        <p className="p-4 text-muted-foreground">Пост не найден</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Пост" onBack={handleBack} />
      <div className="min-h-0 flex-1 overflow-auto">
        <PostWorkspace postId={postId} onDeleted={handleDeleted} className="p-4" />
      </div>
    </div>
  );
}
