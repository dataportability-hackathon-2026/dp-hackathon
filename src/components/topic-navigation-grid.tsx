"use client";

import {
  Brain,
  Copy,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { CreditBadge } from "@/components/billing/credit-badge";
import { ProfileSheetContent } from "@/components/profile-sheet-content";
import { SpotlightCard } from "@/components/reactbits/spotlight-card";
import { ConnectDialog } from "@/components/single-page-app";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { usePreference } from "@/lib/hooks/use-preferences";
import { useCreateTopic, useTopics } from "@/lib/hooks/use-topics";
import { FadeIn, StaggerItem, StaggerList } from "@/lib/motion";
import type { Topic } from "@/lib/types/topic";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/white-label";

type ViewMode = "bento" | "list";
type SortOption = "name" | "recently-updated" | "sources";

const SORT_ITEMS = [
  { label: "Recently Updated", value: "recently-updated" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Most Sources", value: "sources" },
] as const;

const SPAN_PATTERN = [
  { span: "md:col-span-2", height: "md:min-h-[16rem]" },
  { span: "md:col-span-1", height: "md:min-h-[12rem]" },
  { span: "md:col-span-1", height: "md:min-h-[14rem]" },
  { span: "md:col-span-1", height: "md:min-h-[10rem]" },
  { span: "md:col-span-2", height: "md:min-h-[12rem]" },
  { span: "md:col-span-1", height: "md:min-h-[16rem]" },
  { span: "md:col-span-2", height: "md:min-h-[14rem]" },
  { span: "md:col-span-1", height: "md:min-h-[12rem]" },
  { span: "md:col-span-1", height: "md:min-h-[10rem]" },
  { span: "md:col-span-2", height: "md:min-h-[16rem]" },
  { span: "md:col-span-1", height: "md:min-h-[14rem]" },
  { span: "md:col-span-1", height: "md:min-h-[12rem]" },
] as const;

function sortTopics(topics: Topic[], sortBy: SortOption): Topic[] {
  const sorted = [...topics];
  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "recently-updated":
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "sources":
      return sorted.sort((a, b) => b.sourceCount - a.sourceCount);
    default:
      return sorted;
  }
}

export function TopicNavigationGrid() {
  const { userTopics, communityTopics, isLoading, mutate } = useTopics();
  const { createTopic, isCreating } = useCreateTopic();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recently-updated");
  const [viewMode, setViewMode] = useState<ViewMode>("bento");
  const [showCommunity, setShowCommunity] = usePreference("showCommunity");
  const searchId = useId();
  const switchId = useId();

  const filteredUserTopics = useMemo(() => {
    const q = search.toLowerCase().trim();
    const topics = q
      ? userTopics.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.domain ?? "").toLowerCase().includes(q) ||
            (t.parentGroup ?? "").toLowerCase().includes(q),
        )
      : userTopics;
    return sortTopics(topics, sortBy);
  }, [search, sortBy, userTopics]);

  const filteredCommunityTopics = useMemo(() => {
    if (!showCommunity) return [];
    const q = search.toLowerCase().trim();
    const topics = q
      ? communityTopics.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.domain ?? "").toLowerCase().includes(q) ||
            (t.parentGroup ?? "").toLowerCase().includes(q),
        )
      : communityTopics;
    return sortTopics(topics, sortBy);
  }, [search, sortBy, communityTopics, showCommunity]);

  const hasUserTopics = userTopics.length > 0;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>
          <span className="text-sm text-muted-foreground">Topics</span>
          <div className="ml-auto flex items-center gap-2">
            <ConnectDialog />
            <CreditBadge />
            <Sheet>
              <SheetTrigger
                render={
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1.5 transition-colors hover:bg-muted"
                  />
                }
              >
                <Avatar size="sm">
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg">
                <ProfileSheetContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] p-6 sm:p-10">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Filter row */}
            <FadeIn className="mb-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 flex-1 max-w-lg">
                  <div className="relative max-w-sm flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id={searchId}
                      placeholder="Search topics, domains..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={switchId}
                      checked={showCommunity}
                      onCheckedChange={setShowCommunity}
                    />
                    <Label
                      htmlFor={switchId}
                      className="text-xs whitespace-nowrap cursor-pointer"
                    >
                      Community
                    </Label>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasUserTopics && (
                    <Button onClick={() => createTopic()} disabled={isCreating}>
                      {isCreating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                      Create New Topic
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Sort by
                  </span>
                  <Select
                    items={SORT_ITEMS}
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_ITEMS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant={viewMode === "bento" ? "secondary" : "ghost"}
                      size="icon"
                      className="size-8 rounded-r-none"
                      onClick={() => setViewMode("bento")}
                      aria-label="Bento grid view"
                    >
                      <LayoutGrid className="size-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="size-8 rounded-l-none"
                      onClick={() => setViewMode("list")}
                      aria-label="List view"
                    >
                      <List className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Empty state for new users */}
            {!hasUserTopics && (
              <FadeIn className="mb-10">
                <SpotlightCard
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl p-12 text-center",
                    "bg-background",
                    "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
                    "dark:[border:1px_solid_rgba(255,255,255,.1)]",
                  )}
                  spotlightColor="rgba(139, 92, 246, 0.15)"
                >
                  <Sparkles className="mb-4 size-10 text-primary" />
                  <h2 className="mb-2 text-2xl font-semibold">
                    Start your learning journey
                  </h2>
                  <p className="mb-6 max-w-md text-sm text-muted-foreground">
                    Create your first topic to organize sources, track progress,
                    and get AI-powered study guidance.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => createTopic()}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                    Create Your First Topic
                  </Button>
                </SpotlightCard>
              </FadeIn>
            )}

            {/* User topics */}
            {filteredUserTopics.length > 0 && (
              <FadeIn delay={0.1}>
                <TopicGrid
                  topics={filteredUserTopics}
                  viewMode={viewMode}
                  variant="user"
                  onMutate={mutate}
                />
              </FadeIn>
            )}

            {/* No results for search */}
            {hasUserTopics &&
              filteredUserTopics.length === 0 &&
              filteredCommunityTopics.length === 0 && (
                <FadeIn>
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Search className="mb-3 size-8" />
                    <p className="text-sm">No topics match your search</p>
                  </div>
                </FadeIn>
              )}

            {/* Community topics */}
            {filteredCommunityTopics.length > 0 && (
              <FadeIn delay={0.2} className="mt-10">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Community Topics
                </h3>
                <TopicGrid
                  topics={filteredCommunityTopics}
                  viewMode={viewMode}
                  variant="community"
                  onMutate={mutate}
                />
              </FadeIn>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TopicGrid({
  topics,
  viewMode,
  variant,
  onMutate,
}: {
  topics: Topic[];
  viewMode: ViewMode;
  variant: "user" | "community";
  onMutate: () => void;
}) {
  if (viewMode === "bento") {
    return (
      <StaggerList className="grid grid-cols-1 gap-4 md:grid-cols-3 md:[grid-auto-flow:dense]">
        {topics.map((t, i) => {
          const pattern = SPAN_PATTERN[i % SPAN_PATTERN.length];
          const isWide = pattern.span.includes("col-span-2");
          return (
            <StaggerItem
              key={t.id}
              className={`${pattern.span} ${pattern.height}`}
            >
              <TopicBentoCard
                topic={t}
                spanClass=""
                large={isWide}
                variant={variant}
                onMutate={onMutate}
              />
            </StaggerItem>
          );
        })}
      </StaggerList>
    );
  }

  return (
    <StaggerList className="flex flex-col gap-4">
      {topics.map((t) => (
        <StaggerItem key={t.id}>
          <TopicListRow topic={t} variant={variant} onMutate={onMutate} />
        </StaggerItem>
      ))}
    </StaggerList>
  );
}

function TopicCardMenu({
  topic,
  onMutate,
}: {
  topic: Topic;
  onMutate: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(topic.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleFavorite = useCallback(async () => {
    await fetch(`/api/topics/${topic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !topic.isFavorite }),
    });
    onMutate();
  }, [topic.id, topic.isFavorite, onMutate]);

  const handleRename = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === topic.name) {
      setRenaming(false);
      return;
    }
    await fetch(`/api/topics/${topic.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    setRenaming(false);
    onMutate();
  }, [name, topic.id, topic.name, onMutate]);

  const handleDuplicate = useCallback(async () => {
    await fetch(`/api/topics/${topic.id}/clone`, { method: "POST" });
    onMutate();
  }, [topic.id, onMutate]);

  const handleDelete = useCallback(async () => {
    await fetch(`/api/topics/${topic.id}`, { method: "DELETE" });
    onMutate();
  }, [topic.id, onMutate]);

  if (renaming) {
    return (
      <div
        className="absolute right-3 top-3 z-10"
        onClick={(e) => e.preventDefault()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => handleRename()}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setName(topic.name);
              setRenaming(false);
            }
          }}
          className="h-7 w-40 rounded border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    );
  }

  return (
    <div
      className="absolute right-3 top-3 z-10"
      onClick={(e) => e.preventDefault()}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted">
          <MoreHorizontal className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={toggleFavorite}>
            <Star
              className={cn(
                "mr-2 size-4",
                topic.isFavorite && "fill-yellow-400 text-yellow-400",
              )}
            />
            {topic.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setRenaming(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            <Pencil className="mr-2 size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 size-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} variant="destructive">
            <Trash2 className="mr-2 size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TopicBentoCard({
  topic,
  spanClass,
  large,
  variant,
  onMutate,
}: {
  topic: Topic;
  spanClass: string;
  large: boolean;
  variant: "user" | "community";
  onMutate: () => void;
}) {
  const router = useRouter();
  const [cloning, setCloning] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (variant === "community") {
        e.preventDefault();
        setCloning(true);
        try {
          const res = await fetch(`/api/topics/${topic.id}/clone`, {
            method: "POST",
          });
          const data = (await res.json()) as { topic: Topic };
          router.push(`/dashboard/${data.topic.slug}`);
        } finally {
          setCloning(false);
        }
      }
    },
    [variant, topic.id, router],
  );

  const href = variant === "user" ? `/dashboard/${topic.slug}` : "#";

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        spanClass,
      )}
    >
      <SpotlightCard
        className={cn(
          "relative flex h-full flex-col justify-between rounded-2xl",
          "bg-card text-card-foreground ring-1 ring-foreground/10",
          "transition-all hover:shadow-lg hover:scale-[1.01]",
        )}
        spotlightColor="rgba(139, 92, 246, 0.15)"
      >
        {variant === "user" && (
          <TopicCardMenu topic={topic} onMutate={onMutate} />
        )}

        {variant === "community" && (
          <div className="absolute right-3 top-3 rounded-full bg-muted p-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
            {cloning ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </div>
        )}

        <div className="flex-1 p-5">
          <div>
            <h3 className="text-2xl font-semibold truncate">{topic.name}</h3>
            {topic.domain && (
              <p className="text-sm text-muted-foreground">{topic.domain}</p>
            )}
          </div>

          {large && topic.parentGroup && (
            <div className="mt-4">
              <span className="text-xs text-muted-foreground">
                {topic.parentGroup}
              </span>
            </div>
          )}
        </div>

        <div className="px-5 py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="size-3" />
              {topic.sourceCount} sources
            </span>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}

function TopicListRow({
  topic,
  variant,
  onMutate,
}: {
  topic: Topic;
  variant: "user" | "community";
  onMutate: () => void;
}) {
  const router = useRouter();
  const [cloning, setCloning] = useState(false);

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      if (variant === "community") {
        e.preventDefault();
        setCloning(true);
        try {
          const res = await fetch(`/api/topics/${topic.id}/clone`, {
            method: "POST",
          });
          const data = (await res.json()) as { topic: Topic };
          router.push(`/dashboard/${data.topic.slug}`);
        } finally {
          setCloning(false);
        }
      }
    },
    [variant, topic.id, router],
  );

  const href = variant === "user" ? `/dashboard/${topic.slug}` : "#";

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl p-5",
        "bg-card text-card-foreground ring-1 ring-foreground/10",
        "transition-all hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      {variant === "user" && (
        <TopicCardMenu topic={topic} onMutate={onMutate} />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-semibold truncate">{topic.name}</h3>
        {topic.domain && (
          <p className="text-sm text-muted-foreground truncate">
            {topic.domain}
          </p>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="size-3" />
          {topic.sourceCount} sources
        </span>
      </div>

      {variant === "community" && (
        <div className="shrink-0">
          {cloning ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Copy className="size-4 text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </Link>
  );
}
