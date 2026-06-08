"use client";

import { useState } from "react";
import {
  BarChart3,
  Brain,
  Inbox,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import type { FeedCardWidth } from "@/shared/types";

import {
  AiContextBadge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  BackButton,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  ContextMenuButton,
  CopyButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptySection,
  EmptyState,
  ErrorFallback,
  FeedCardWidthToggle,
  FilterTabs,
  IconButton,
  Input,
  Label,
  ModelPicker,
  MultiReplyToggle,
  PasswordToggle,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  ScrollArea,
  SearchField,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  SummaryMetricCard,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  WebSearchPicker,
} from "@/shared/ui";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </section>
  );
}

const MODEL_OPTIONS = [
  { id: "gpt", label: "GPT-4o" },
  { id: "claude", label: "Claude 3.5" },
];

export function UiGallery() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ai">("all");
  const [model, setModel] = useState("gpt");
  const [webModel, setWebModel] = useState("none");
  const [multiReply, setMultiReply] = useState(false);
  const [feedWidth, setFeedWidth] = useState<FeedCardWidth>(500);
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6 pb-16">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">UI Gallery</h1>
        <p className="text-sm text-muted-foreground">
          All <code className="text-xs">shared/ui</code> platform primitives — development only.
        </p>
      </header>

      <Section title="AiContextBadge">
        <AiContextBadge ai />
        <AiContextBadge ai={false} />
        <span className="text-xs text-muted-foreground">(false → null)</span>
      </Section>

      <Section title="Avatar">
        <Avatar>
          <AvatarImage src="https://api.dicebear.com/9.x/initials/svg?seed=TG" alt="TG" />
          <AvatarFallback>TG</AvatarFallback>
        </Avatar>
        <Avatar size="sm">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      </Section>

      <Section title="BackButton">
        <BackButton onClick={() => undefined} />
        <BackButton label="Назад" onClick={() => undefined} />
      </Section>

      <Section title="Badge">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </Section>

      <Section title="Breadcrumb">
        <Breadcrumb items={[{ label: "Лента" }]} />
        <Breadcrumb
          items={[{ label: "Лента", href: "/feed/" }, { label: "Пост #42" }]}
        />
      </Section>

      <Section title="Button">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
      </Section>

      <Section title="Card">
        <Card className="w-64">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>Card content</CardContent>
        </Card>
      </Section>

      <Section title="Checkbox">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
          Checked
        </label>
      </Section>

      <Section title="ContextMenuButton">
        <ContextMenuButton
          items={[
            { label: "Переименовать", onClick: () => undefined },
            { label: "Удалить", onClick: () => undefined, variant: "destructive" },
          ]}
        />
      </Section>

      <Section title="CopyButton">
        <CopyButton text="hello@tg.platform" />
      </Section>

      <Section title="Dialog">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>Dialog description text.</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="EmptySection">
        <EmptySection message="Нет черновиков в этой секции." />
      </Section>

      <Section title="EmptyState">
        <EmptyState
          icon={<Inbox className="size-5" />}
          message="Чаты не найдены"
          action={<Button size="sm">Создать чат</Button>}
        />
      </Section>

      <Section title="ErrorFallback">
        <ErrorFallback message="Не удалось загрузить данные" onRetry={() => undefined} />
      </Section>

      <Section title="FeedCardWidthToggle">
        <FeedCardWidthToggle value={feedWidth} onChange={setFeedWidth} />
      </Section>

      <Section title="FilterTabs">
        <FilterTabs
          value={filter}
          options={[
            { value: "all", label: "Все" },
            { value: "ai", label: "С ИИ" },
          ]}
          onChange={setFilter}
        />
      </Section>

      <Section title="IconButton">
        <IconButton aria-label="Добавить">
          <Plus className="size-4" />
        </IconButton>
        <IconButton aria-label="Настройки">
          <Settings className="size-4" />
        </IconButton>
      </Section>

      <Section title="Input / Label / Textarea">
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Label htmlFor="demo-input">Label</Label>
          <Input id="demo-input" placeholder="Input" />
          <Textarea placeholder="Textarea" rows={2} />
        </div>
      </Section>

      <Section title="ModelPicker / WebSearchPicker">
        <ModelPicker
          label="Модель"
          icon={<Brain className="size-3.5" />}
          options={MODEL_OPTIONS}
          value={model}
          onChange={setModel}
        />
        <WebSearchPicker
          options={[{ id: "none", label: "Нет" }, ...MODEL_OPTIONS]}
          value={webModel}
          onChange={setWebModel}
        />
      </Section>

      <Section title="MultiReplyToggle">
        <MultiReplyToggle checked={multiReply} onCheckedChange={setMultiReply} />
      </Section>

      <Section title="PasswordToggle">
        <PasswordToggle className="w-48" placeholder="Пароль" />
      </Section>

      <Section title="Popover">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Popover</PopoverTitle>
              <PopoverDescription>Short description.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </Section>

      <Section title="ScrollArea">
        <ScrollArea className="h-24 w-48 rounded-md border">
          <div className="space-y-2 p-3 text-sm">
            {Array.from({ length: 8 }, (_, i) => (
              <p key={i}>Scroll item {i + 1}</p>
            ))}
          </div>
        </ScrollArea>
      </Section>

      <Section title="SearchField">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Поиск…"
          aria-label="Поиск"
          className="w-48"
        />
      </Section>

      <Section title="Separator">
        <span>Left</span>
        <Separator orientation="vertical" className="h-4" />
        <span>Right</span>
      </Section>

      <Section title="Sheet">
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Sheet</SheetTitle>
              <SheetDescription>Slide-over panel.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </Section>

      <Section title="Skeleton">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="size-8 rounded-full" />
      </Section>

      <Section title="SummaryMetricCard">
        <SummaryMetricCard
          label="Охват"
          value="12.4K"
          icon={<BarChart3 className="size-4" />}
        />
      </Section>

      <Section title="Switch">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={switched} onCheckedChange={setSwitched} />
          Enabled
        </label>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="a" className="w-full max-w-xs">
          <TabsList>
            <TabsTrigger value="a">Tab A</TabsTrigger>
            <TabsTrigger value="b">Tab B</TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="text-sm text-muted-foreground">
            Content A
          </TabsContent>
          <TabsContent value="b" className="text-sm text-muted-foreground">
            Content B
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Tooltip">
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" size="sm" />}>
            <Search className="size-3.5" />
            Hover me
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </Section>
    </div>
  );
}
