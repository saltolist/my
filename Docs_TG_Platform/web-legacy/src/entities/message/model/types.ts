export type ChatMessageCtx =
  | { scope: "gchat"; entityId: string; path: number[] }
  | { scope: "post"; postId: number; entityId: number; path: number[] };
