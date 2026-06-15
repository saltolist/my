import { create } from "zustand";

import type { ComposerScope } from "@/shared/types";

type ComposerTarget = { llmId: string; webId: string };

type ComposerTargetState = {
  targets: Record<ComposerScope, ComposerTarget>;
  setLlmId: (scope: ComposerScope, llmId: string) => void;
  setWebId: (scope: ComposerScope, webId: string) => void;
  getTarget: (scope: ComposerScope) => ComposerTarget;
  resetTargets: () => void;
};

const defaultTarget = (): ComposerTarget => ({ llmId: "", webId: "" });

const initialTargets = (): Record<ComposerScope, ComposerTarget> => ({
  home: defaultTarget(),
  gchat: defaultTarget(),
  post: defaultTarget(),
});

export const useComposerTargetStore = create<ComposerTargetState>((set, get) => ({
  targets: initialTargets(),
  resetTargets: () => set({ targets: initialTargets() }),
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
