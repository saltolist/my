import { create } from "zustand";

import type { ComposerScope } from "@/shared/types";

type ComposerTarget = { llmId: string; webId: string };

type ComposerTargetState = {
  targets: Record<ComposerScope, ComposerTarget>;
  setLlmId: (scope: ComposerScope, llmId: string) => void;
  setWebId: (scope: ComposerScope, webId: string) => void;
  getTarget: (scope: ComposerScope) => ComposerTarget;
};

const defaultTarget = (): ComposerTarget => ({ llmId: "", webId: "" });

export const useComposerTargetStore = create<ComposerTargetState>((set, get) => ({
  targets: {
    home: defaultTarget(),
    gchat: defaultTarget(),
    post: defaultTarget(),
  },
  setLlmId: (scope, llmId) =>
    set((state) => ({
      targets: { ...state.targets, [scope]: { ...state.targets[scope], llmId } },
    })),
  setWebId: (scope, webId) =>
    set((state) => ({
      targets: { ...state.targets, [scope]: { ...state.targets[scope], webId } },
    })),
  getTarget: (scope) => get().targets[scope] ?? defaultTarget(),
}));
