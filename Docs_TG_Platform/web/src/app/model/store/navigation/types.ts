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
  postMode: PostMode;
  isEditing: boolean;
  currentNote: ActiveNote | null;
  noteMode: NoteMode;
  noteFrom: NoteFromScreen;
  noteSavedSnapshot: string;
  chatsTab: ChatsTab;
  chatsSearch: string;
  noteScope: NoteScope;
  noteFilter: NoteListFilter;
  notesSearch: string;
  feedSearch: string;
};

export const initialNavigationState: NavigationState = {
  screen: "home",
  currentPostId: null,
  postMode: "chat",
  isEditing: false,
  currentNote: null,
  noteMode: "view",
  noteFrom: "notes",
  noteSavedSnapshot: "",
  chatsTab: "all",
  chatsSearch: "",
  noteScope: "all",
  noteFilter: "all",
  notesSearch: "",
  feedSearch: "",
};

export type NavigationPatch = Partial<NavigationState>;
