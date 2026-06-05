import type { ChatMessage, UserMessageBranch } from "@/shared/types";

/** Заглушка ответа ассистента после правки пользовательского сообщения (несколько строк, в конце пометка). */
export const STUB_REPLY_AFTER_USER_EDIT: ChatMessage = {
  role: "ai",
  text:
    "Ответ ассистента в продукте занял бы здесь привычное полотно: короткое резюме, затем развёрнутые пояснения с опорой на ваш запрос и контекст треда.\n\n" +
    "В демо вместо вызова модели подставлен нейтральный текст на пару абзацев, чтобы было видно переносы строк и общий вид блока в чате.\n\n" +
    "отредактировано",
};

export function clampActiveBranchIndex(m: ChatMessage): number {
  if (m.role !== "user" || !m.userBranches?.length) return 0;
  const n = m.userBranches.length;
  return Math.min(Math.max(Number(m.activeUserBranch) || 0, 0), n - 1);
}

/** Текст пользовательского сообщения (с учётом активной ветки). */
export function displayUserText(m: ChatMessage): string {
  if (m.role !== "user") return "";
  if (m.userBranches?.length) {
    const i = clampActiveBranchIndex(m);
    return m.userBranches[i]?.text ?? "";
  }
  return m.text ?? "";
}

export function resolveMessage(history: ChatMessage[], path: number[]): ChatMessage | null {
  if (path.length === 0) return null;
  let list = history;
  let m: ChatMessage | undefined = list[path[0]];
  if (!m) return null;
  for (let k = 1; k < path.length; k++) {
    if (m.role !== "user" || !m.userBranches?.length) return null;
    const cont: ChatMessage[] = m.userBranches[clampActiveBranchIndex(m)].continuation;
    m = cont[path[k]];
    if (!m) return null;
  }
  return m;
}

/** Родительский массив и индекс сообщения по `path`. */
export function getParentListAndIndex(
  history: ChatMessage[],
  path: number[],
): { list: ChatMessage[]; index: number } | null {
  if (path.length === 0) return null;
  const lastIx = path[path.length - 1];
  if (path.length === 1) return { list: history, index: lastIx };
  let list = history;
  for (let d = 0; d < path.length - 1; d++) {
    const ix = path[d];
    const m = list[ix];
    if (!m || m.role !== "user" || !m.userBranches?.length) return null;
    list = m.userBranches[clampActiveBranchIndex(m)].continuation;
  }
  return { list, index: lastIx };
}

/** Заменить целиком список, в котором лежит сообщение с путём `memberPath`. */
export function replaceContainingList(
  history: ChatMessage[],
  memberPath: number[],
  newList: ChatMessage[],
): ChatMessage[] {
  const ownerPath = memberPath.slice(0, -1);
  if (ownerPath.length === 0) return newList;
  return setContinuationAt(history, ownerPath, newList);
}

function setContinuationAt(
  history: ChatMessage[],
  ownerPath: number[],
  newContinuation: ChatMessage[],
): ChatMessage[] {
  const [head, ...rest] = ownerPath;
  return history.map((m, i) => {
    if (i !== head) return m;
    if (m.role !== "user" || !m.userBranches?.length) return m;
    const bi = clampActiveBranchIndex(m);
    if (rest.length === 0) {
      return {
        ...m,
        userBranches: m.userBranches.map((b, j) =>
          j === bi ? { ...b, continuation: newContinuation } : b,
        ),
      };
    }
    return {
      ...m,
      userBranches: m.userBranches.map((b, j) =>
        j === bi ? { ...b, continuation: setContinuationAt(b.continuation, rest, newContinuation) } : b,
      ),
    };
  });
}

export function mapMessageAtPath(
  history: ChatMessage[],
  path: number[],
  updater: (m: ChatMessage) => ChatMessage,
): ChatMessage[] {
  if (path.length === 0) return history;
  const [head, ...rest] = path;
  if (rest.length === 0) {
    return history.map((m, i) => (i === head ? updater(m) : m));
  }
  return history.map((m, i) => {
    if (i !== head) return m;
    if (m.role !== "user" || !m.userBranches?.length) return m;
    const bi = clampActiveBranchIndex(m);
    return {
      ...m,
      userBranches: m.userBranches.map((b, j) =>
        j === bi ? { ...b, continuation: mapMessageAtPath(b.continuation, rest, updater) } : b,
      ),
    };
  });
}

/** Плоский порядок отображения (только активные ветки). */
export function flattenVisibleWithPaths(
  history: ChatMessage[],
): Array<{ message: ChatMessage; path: number[] }> {
  const out: Array<{ message: ChatMessage; path: number[] }> = [];
  function walk(list: ChatMessage[], prefix: number[]) {
    for (let i = 0; i < list.length; i++) {
      const m = list[i];
      const path = [...prefix, i];
      out.push({ message: m, path });
      if (m.role === "user" && m.userBranches?.length) {
        const bi = clampActiveBranchIndex(m);
        walk(m.userBranches[bi].continuation, path);
      }
    }
  }
  walk(history, []);
  return out;
}

/** Число сообщений в видимом треде (для счётчика омниканального бота). */
export function countVisibleChatMessages(history: ChatMessage[]): number {
  return flattenVisibleWithPaths(history).length;
}

export function lastAssistantFlatIndex(
  flat: Array<{ message: ChatMessage; path: number[] }>,
): number {
  for (let i = flat.length - 1; i >= 0; i--) {
    if (flat[i].message.role === "ai") return i;
  }
  return -1;
}

export function lastUserPreviewFromVisibleHistory(history: ChatMessage[]): string {
  const flat = flattenVisibleWithPaths(history);
  for (let i = flat.length - 1; i >= 0; i--) {
    const m = flat[i].message;
    if (m.role === "user") {
      const t = displayUserText(m).trim();
      if (t) return t;
    }
  }
  return "";
}

/** Добавить сообщение в конец активной ветки. */
export function appendToActiveHistory(history: ChatMessage[], msg: ChatMessage): ChatMessage[] {
  if (history.length === 0) return [msg];
  const last = history[history.length - 1];
  if (last.role === "user" && last.userBranches?.length) {
    const bi = clampActiveBranchIndex(last);
    return [
      ...history.slice(0, -1),
      {
        ...last,
        userBranches: last.userBranches.map((b, j) =>
          j === bi ? { ...b, continuation: appendToActiveHistory(b.continuation, msg) } : b,
        ),
      },
    ];
  }
  return [...history, msg];
}

function setUserDisplayText(m: ChatMessage, text: string): ChatMessage {
  if (m.role !== "user") return m;
  if (m.userBranches?.length) {
    const bi = clampActiveBranchIndex(m);
    return {
      ...m,
      userBranches: m.userBranches.map((b, j) => (j === bi ? { ...b, text } : b)),
    };
  }
  return { ...m, text };
}

/** После правки пользователя: всё продолжение активной ветки заменяется одним ответом-заглушкой. */
export function replaceTailAfterUserWithStubAi(history: ChatMessage[], path: number[]): ChatMessage[] {
  const u = resolveMessage(history, path);
  if (!u || u.role !== "user") return history;
  const stub = STUB_REPLY_AFTER_USER_EDIT;
  if (u.userBranches?.length) {
    return mapMessageAtPath(history, path, (m) => {
      if (m.role !== "user" || !m.userBranches?.length) return m;
      const b = clampActiveBranchIndex(m);
      return {
        ...m,
        userBranches: m.userBranches.map((br, j) =>
          j === b ? { ...br, continuation: [stub] } : br,
        ),
      };
    });
  }
  const ctx = getParentListAndIndex(history, path);
  if (!ctx) return history;
  const { list, index } = ctx;
  const newList = [...list.slice(0, index + 1), stub];
  return replaceContainingList(history, path, newList);
}

/** Сохранение текста пользователя: форк при «хвосте» снизу, иначе правка на месте; без заглушки ИИ. */
function applyUserMessageSaveCore(history: ChatMessage[], path: number[], newText: string): ChatMessage[] {
  const ctx = getParentListAndIndex(history, path);
  if (!ctx) return history;
  const { list, index } = ctx;
  const target = list[index];
  if (!target || target.role !== "user") return history;

  const trimmed = newText.trim();
  const oldDisplay = displayUserText(target);

  const linearTail = list.slice(index + 1);
  const activeCont =
    target.userBranches?.length && target.userBranches[clampActiveBranchIndex(target)]
      ? target.userBranches[clampActiveBranchIndex(target)].continuation
      : [];
  const hasLinearTail = linearTail.length > 0;
  const hasNestedTail = activeCont.length > 0;

  if (!hasLinearTail && !hasNestedTail) {
    if (trimmed === oldDisplay.trim()) return history;
    const updated = setUserDisplayText(target, trimmed);
    return mapMessageAtPath(history, path, () => updated);
  }

  if (trimmed === oldDisplay.trim()) return history;

  if (!target.userBranches?.length) {
    const forked: ChatMessage = {
      role: "user",
      userBranches: [
        { text: oldDisplay, continuation: linearTail },
        { text: trimmed, continuation: [] },
      ],
      activeUserBranch: 1,
    };
    const newList = [...list.slice(0, index), forked];
    return replaceContainingList(history, path, newList);
  }

  const bi = clampActiveBranchIndex(target);
  const branches: UserMessageBranch[] = [...target.userBranches!];
  const oldBranch = branches[bi];
  const forkedUser: ChatMessage = {
    ...target,
    userBranches: [
      ...branches.slice(0, bi),
      { text: oldBranch.text, continuation: [...oldBranch.continuation] },
      { text: trimmed, continuation: [] },
      ...branches.slice(bi + 1),
    ],
    activeUserBranch: bi + 1,
  };
  const newList = [...list.slice(0, index), forkedUser];
  return replaceContainingList(history, path, newList);
}

/** Как `applyUserMessageSaveCore`, плюс всегда новый ответ ассистента-заглушка под отредактированным сообщением (если текст реально менялся / был форк). */
export function applyUserMessageSave(history: ChatMessage[], path: number[], newText: string): ChatMessage[] {
  const next = applyUserMessageSaveCore(history, path, newText);
  if (next === history) return history;
  return replaceTailAfterUserWithStubAi(next, path);
}

/** Омниканальный бот: правка на месте без веток, затем одна заглушка ассистента. */
export function applyOmnichannelUserMessageSave(
  history: ChatMessage[],
  path: number[],
  newText: string,
): ChatMessage[] {
  const u = resolveMessage(history, path);
  if (!u || u.role !== "user") return history;
  const trimmed = newText.trim();
  if (trimmed === displayUserText(u).trim()) return history;
  const next = mapMessageAtPath(history, path, () => ({ role: "user", text: trimmed }));
  return replaceTailAfterUserWithStubAi(next, path);
}

export function setActiveUserBranch(history: ChatMessage[], path: number[], branchIdx: number): ChatMessage[] {
  return mapMessageAtPath(history, path, (m) => {
    if (m.role !== "user" || !m.userBranches?.length) return m;
    const n = m.userBranches.length;
    const b = Math.min(Math.max(branchIdx, 0), n - 1);
    return { ...m, activeUserBranch: b };
  });
}

export function removeMessageAtPath(history: ChatMessage[], path: number[]): ChatMessage[] {
  const ctx = getParentListAndIndex(history, path);
  if (!ctx) return history;
  const { list, index } = ctx;
  const newList = list.filter((_, j) => j !== index);
  return replaceContainingList(history, path, newList);
}
