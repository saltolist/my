"use client";

import { useMutation } from "@tanstack/react-query";
import { useUpdatePost } from "@/entities/post/model/usePosts";

function formatScheduledDate(d: Date): string {
  const months = [
    "янв", "фев", "мар", "апр", "май", "июн",
    "июл", "авг", "сен", "окт", "ноя", "дек",
  ];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} · ${hours}:${mins}`;
}

type SchedulePostInput = {
  id: number;
  scheduledAt: Date;
};

export function useSchedulePost() {
  const updatePost = useUpdatePost();

  return useMutation({
    mutationFn: async ({ id, scheduledAt }: SchedulePostInput) => {
      await updatePost.mutateAsync({
        id,
        patch: { status: "scheduled", date: formatScheduledDate(scheduledAt) },
      });
    },
  });
}
