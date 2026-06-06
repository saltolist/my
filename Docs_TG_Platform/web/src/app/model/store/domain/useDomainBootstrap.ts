import { useEffect, useState } from "react";
import { API_SYNC_ENABLED } from "@/shared/config/dataSource";
import { getRepositories } from "@/shared/api/createRepositories";
import type { DomainActions } from "@/app/model/store/domain-store";

type Args = {
  applyPatch: DomainActions["applyPatch"];
};

export type DomainBootstrapState = {
  ready: boolean;
  error: string | null;
};

/** Load posts / global chats / notes from API when not in seed mode. */
export function useDomainBootstrap({ applyPatch }: Args): DomainBootstrapState {
  const [ready, setReady] = useState(!API_SYNC_ENABLED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_SYNC_ENABLED) return;

    let cancelled = false;
    const repos = getRepositories();

    void (async () => {
      try {
        const [posts, globalChats, globalNotes] = await Promise.all([
          repos.posts.list(),
          repos.chats.listGlobal(),
          repos.notes.listGlobal(),
        ]);
        if (cancelled) return;
        applyPatch({ posts, globalChats, globalNotes });
        setError(null);
        setReady(true);
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load domain data";
        console.error("[domain bootstrap]", e);
        setError(message);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyPatch]);

  return { ready, error };
}
