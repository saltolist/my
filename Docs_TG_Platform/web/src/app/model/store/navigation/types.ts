import type {
  ActiveNote,
  ChatsTab,
  NoteFromScreen,
  NoteListFilter,
  NoteMode,
  NoteScope,
  PostMode,
  ScreenId,
} from "@/shared/types";

export type NavigationState = {
  screen: ScreenId;
  currentPostId: number | null;
  currentPostChatId: number | null;
  postMode: PostMode;
  postViewStack: { mode: PostMode; chatId: number | null }[];
  isEditing: boolean;
  currentGChatId: string | null;
  currentNote: ActiveNote | null;
  noteMode: NoteMode;
  noteFrom: NoteFromScreen;
  noteSavedSnapshot: string;
  chatsTab: ChatsTab;
  noteScope: NoteScope;
  noteFilter: NoteListFilter;
};

export const initialNavigationState: NavigationState = {
  screen: "home",
  currentPostId: null,
  currentPostChatId: null,
  postMode: "chat",
  postViewStack: [],
  isEditing: false,
  currentGChatId: null,
  currentNote: null,
  noteMode: "view",
  noteFrom: "notes",
  noteSavedSnapshot: "",
  chatsTab: "all",
  noteScope: "all",
  noteFilter: "all",
};

export type NavigationPatch = Partial<NavigationState>;
