"use client";

import { ContextMenu, type CtxMenuItem } from "@/components/ContextMenu";
import { useApp } from "@/state/AppContext";
import { routes } from "@/lib/routes";
import MessageTrashIcon from "../chat/MessageTrashIcon";
import MessageRenameIcon from "../chat/MessageRenameIcon";

function MoreDotsTrigger() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

type Props =
  | { isGlobal: true; noteId: string; title: string }
  | { isGlobal: false; postId: number; noteId: number; title: string };

export default function NoteListCardMenu(props: Props) {
  const { dispatch, goToHref, state } = useApp();
  const { title } = props;

  const items: CtxMenuItem[] = [
    {
      label: "Переименовать",
      icon: <MessageRenameIcon />,
      onClick: () => {
        const next = window.prompt("Новое название заметки", title);
        if (next == null) return;
        const t = next.trim();
        if (!t) return;
        if (props.isGlobal) {
          const n = state.globalNotes.find((x) => x.id === props.noteId);
          if (!n) return;
          dispatch({ type: "UPSERT_GLOBAL_NOTE", note: { ...n, title: t } });
        } else {
          dispatch({
            type: "UPDATE_POST_NOTE",
            postId: props.postId,
            noteId: props.noteId,
            patch: { title: t },
          });
        }
      },
    },
    {
      label: "Удалить",
      icon: <MessageTrashIcon />,
      danger: true,
      onClick: () => {
        if (!window.confirm(`Удалить заметку «${title}»?`)) return;
        if (props.isGlobal) {
          dispatch({ type: "DELETE_GLOBAL_NOTE", noteId: props.noteId });
          const cur = state.currentNote;
          if (state.screen === "note" && cur?.isGlobal === true && cur.id === props.noteId) {
            goToHref(routes.notes(), { replace: true });
          }
        } else {
          dispatch({ type: "DELETE_POST_NOTE", postId: props.postId, noteId: props.noteId });
          const cur = state.currentNote;
          if (
            state.screen === "note" &&
            cur &&
            cur.isGlobal === false &&
            cur.postId === props.postId &&
            cur.id === props.noteId
          ) {
            goToHref(
              state.noteFrom === "post"
                ? routes.post(props.postId)
                : routes.notes(),
              { replace: true },
            );
          }
        }
      },
    },
  ];

  return (
    <ContextMenu
      className="chat-card-ctx"
      align="right"
      portal
      triggerAriaLabel="Действия с заметкой"
      trigger={<MoreDotsTrigger />}
      items={items}
    />
  );
}
