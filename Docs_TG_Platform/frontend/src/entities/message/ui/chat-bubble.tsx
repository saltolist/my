import { cn } from "@/shared/lib/utils";
import type { ChatRole } from "@/shared/types";

type ChatBubbleProps = {
  role: ChatRole;
  children: React.ReactNode;
  className?: string;
  editing?: boolean;
};

export function ChatBubble({ role, children, className, editing }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        role === "user"
          ? "relative rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-primary-foreground"
          : "rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-foreground",
        editing && "w-full min-w-[16rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MessageText({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">{text}</div>
  );
}
