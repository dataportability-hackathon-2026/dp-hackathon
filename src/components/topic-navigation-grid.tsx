"use client"

import { useMemo, useState, useId } from "react"
import Link from "next/link"
import {
  Brain,
  Calendar,
  FileText,
  LayoutGrid,
  List,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { siteConfig } from "@/lib/white-label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { TOPICS, slugify, type MockTopic } from "@/lib/topics"
import { cn } from "@/lib/utils"
import { ProfileSheetContent } from "@/components/profile-sheet-content"
import { ConnectDialog } from "@/components/single-page-app"
import { CreditBadge } from "@/components/billing/credit-badge"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"

type ViewMode = "bento" | "list"
type SortOption = "name" | "mastery" | "deadline" | "recently-updated" | "files"

const SORT_ITEMS = [
  { label: "Recently Updated", value: "recently-updated" },
  { label: "Deadline", value: "deadline" },
  { label: "Mastery", value: "mastery" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Most Sources", value: "files" },
] as const

// Repeating span pattern for a dense 3-col grid with height variants.
const SPAN_PATTERN = [
  { span: "md:col-span-2", height: "md:min-h-[16rem]" },  // wide + tall
  { span: "md:col-span-1", height: "md:min-h-[12rem]" },  // standard
  { span: "md:col-span-1", height: "md:min-h-[14rem]" },  // medium
  { span: "md:col-span-1", height: "md:min-h-[10rem]" },  // compact
  { span: "md:col-span-2", height: "md:min-h-[12rem]" },  // wide + short
  { span: "md:col-span-1", height: "md:min-h-[16rem]" },  // tall
  { span: "md:col-span-2", height: "md:min-h-[14rem]" },  // wide + medium
  { span: "md:col-span-1", height: "md:min-h-[12rem]" },  // standard
  { span: "md:col-span-1", height: "md:min-h-[10rem]" },  // compact
  { span: "md:col-span-2", height: "md:min-h-[16rem]" },  // wide + tall
  { span: "md:col-span-1", height: "md:min-h-[14rem]" },  // medium
  { span: "md:col-span-1", height: "md:min-h-[12rem]" },  // standard
] as const

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

function getAverageMastery(topic: MockTopic): number {
  if (topic.masteryData.length === 0) return 0
  return topic.masteryData.reduce((sum, m) => sum + m.posteriorMean, 0) / topic.masteryData.length
}

function getEarliestDeadline(topic: MockTopic): string {
  const deadlines = topic.projects
    .map((p) => p.deadline)
    .filter((d) => d !== "")
    .sort()
  return deadlines[0] ?? ""
}

function getLatestActivity(topic: MockTopic): string {
  const timestamps = topic.chatHistory.map((m) => m.timestamp)
  if (timestamps.length === 0) return ""
  return timestamps.sort().reverse()[0]
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const shuffled = [...arr]
  let s = seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647
    const j = s % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function sortTopics(topics: MockTopic[], sortBy: SortOption): MockTopic[] {
  const sorted = [...topics]
  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case "mastery":
      return sorted.sort((a, b) => getAverageMastery(b) - getAverageMastery(a))
    case "deadline": {
      return sorted.sort((a, b) => {
        const da = getEarliestDeadline(a)
        const db = getEarliestDeadline(b)
        if (!da && !db) return 0
        if (!da) return 1
        if (!db) return -1
        return da.localeCompare(db)
      })
    }
    case "recently-updated":
      return sorted.sort((a, b) => {
        const ta = getLatestActivity(a)
        const tb = getLatestActivity(b)
        if (!ta && !tb) return 0
        if (!ta) return 1
        if (!tb) return -1
        return tb.localeCompare(ta)
      })
    case "files":
      return sorted.sort((a, b) => b.fileCount - a.fileCount)
    default:
      return sorted
  }
}

export function TopicNavigationGrid() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("recently-updated")
  const [viewMode, setViewMode] = useState<ViewMode>("bento")
  const searchId = useId()

  const filteredTopics = useMemo(() => {
    const q = search.toLowerCase().trim()
    const topics = q
      ? TOPICS.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.domain.toLowerCase().includes(q) ||
            t.parentGroup.toLowerCase().includes(q) ||
            t.projects.some((p) => p.name.toLowerCase().includes(q))
        )
      : seededShuffle(TOPICS, 42)

    return sortTopics(topics, sortBy)
  }, [search, sortBy])

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 px-1 py-1">
          <Brain className="size-5 text-primary" />
          <span className="text-sm font-semibold">{siteConfig.name}</span>
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
      </header>

      <div className="mx-auto max-w-[1400px] p-6 sm:p-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id={searchId}
              placeholder="Search topics, domains, projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button>
              <Plus className="size-4" />
              Create New Topic
            </Button>
            <span className="text-xs text-muted-foreground whitespace-nowrap">Sort by</span>
            <Select items={SORT_ITEMS} value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
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

        {filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="mb-3 size-8" />
            <p className="text-sm">No topics match your search</p>
          </div>
        ) : viewMode === "bento" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:[grid-auto-flow:dense]">
            {filteredTopics.map((topic, i) => {
              const pattern = SPAN_PATTERN[i % SPAN_PATTERN.length]
              const isWide = pattern.span.includes("col-span-2")
              return (
                <TopicBentoCard
                  key={topic.id}
                  topic={topic}
                  spanClass={`${pattern.span} ${pattern.height}`}
                  large={isWide}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredTopics.map((topic) => (
              <TopicListRow key={topic.id} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TopicBentoCard({
  topic,
  spanClass,
  large,
}: {
  topic: MockTopic
  spanClass: string
  large: boolean
}) {
  const totalMastery = getAverageMastery(topic)
  const topicSlug = slugify(topic.name)
  const firstProjectSlug = slugify(topic.projects[0]?.name ?? "")
  const deadline = getEarliestDeadline(topic)

  return (
    <Link
      href={`/dashboard/${topicSlug}/${firstProjectSlug}`}
      className={cn(
        "group block",
        spanClass
      )}
    >
      <SpotlightCard
        className={cn(
          "flex h-full flex-col justify-between rounded-xl",
          "bg-background",
          "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
          "dark:[border:1px_solid_rgba(255,255,255,.1)]",
          "transition-all hover:shadow-lg hover:scale-[1.01]",
        )}
        spotlightColor="rgba(139, 92, 246, 0.15)"
      >
        <div className="flex-1 p-5">
          <div>
            <h3 className="text-2xl font-semibold truncate">
              {topic.name}
            </h3>
            <p className="text-sm text-muted-foreground">{topic.domain}</p>
          </div>

          {large && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {topic.projects.map((p) => (
                <Badge key={p.id} variant="secondary" className="text-xs">
                  {p.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/40 px-5 py-3">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FileText className="size-3" />
                {topic.fileCount}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="size-3" />
                {topic.chatHistory.length}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="size-3" />
                {formatPercent(totalMastery)}
              </span>
            </div>
            {deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/60 transition-all"
              style={{ width: `${Math.round(totalMastery * 100)}%` }}
            />
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}

function TopicListRow({ topic }: { topic: MockTopic }) {
  const totalMastery = getAverageMastery(topic)
  const topicSlug = slugify(topic.name)
  const firstProjectSlug = slugify(topic.projects[0]?.name ?? "")
  const deadline = getEarliestDeadline(topic)

  return (
    <Link
      href={`/dashboard/${topicSlug}/${firstProjectSlug}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl p-5",
        "bg-background",
        "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05)]",
        "dark:[border:1px_solid_rgba(255,255,255,.1)]",
        "transition-all hover:shadow-md"
      )}
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-semibold truncate">{topic.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{topic.domain}</p>
      </div>

      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="size-3" />
          {topic.fileCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="size-3" />
          {topic.chatHistory.length}
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="size-3" />
          {formatPercent(totalMastery)}
        </span>
        {deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      <div className="w-20 shrink-0">
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/60 transition-all"
            style={{ width: `${Math.round(totalMastery * 100)}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
