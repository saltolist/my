import type { DomainAction } from "@/app/model/store/domain/actions";
import type { DomainState } from "@/app/model/store/domain/types";

export function handleNotesAction(state: DomainState, action: DomainAction): DomainState | null {
  switch (action.type) {
    case "ADD_POST_NOTE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId ? { ...p, notes: [...p.notes, action.note] } : p,
        ),
      };
    case "DELETE_POST_NOTE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? { ...p, notes: p.notes.filter((n) => n.id !== action.noteId) }
            : p,
        ),
      };
    case "TOGGLE_POST_NOTE_AI":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                notes: p.notes.map((n) =>
                  n.id === action.noteId ? { ...n, ai: !n.ai } : n,
                ),
              }
            : p,
        ),
      };
    case "UPDATE_POST_NOTE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                notes: p.notes.map((n) =>
                  n.id === action.noteId ? { ...n, ...action.patch } : n,
                ),
              }
            : p,
        ),
      };
    case "UPDATE_GLOBAL_NOTES":
      return { ...state, globalNotes: action.notes };
    case "UPSERT_GLOBAL_NOTE": {
      const exists = state.globalNotes.find((n) => n.id === action.note.id);
      const notes = exists
        ? state.globalNotes.map((n) => (n.id === action.note.id ? action.note : n))
        : [action.note, ...state.globalNotes];
      return { ...state, globalNotes: notes };
    }
    case "DELETE_GLOBAL_NOTE":
      return {
        ...state,
        globalNotes: state.globalNotes.filter((n) => n.id !== action.noteId),
      };
    default:
      return null;
  }
}
