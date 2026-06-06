import type { DomainState } from "@/app/model/store/domain/types";
import type { NavigationState } from "@/app/model/store/navigation/types";

export type CombinedPatch = Partial<NavigationState & DomainState>;

export type UserMessageEditSession = { discard: () => void };

export const POST_EDIT_LEAVE_MSG =
  "Вы редактируете пост. Покинуть страницу без сохранения?";

export const USER_MSG_EDIT_LEAVE_MSG =
  "Вы редактируете сообщение. Покинуть без сохранения?";
