import { importDemoKanalContent } from "@/shared/data/channel-pools/demo-kanal-content";
import { createEmptyAccountStore } from "@/shared/data/empty-account-state";
import { DEMO_ACCOUNT_ID } from "@/shared/lib/auth/constants";
import { isDemoChannelHandle } from "@/shared/lib/channel/isDemoChannelHandle";
import { randomId } from "@/shared/lib/randomId";
import { createInitialMswStore, type MswStore } from "./store";

export type PendingRegistration = {
  password: string;
  code: string;
};

const accounts = new Map<string, MswStore>();
export const pendingRegistrations = new Map<string, PendingRegistration>();

export function initAccountRegistry(): void {
  accounts.clear();
  pendingRegistrations.clear();
  accounts.set(DEMO_ACCOUNT_ID, createInitialMswStore());
}

initAccountRegistry();

export function resetAccountRegistry(): void {
  initAccountRegistry();
}

/** Token format: `{accountId}:{uuid}` — survives MSW worker restarts on full page reload. */
export function createAuthToken(accountId: string): string {
  return `${accountId}:${randomId()}`;
}

export function resolveAccountIdFromRequest(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const accountId = token.split(":")[0];
  if (!accountId || !accounts.has(accountId)) return null;
  return accountId;
}

export function getStoreForRequest(request: Request): MswStore | null {
  const accountId = resolveAccountIdFromRequest(request);
  if (!accountId) return null;
  return accounts.get(accountId) ?? null;
}

export function createFreshAccount(): string {
  const accountId = `fresh-${randomId()}`;
  accounts.set(accountId, createEmptyAccountStore());
  return accountId;
}

export function isDemoKanalHandle(channel: string): boolean {
  return isDemoChannelHandle(channel);
}

export function importDemoKanalPosts(store: MswStore): number {
  return importDemoKanalContent(store);
}

export function getDemoFullStore(): MswStore {
  return accounts.get(DEMO_ACCOUNT_ID)!;
}
