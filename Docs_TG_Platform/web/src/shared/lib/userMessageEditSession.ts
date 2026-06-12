export const USER_MSG_EDIT_LEAVE_MSG =
  "Вы редактируете сообщение. Покинуть без сохранения?";

const POST_EDIT_LEAVE_MSG = "Вы редактируете пост. Покинуть страницу без сохранения?";

type Session = { discard: () => void };

let activeSession: Session | null = null;

export function registerUserMessageEdit(discard: () => void): void {
  activeSession = { discard };
}

export function unregisterUserMessageEdit(discard: () => void): void {
  if (activeSession?.discard === discard) activeSession = null;
}

export function confirmDiscardUserMessageEdit(): boolean {
  if (!activeSession) return true;
  return window.confirm(USER_MSG_EDIT_LEAVE_MSG);
}

export function discardUserMessageEdit(): void {
  activeSession?.discard();
  activeSession = null;
}

export function confirmDiscardAnyChatEdit(isPostEditing: boolean): boolean {
  if (isPostEditing && !window.confirm(POST_EDIT_LEAVE_MSG)) return false;
  if (!confirmDiscardUserMessageEdit()) return false;
  return true;
}
