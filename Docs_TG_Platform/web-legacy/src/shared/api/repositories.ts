import type { GlobalChat, GlobalNote, Post } from "@/shared/types";

export interface PostsRepository {
  list(): Promise<Post[]>;
  create(post: Post): Promise<Post>;
  update(id: number, patch: Partial<Post>): Promise<Post>;
  reorder(posts: Post[]): Promise<Post[]>;
  remove(id: number): Promise<void>;
}

export interface ChatsRepository {
  listGlobal(): Promise<GlobalChat[]>;
  pushMessage(chatId: string, text: string): Promise<GlobalChat>;
  rename(chatId: string, title: string): Promise<GlobalChat>;
  remove(chatId: string): Promise<void>;
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
