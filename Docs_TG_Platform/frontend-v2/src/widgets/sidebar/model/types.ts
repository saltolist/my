export const RECENT_SIDEBAR_MAX = 14;

export type RecentRow = {
  kind: "global" | "local";
  key: string;
  title: string;
  historyLen: number;
  seq: number;
  id?: string;
  postId?: number;
  chatId?: number;
};

export type RecentNoteRow = {
  key: string;
  title: string;
  weight: number;
  seq: number;
  isGlobal: boolean;
  id: string | number;
  postId?: number;
};

export type RecentChatsModel =
  | { mode: "flat"; rows: RecentRow[] }
  | {
      mode: "grouped";
      thisPost: RecentRow[];
      others: RecentRow[];
    };

export type RecentNotesModel =
  | { mode: "flat"; rows: RecentNoteRow[] }
  | {
      mode: "grouped";
      thisPost: RecentNoteRow[];
      others: RecentNoteRow[];
    };
