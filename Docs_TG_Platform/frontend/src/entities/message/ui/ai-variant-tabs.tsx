import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { MessageText } from "@/entities/message/ui/chat-bubble";
import type { AiVariant } from "@/shared/types";

type AiVariantTabsProps = {
  variants: AiVariant[];
  variantIdx: number;
  onVariantChange: (variantIdx: number) => void;
};

export function AiVariantTabs({ variants, variantIdx, onVariantChange }: AiVariantTabsProps) {
  if (variants.length <= 1) return null;

  return (
    <Tabs
      value={String(variantIdx)}
      onValueChange={(v) => onVariantChange(Number(v))}
    >
      <TabsList className="h-8">
        {variants.map((v, i) => (
          <TabsTrigger key={v.key} value={String(i)}>
            {v.label || `Вариант ${i + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {variants.map((v, i) => (
        <TabsContent key={v.key} value={String(i)} className="mt-2">
          <MessageText text={v.text} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
