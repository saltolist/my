"use client";

import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";

import { useSchedulePost } from "../model/useSchedulePost";

function defaultDateTimeLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d.toISOString().slice(0, 16);
}

export type SchedulePostDialogProps = {
  postId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SchedulePostDialog({ postId, open, onOpenChange }: SchedulePostDialogProps) {
  const schedulePost = useSchedulePost();
  const [dateTime, setDateTime] = useState(defaultDateTimeLocal);

  useEffect(() => {
    if (open) {
      setDateTime(defaultDateTimeLocal());
    }
  }, [open]);

  const handleSubmit = async () => {
    const scheduledAt = new Date(dateTime);
    if (Number.isNaN(scheduledAt.getTime())) return;
    await schedulePost.mutateAsync({ id: postId, scheduledAt });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Запланировать публикацию</DialogTitle>
        </DialogHeader>
        <Input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          aria-label="Дата и время публикации"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={schedulePost.isPending}>
            Запланировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
