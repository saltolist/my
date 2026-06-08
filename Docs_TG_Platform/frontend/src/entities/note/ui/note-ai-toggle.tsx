import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import { AiContextBadge } from "@/shared/ui/ai-context-badge";

type NoteAiToggleProps =
  | {
      variant: "badge";
      ai: boolean;
      onToggle: () => void;
    }
  | {
      variant: "switch";
      ai: boolean;
      onToggle: () => void;
      showBadge?: boolean;
    };

export function NoteAiToggle(props: NoteAiToggleProps) {
  if (props.variant === "badge") {
    return (
      <Badge
        variant={props.ai ? "default" : "secondary"}
        className="cursor-pointer shrink-0"
        onClick={props.onToggle}
      >
        {props.ai ? "ИИ" : "ручная"}
      </Badge>
    );
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-2">
      {props.showBadge !== false ? <AiContextBadge ai={props.ai} /> : null}
      <Switch
        checked={props.ai}
        onCheckedChange={props.onToggle}
        aria-label="Учитывать в контексте ИИ"
      />
    </div>
  );
}
