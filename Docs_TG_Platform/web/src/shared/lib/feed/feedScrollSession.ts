let feedScrollTopMemory = 0;
let feedSessionDidInitialScroll = false;

export function getFeedScrollTop(): number {
  return feedScrollTopMemory;
}

export function setFeedScrollTop(value: number): void {
  feedScrollTopMemory = value;
}

export function getFeedSessionDidInitialScroll(): boolean {
  return feedSessionDidInitialScroll;
}

export function markFeedSessionInitialScrollDone(): void {
  feedSessionDidInitialScroll = true;
}

export function resetFeedScrollSession(): void {
  feedScrollTopMemory = 0;
  feedSessionDidInitialScroll = false;
}

export function clampScrollTop(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const max = Math.max(0, scrollHeight - clientHeight);
  return Math.min(scrollTop, max);
}
