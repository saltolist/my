import { importDemoKanalContent } from "@/shared/data/channel-pools/demo-kanal-content";
import { createEmptyAccountStore } from "@/shared/data/empty-account-state";
import { createPresentationMswStore } from "@/shared/data/presentation-seed";
import { DEMO_ACCOUNT_ID, PRESENTATION_ACCOUNT_ID } from "@/shared/lib/auth/constants";
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
  accounts.set(PRESENTATION_ACCOUNT_ID, createPresentationMswStore());
}

initAccountRegistry();

export function resetAccountRegistry(): void {
  initAccountRegistry();
}

/** Restore demo-full from seed (runs inside the MSW worker on login). */
export function resetDemoFullAccount(): void {
  accounts.set(DEMO_ACCOUNT_ID, createInitialMswStore());
}

/** Token format: `{accountId}:{uuid}` — survives MSW worker restarts on full page reload. */
export function createAuthToken(accountId: string): string {
  return `${accountId}:${randomId()}`;
}

function isFreshAccountId(accountId: string): boolean {
  return accountId.startsWith("fresh-");
}

function isResolvableAccountId(accountId: string): boolean {
  return accounts.has(accountId) || isFreshAccountId(accountId);
}

export function resolveAccountIdFromRequest(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const accountId = token.split(":")[0];
  if (!accountId || !isResolvableAccountId(accountId)) return null;
  return accountId;
}

/** Fresh accounts live only in memory; recreate empty store after MSW worker reload. */
export function getOrCreateAccountStore(accountId: string): MswStore | null {
  const existing = accounts.get(accountId);
  if (existing) return existing;
  if (!isFreshAccountId(accountId)) return null;
  const store = createEmptyAccountStore();
  accounts.set(accountId, store);
  return store;
}

export function getStoreForRequest(request: Request): MswStore | null {
  const accountId = resolveAccountIdFromRequest(request);
  if (!accountId) return null;
  return getOrCreateAccountStore(accountId);
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
