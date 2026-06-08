import { API_SYNC_ENABLED } from "@/shared/config/dataSource";
import { createHttpRepositories } from "@/shared/api/httpRepositories";
import type { RepositoryBundle } from "@/shared/api/repositories";
import { createSeedRepositories } from "@/shared/api/seedRepositories";

export function createRepositories(): RepositoryBundle {
  return API_SYNC_ENABLED ? createHttpRepositories() : createSeedRepositories();
}

let cached: RepositoryBundle | null = null;

export function getRepositories(): RepositoryBundle {
  if (!cached) cached = createRepositories();
  return cached;
}

/** For tests — reset singleton between cases. */
export function resetRepositoriesForTests(): void {
  cached = null;
}
