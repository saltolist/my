import type { GlobalChat, GlobalNote, Post } from "@/shared/types";

export interface PostsRepository {
  list(): Promise<Post[]>;
  update(id: number, patch: Partial<Post>): Promise<Post>;
}

export interface ChatsRepository {
  listGlobal(): Promise<GlobalChat[]>;
  pushMessage(chatId: string, text: string): Promise<GlobalChat>;
}

export interface NotesRepository {
  listGlobal(): Promise<GlobalNote[]>;
  upsert(note: GlobalNote): Promise<GlobalNote>;
  remove(noteId: string): Promise<void>;
}

export type RepositoryBundle = {
  posts: PostsRepository;
  chats: ChatsRepository;
  notes: NotesRepository;
};
