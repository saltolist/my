"use client";

import { useEffect, useMemo, useState } from "react";

import { useAiProfile } from "@/entities/channel/model/useProfile";

export function useComposerModels() {
  const { data: aiProfile } = useAiProfile();
  const [llmId, setLlmId] = useState("");
  const [webId, setWebId] = useState("");
  const [multiReply, setMultiReply] = useState(false);

  const llmOptions = useMemo(
    () =>
      (aiProfile?.llmModels ?? [])
        .filter((m) => m.active)
        .map((m) => ({ id: m.id, label: `${m.provider} / ${m.model}` })),
    [aiProfile],
  );

  const webOptions = useMemo(
    () =>
      (aiProfile?.webSearchModels ?? [])
        .filter((m) => m.active)
        .map((m) => ({ id: m.id, label: `${m.provider} / ${m.model}` })),
    [aiProfile],
  );

  const showMultiReply = useMemo(() => {
    const allModels = [...(aiProfile?.llmModels ?? []), ...(aiProfile?.webSearchModels ?? [])];
    return allModels.filter((m) => m.active && m.includeInMulti).length >= 2;
  }, [aiProfile]);

  useEffect(() => {
    if (llmOptions.length && !llmId) setLlmId(llmOptions[0]!.id);
  }, [llmOptions, llmId]);

  useEffect(() => {
    if (webOptions.length && !webId) setWebId(webOptions[0]!.id);
  }, [webOptions, webId]);

  return {
    llmId,
    setLlmId,
    webId,
    setWebId,
    llmOptions,
    webOptions,
    multiReply,
    setMultiReply,
    showMultiReply,
  };
}
