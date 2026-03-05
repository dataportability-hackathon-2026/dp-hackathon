"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, Suspense } from "react"
import Link from "next/link"
import { useQueryState, parseAsBoolean, parseAsString } from "nuqs"
import { TOPICS, type MockProject, type MockGuideBlock, type MockFile, type MockUpload, type MockMastery, type MockAuditEvent } from "@/lib/topics"
import {
  SiOpenai,
  SiAnthropic,
  SiSlack,
  SiDiscord,
  SiModelcontextprotocol,
  SiMarkdown,
} from "react-icons/si"
import { BsMicrosoftTeams } from "react-icons/bs"
import { siteConfig } from "@/lib/white-label"
import {
  ArrowLeft,
  AudioLines,
  BarChart3,
  Braces,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  AlertCircle,
  ExternalLink,
  FileDown,
  FileText,
  Loader2,
  FlipHorizontal,
  FolderOpen,
  HelpCircle,
  Map,
  Menu,
  MessageSquare,
  Mic,
  MicOff,
  Pencil,
  Phone,
  Plug,
  RefreshCw,
  Presentation,
  Send,
  Shield,
  Box,
  Clapperboard,
  Table2,
  Trash2,
  TrendingUp,
  Globe,
  Upload,
  X,
  Video,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import dynamic from "next/dynamic"
import { ShinyText } from "@/components/reactbits/shiny-text"

const ArtifactCanvas = dynamic(
  () => import("@/components/artifacts/artifact-canvas").then((m) => ({ default: m.ArtifactCanvas })),
  { ssr: false },
)
import { type ArtifactType, artifactTypeFromLabel, getArtifactsByType } from "@/components/artifacts/artifact-store"
import {
  LearningProfileForm,
  MOCK_COMPLETED_PROFILE,
  type LearningProfileData,
} from "@/components/learning-profile-form"
import { ProfileSheetContent } from "@/components/profile-sheet-content"
import {
  LiveKitRoom,
  useVoiceAssistant,
  useConnectionState,
  RoomAudioRenderer,
  useRoomContext,
  useLocalParticipant,
  useTrackTranscription,
} from "@livekit/components-react"
import { ConnectionState, Track } from "livekit-client"
const AgentAudioVisualizerBar = dynamic(
  () => import("@/components/agents-ui/agent-audio-visualizer-bar").then((m) => ({ default: m.AgentAudioVisualizerBar })),
  { ssr: false },
)
const AgentAudioVisualizerAura = dynamic(
  () => import("@/components/agents-ui/agent-audio-visualizer-aura").then((m) => ({ default: m.AgentAudioVisualizerAura })),
  { ssr: false },
)
const AgentAudioVisualizerWave = dynamic(
  () => import("@/components/agents-ui/agent-audio-visualizer-wave").then((m) => ({ default: m.AgentAudioVisualizerWave })),
  { ssr: false },
)
import { useChat } from "@ai-sdk/react"
import type { UIMessage } from "ai"
import { conversationStore, type MessageEntry } from "@/lib/conversation-store"

type VisualizerType = "bars" | "aura" | "wave"

// ── Unified Conversation Store (voice + text in one timeline) ──
// Re-export the legacy TranscriptEntry shape for components that still use it.

type TranscriptEntry = {
  id: string
  role: "user" | "agent"
  text: string
  timestamp: number
  isFinal: boolean
  modality?: "voice" | "text"
}

/** Read-only hook for the full conversation (voice + text). */
function useConversation() {
  return useSyncExternalStore(
    conversationStore.subscribe,
    conversationStore.getSnapshot,
    conversationStore.getSnapshot,
  )
}

/** Legacy alias used by AuditDialog — maps MessageEntry[] → TranscriptEntry[] */
function useVoiceTranscript(): TranscriptEntry[] {
  const entries = useConversation()
  return entries.map((e) => ({
    id: e.id,
    role: e.role === "user" ? "user" : ("agent" as const),
    text: e.text,
    timestamp: e.timestamp,
    isFinal: e.isFinal,
    modality: e.modality,
  }))
}

const MOCK_UPLOADS: MockUpload[] = [
  { id: "u-1", filename: "Linear Algebra Textbook Ch6.pdf", sizeBytes: 8_200_000, progress: 64, status: "uploading" },
  { id: "u-2", filename: "Midterm Review Slides.pptx", sizeBytes: 14_500_000, progress: 38, status: "uploading" },
  { id: "u-3", filename: "Corrupted Notes.pdf", sizeBytes: 1_200_000, progress: 12, status: "error", error: "Upload failed -- file may be corrupted" },
]

const AUDIT_EVENTS: MockAuditEvent[] = [
  {
    id: "ae-1", occurredAt: "2026-03-03T15:00:00Z",
    observe: "Error rate rose from 15% to 40% over sessions 8-10 on eigenvalue items.",
    analyze: "Cognitive load risk increased to 0.68 (confidence: medium). Mastery estimate for eigenvalues dropped from 0.55 to 0.48.",
    act: "Reduced chunk size from 8 to 4 items for eigenvalue practice. Added 2 worked examples before each practice block.",
    summary: "Your recent eigenvalue practice showed increasing difficulty. We've made the practice blocks smaller and added worked examples to help.",
  },
  {
    id: "ae-2", occurredAt: "2026-03-02T10:00:00Z",
    observe: "Calibration data: predicted 80% confidence, scored 55% across 20 items.",
    analyze: "ECE increased to 0.18 (above 0.12 threshold). Brier score: 0.31. Overconfidence pattern confirmed.",
    act: "Inserted prediction-reflection loops every 3rd item. Added confidence calibration exercise to daily guide.",
    summary: "You're tending to overestimate how well you know the material. We've added reflection prompts to help you calibrate.",
  },
  {
    id: "ae-3", occurredAt: "2026-03-01T09:00:00Z",
    observe: "Completed 4 of 5 scheduled blocks this week. Skipped Day 4 metacognition routine.",
    analyze: "Self-regulation risk at 0.35 (low-moderate). Adherence stable at 80%.",
    act: "No policy change -- within acceptable range. Monitoring for decline.",
    summary: "Your attendance is solid at 80%. The system is keeping an eye on it but no changes needed.",
  },
  {
    id: "ae-4", occurredAt: "2026-02-28T14:00:00Z",
    observe: "Cross-concept mastery mean reached 0.52 across 5 concepts with medium+ confidence.",
    analyze: "Interleaving readiness threshold met (mean >= 0.5).",
    act: "Enabled mixed problem types within sessions at 40% interleaving ratio.",
    summary: "You've built enough foundation across concepts to benefit from mixed practice. Sessions now blend different problem types.",
  },
]

function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`
}

const BLOCK_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  core_practice: { label: "Practice", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  metacog_routine: { label: "Metacognition", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
  skill_builder: { label: "Study Skill", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" },
  motivation_support: { label: "Motivation", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
}

// ── Component ──

export function SinglePageApp({ topicId, projectId, isAdmin = false }: { topicId?: string; projectId?: string; isAdmin?: boolean }) {
  const selectedTopicId = topicId ?? "topic-1"
  const selectedProjectId = projectId ?? "proj-1"

  // URL-synced UI state via nuqs
  const [activeTab, setActiveTab] = useQueryState("tab", parseAsString.withDefault("guide"))
  const [agentOpen, setAgentOpen] = useQueryState("agent", parseAsBoolean.withDefault(false))
  const [profileSheetOpen, setProfileSheetOpen] = useQueryState("profile", parseAsBoolean.withDefault(false))
  const [assessmentMode, setAssessmentMode] = useQueryState("assessment", parseAsBoolean.withDefault(false))
  const [artifactParam, setArtifactParam] = useQueryState("artifact", parseAsString.withDefault(""))

  // Local-only state (not worth putting in URL)
  const [voiceMode, setVoiceMode] = useState(true)
  const [scrollToArtifactId, setScrollToArtifactId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<LearningProfileData>(MOCK_COMPLETED_PROFILE)

  // Wrappers for nuqs setters to work with component APIs expecting (boolean) => void
  const handleSetProfileSheetOpen = useCallback((open: boolean) => { void setProfileSheetOpen(open) }, [setProfileSheetOpen])
  const handleSetAgentOpen = useCallback((open: boolean) => { void setAgentOpen(open) }, [setAgentOpen])
  const handleSetAssessmentMode = useCallback((open: boolean) => { void setAssessmentMode(open) }, [setAssessmentMode])

  const activeArtifactType: ArtifactType | null = artifactParam ? (artifactParam as ArtifactType) : null

  const handleOpenArtifactType = useCallback((type: ArtifactType, scrollToId?: string) => {
    void setArtifactParam(type)
    void setActiveTab("")
    setScrollToArtifactId(scrollToId ?? null)
  }, [setArtifactParam, setActiveTab])

  const handleCloseCanvas = useCallback(() => {
    void setArtifactParam(null)
    setScrollToArtifactId(null)
  }, [setArtifactParam])

  // Handle state updates from AI agent tool calls
  const handleAgentStateUpdate = useCallback((payload: StateUpdatePayload) => {
    if (!payload.__stateUpdate) return
    switch (payload.type) {
      case "navigate_to_view":
      case "show_guide":
      case "show_progress":
      case "show_sources":
        if (payload.view) {
          void setActiveTab(payload.view)
          void setArtifactParam(null)
        }
        break
      case "select_topic":
        // Topic switching would need URL navigation in a real app
        // For now we just switch the view
        if (payload.view) void setActiveTab(payload.view)
        break
      case "select_project":
        break
      case "open_artifact":
        if (payload.artifact) {
          void setArtifactParam(payload.artifact)
          void setActiveTab("")
        }
        break
      case "complete_guide_block":
        // Guide block completion is handled via mock data in this prototype
        break
    }
  }, [setActiveTab, setArtifactParam])

  const selectedTopic = TOPICS.find((t) => t.id === selectedTopicId) ?? TOPICS[0]
  const selectedProject =
    selectedTopic.projects.find((p) => p.id === selectedProjectId) ??
    selectedTopic.projects[0]

  return (
    <Suspense fallback={null}>
    <Tabs value={activeTab} onValueChange={(val) => { void setActiveTab(val); void setArtifactParam(null) }} className="flex h-dvh flex-col gap-0 bg-background">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted"
          >
            <Brain className="size-5 text-primary" />
            <span className="text-sm font-semibold">{siteConfig.name}</span>
            {isAdmin && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">ADMIN</Badge>}
          </Link>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <FolderOpen className="size-3.5" />
            <span className="hidden sm:inline">{selectedTopic.name}</span>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">{selectedProject.name}</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {/* Desktop: Nav + Connect + Audit + User */}
            <div className="hidden items-center gap-2 lg:flex">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="guide" className="gap-1.5 px-3 text-sm">
                  <Calendar className="size-3.5" />
                  Guide
                </TabsTrigger>
                <TabsTrigger value="sources" className="gap-1.5 px-3 text-sm">
                  <FileText className="size-3.5" />
                  Sources
                </TabsTrigger>
                <TabsTrigger value="progress" className="gap-1.5 px-3 text-sm">
                  <TrendingUp className="size-3.5" />
                  Progress
                </TabsTrigger>
              </TabsList>
              <ConnectDialog />
              <AuditDialog />
              <Sheet open={profileSheetOpen} onOpenChange={handleSetProfileSheetOpen}>
                <SheetTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1.5 transition-colors hover:bg-muted"
                    />
                  }
                >
                  <Avatar size="sm">
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg">
                  <ProfileSheetContent onRetakeAssessment={() => { handleSetAssessmentMode(true); handleSetProfileSheetOpen(false) }} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile: Agent toggle */}
            <Button
              variant={agentOpen ? "default" : "ghost"}
              size="icon-sm"
              className="lg:hidden"
              onClick={() => handleSetAgentOpen(!agentOpen)}
            >
              <MessageSquare className="size-4" />
            </Button>

            {/* Mobile: Hamburger menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="lg:hidden" />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-4">
                  {/* Mobile nav - uses regular buttons to avoid duplicate TabsList conflicts */}
                  <div className="flex w-full rounded-4xl border bg-muted/50 p-0.5">
                    {([
                      { value: "guide", label: "Guide", icon: Calendar },
                      { value: "sources", label: "Sources", icon: FileText },
                      { value: "progress", label: "Progress", icon: TrendingUp },
                    ] as const).map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => { void setActiveTab(tab.value); void setArtifactParam(null); setMobileMenuOpen(false) }}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeTab === tab.value
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="size-3.5" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <ConnectDialog />
                    <AuditDialog />
                  </div>

                  <Separator />

                  <Sheet open={profileSheetOpen} onOpenChange={handleSetProfileSheetOpen}>
                    <SheetTrigger
                      render={
                        <button
                          type="button"
                          className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted"
                        />
                      }
                    >
                      <Avatar size="sm">
                        <AvatarFallback>MC</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">Maya Chen</span>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-lg">
                      <ProfileSheetContent onRetakeAssessment={() => { handleSetAssessmentMode(true); handleSetProfileSheetOpen(false); setMobileMenuOpen(false) }} />
                    </SheetContent>
                  </Sheet>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {assessmentMode && (
          <LearningProfileForm
            initialData={userProfile}
            onSave={(profileData) => setUserProfile(profileData)}
            onCancel={() => handleSetAssessmentMode(false)}
          />
        )}

        <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Create artifacts */}
              <aside className="hidden w-48 shrink-0 border-r lg:flex lg:flex-col">
                <div className="flex-1 overflow-y-auto p-3">
                  <ArtifactGrid onOpenType={handleOpenArtifactType} activeType={activeArtifactType} />
                </div>
              </aside>

              {/* Main Content */}
              <main className="relative flex-1 overflow-hidden">
                {activeArtifactType ? (
                  <ArtifactCanvas
                    activeType={activeArtifactType}
                    scrollToId={scrollToArtifactId}
                    onClose={handleCloseCanvas}
                  />
                ) : (
                  <div className="h-full overflow-y-auto">
                    <TabsContent value="guide" className="p-4 sm:p-6">
                      <GuideTab blocks={selectedTopic.guideBlocks} />
                    </TabsContent>

                    <TabsContent value="sources" className="p-4 sm:p-6">
                      <SourcesTab files={selectedTopic.files} />
                    </TabsContent>

                    <TabsContent value="progress" className="p-4 sm:p-6">
                      <ProgressTab mastery={selectedTopic.masteryData} project={selectedProject} />
                    </TabsContent>
                  </div>
                )}
              </main>

          {/* Agent Right Sidebar - Desktop: always visible, Mobile: toggleable */}
        <aside
          className={`flex w-full flex-col overflow-hidden border-l lg:w-96 lg:shrink-0 ${
            agentOpen ? "fixed inset-0 top-14 z-30 bg-background lg:static lg:z-auto" : "hidden lg:flex"
          }`}
        >
          <div className="flex h-10 shrink-0 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Agent</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center rounded-4xl border bg-muted/50 p-0.5">
                <button
                  type="button"
                  onClick={() => setVoiceMode(true)}
                  className={`flex items-center gap-1.5 rounded-4xl px-3 py-1 text-sm font-medium transition-colors ${
                    voiceMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <Mic className="size-3.5" />
                  <span className="hidden sm:inline">Voice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceMode(false)}
                  className={`flex items-center gap-1.5 rounded-4xl px-3 py-1 text-sm font-medium transition-colors ${
                    !voiceMode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="size-3.5" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                className="lg:hidden"
                onClick={() => handleSetAgentOpen(false)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          {voiceMode ? (
            <VoiceAgent onSwitchToText={() => setVoiceMode(false)} />
          ) : (
            <AgentTab
              onOpenArtifact={handleOpenArtifactType}
              onStateUpdate={handleAgentStateUpdate}
            />
          )}
        </aside>
      </div>
    </Tabs>
    </Suspense>
  )
}

// ── Agent Tab ──

// ── Audit Dialog ──

function AuditDialog() {
  const [auditTab, setAuditTab] = useState<"trail" | "transcript">("trail")
  const transcript = useVoiceTranscript()

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" />
        }
      >
        <Shield className="size-4" data-icon="inline-start" />
        Audit
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Audit Trail</DialogTitle>
          <DialogDescription>
            Observe &rarr; Analyze &rarr; Act chain for every adaptation
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-1 border-b pb-2 -mx-6 px-6">
          <button
            type="button"
            onClick={() => setAuditTab("trail")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              auditTab === "trail"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Shield className="mr-1.5 inline size-3.5" />
            Audit Trail
          </button>
          <button
            type="button"
            onClick={() => setAuditTab("transcript")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              auditTab === "transcript"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Mic className="mr-1.5 inline size-3.5" />
            Voice Transcript
            {transcript.length > 0 && (
              <span className="ml-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px]">
                {transcript.length}
              </span>
            )}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto -mx-6 px-6">
          {auditTab === "trail" ? (
            <AuditTab events={AUDIT_EVENTS} />
          ) : (
            <VoiceTranscriptTab entries={transcript} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function VoiceTranscriptTab({ entries }: { entries: TranscriptEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Mic className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No conversation yet</p>
          <p className="text-xs text-muted-foreground">
            Start a voice or text session to see the conversation here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl py-2">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {entries.length} transcript segment{entries.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => conversationStore.clear()}
          className="text-xs text-muted-foreground"
        >
          <Trash2 className="mr-1 size-3" />
          Clear
        </Button>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex gap-3 ${entry.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {entry.role === "user" ? "You" : "AI"}
            </div>
            <div className="flex flex-col gap-0.5 max-w-[80%]">
              {entry.modality && (
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-0.5">
                  {entry.modality === "text" ? <MessageSquare className="size-2" /> : <Mic className="size-2" />}
                  {entry.modality}
                </span>
              )}
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  entry.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                } ${!entry.isFinal ? "opacity-60 italic" : ""}`}
              >
                {entry.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Connect Dialog ──

const MOCK_MCP_URL = siteConfig.mcpBaseUrl
const MOCK_API_URL = siteConfig.apiBaseUrl

type IntegrationKey = "chatgpt" | "claude" | "slack" | "teams" | "discord" | "mcp"

const CONNECT_INTEGRATIONS: {
  key: IntegrationKey
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  connected: boolean
}[] = [
  { key: "chatgpt", label: "ChatGPT", icon: SiOpenai, description: "Connect via MCP Connector", connected: false },
  { key: "claude", label: "Claude", icon: SiAnthropic, description: "Connect via Claude Desktop MCP", connected: true },
  { key: "slack", label: "Slack", icon: SiSlack, description: "Post updates to Slack channels", connected: false },
  { key: "teams", label: "Teams", icon: BsMicrosoftTeams, description: "Sync with Microsoft Teams", connected: false },
  { key: "discord", label: "Discord", icon: SiDiscord, description: "Share progress to Discord", connected: false },
  { key: "mcp", label: "MCP", icon: SiModelcontextprotocol, description: "Model Context Protocol server", connected: true },
]

const EXPORT_FORMATS = [
  { label: "PDF", icon: FileDown, description: "Export as .pdf report" },
  { label: "Markdown", icon: SiMarkdown, description: "Export as .md files" },
  { label: "JSON", icon: Braces, description: "Export as .json data" },
] as const

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-muted"
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-lg border bg-muted/50 p-3">
      <div className="absolute top-2 right-2">
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto text-xs leading-relaxed whitespace-pre-wrap pr-16"><code>{code}</code></pre>
    </div>
  )
}

function IntegrationContent({ integration }: { integration: IntegrationKey }) {
  switch (integration) {
    case "chatgpt":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Connect {siteConfig.name} to ChatGPT as an MCP Connector for real-time access to your learning data.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Setup via MCP Connector</p>
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">1.</span> Open <span className="font-medium">ChatGPT</span> &rarr; Settings &rarr; <span className="font-medium">Apps &amp; Connectors</span></li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">2.</span> Scroll to <span className="font-medium">Advanced settings</span> and enable <span className="font-medium">Developer mode</span></li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">3.</span> Go to <span className="font-medium">Connectors</span> &rarr; <span className="font-medium">Create</span></li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">4.</span> Fill in the connector details:</li>
            </ol>
            <CodeBlock code={`Connector name: ${siteConfig.name}\nDescription: Access learning data, mastery levels, and study guides\nConnector URL: ${MOCK_MCP_URL.replace("/sse", "/mcp")}`} />
            <ol start={5} className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">5.</span> Verify the connection &mdash; you should see the advertised tools</li>
            </ol>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Using Your Connector</p>
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">1.</span> Open a new ChatGPT conversation</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">2.</span> Click the <span className="font-medium">+</span> button near the message composer &rarr; <span className="font-medium">More</span></li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">3.</span> Select <span className="font-medium">{siteConfig.name}</span> from available tools</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">4.</span> Ask: &ldquo;What are my current mastery levels?&rdquo;</li>
            </ol>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Requirements</p>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> ChatGPT Pro, Team, Enterprise, or Edu plan</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> Developer mode enabled</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> HTTPS endpoint (provided by {siteConfig.name})</li>
            </ul>
          </div>
        </div>
      )
    case "claude":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Connect {siteConfig.name} to Claude Desktop via MCP (Model Context Protocol) for real-time access to your learning data.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Option 1: Local MCP Server</p>
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">1.</span> Open <span className="font-medium">Claude Desktop</span> menu &rarr; <span className="font-medium">Settings</span></li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">2.</span> Navigate to <span className="font-medium">Developer</span> tab &rarr; click <span className="font-medium">Edit Config</span></li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">3.</span> Add the {siteConfig.name} server to your <code className="rounded bg-muted px-1 text-xs">claude_desktop_config.json</code>:</li>
            </ol>
            <CodeBlock code={JSON.stringify({
              mcpServers: {
                coremodel: {
                  command: "npx",
                  args: ["-y", "@coremodel/mcp-server"],
                  env: {
                    COREMODEL_API_KEY: "dl_sk_live_xxxxxxxxxxxxxxxxxxxx"
                  }
                }
              }
            }, null, 2)} />
            <ol start={4} className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">4.</span> Completely quit and restart Claude Desktop</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">5.</span> Look for the MCP server indicator in the bottom-right of the input box</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">6.</span> Click it to verify <Badge variant="secondary" className="text-xs">{siteConfig.name}</Badge> tools are available</li>
            </ol>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Option 2: Remote MCP Server</p>
            <p className="text-sm text-muted-foreground">Connect to the hosted {siteConfig.name} MCP server instead of running locally:</p>
            <CodeBlock code={JSON.stringify({
              mcpServers: {
                coremodel: {
                  url: MOCK_MCP_URL.replace("/sse", "/mcp"),
                  headers: {
                    Authorization: "Bearer dl_sk_live_xxxxxxxxxxxxxxxxxxxx"
                  }
                }
              }
            }, null, 2)} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Available Tools</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["get_mastery", "get_guide", "get_topics", "get_progress", "create_quiz", "log_session"].map((tool) => (
                <div key={tool} className="flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-mono">
                  <Braces className="size-3 text-muted-foreground" />
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case "slack":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Get daily study reminders and progress summaries posted to a Slack channel.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Setup via Slack App</p>
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">1.</span> Click the button below to install the {siteConfig.name} Slack app:</li>
            </ol>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-lg border bg-[#4A154B] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <SiSlack className="size-4" />
              Add to Slack
              <ExternalLink className="size-3" />
            </button>
            <ol start={2} className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">2.</span> Authorize {siteConfig.name} to post to your chosen channel</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">3.</span> Configure notifications in {siteConfig.name} settings</li>
            </ol>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Alternative: Incoming Webhook</p>
            <p className="text-sm text-muted-foreground">Use a Slack incoming webhook for custom integrations:</p>
            <CodeBlock code={`Webhook URL: ${MOCK_API_URL}/webhooks/slack\n\n# Or configure your own webhook:\ncurl -X POST ${MOCK_API_URL}/integrations/slack \\\n  -H "Authorization: Bearer dl_sk_live_xxxx" \\\n  -d '{"webhook_url": "https://hooks.slack.com/services/T.../B.../xxx"}'`} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">What gets posted</p>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> Daily study reminders at your preferred time</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> Weekly progress summaries</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> Mastery milestone celebrations</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 text-green-500 shrink-0" /> Guide adjustments and recommendations</li>
            </ul>
          </div>
        </div>
      )
    case "teams":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Sync {siteConfig.name} with Microsoft Teams for study reminders and progress updates.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Install Teams App</p>
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">1.</span> Open <span className="font-medium">Microsoft Teams</span> &rarr; Apps &rarr; Search &ldquo;{siteConfig.name}&rdquo;</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">2.</span> Click <span className="font-medium">Add</span> and authorize the connection</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">3.</span> Choose which channel receives updates</li>
            </ol>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Alternative: Webhook Connector</p>
            <p className="text-sm text-muted-foreground">Use a Teams incoming webhook for custom setups:</p>
            <CodeBlock code={`# 1. In Teams, right-click channel → Connectors → Incoming Webhook\n# 2. Copy the webhook URL, then configure:\n\ncurl -X POST ${MOCK_API_URL}/integrations/teams \\\n  -H "Authorization: Bearer dl_sk_live_xxxx" \\\n  -d '{\n    "webhook_url": "https://outlook.office.com/webhook/...",\n    "notifications": ["daily_reminder", "weekly_summary"]\n  }'`} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Adaptive Card Preview</p>
            <div className="rounded-lg border p-3 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="size-4 text-primary" />
                <span className="font-semibold">{siteConfig.name} Daily Summary</span>
              </div>
              <div className="flex flex-col gap-1 text-muted-foreground">
                <p>Mastery: Linear Algebra — <span className="text-foreground font-medium">55%</span></p>
                <p>Today&apos;s guide: 45 min planned</p>
                <p>Streak: 5 days</p>
              </div>
            </div>
          </div>
        </div>
      )
    case "discord":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Share your learning progress to a Discord server with a bot or webhook.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Option 1: Discord Bot</p>
            <ol className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">1.</span> Click the button below to add the {siteConfig.name} bot:</li>
            </ol>
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-lg border bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <SiDiscord className="size-4" />
              Add to Discord
              <ExternalLink className="size-3" />
            </button>
            <ol start={2} className="flex flex-col gap-2 text-sm">
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">2.</span> Select your server and authorize permissions</li>
              <li className="flex gap-2"><span className="font-medium text-muted-foreground">3.</span> Use <code className="rounded bg-muted px-1 text-xs">/coremodel setup #channel</code> to configure</li>
            </ol>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Option 2: Webhook</p>
            <p className="text-sm text-muted-foreground">For simpler setups, use a Discord webhook:</p>
            <CodeBlock code={`# 1. In Discord: Server Settings → Integrations → Webhooks → New\n# 2. Copy the webhook URL, then configure:\n\ncurl -X POST ${MOCK_API_URL}/integrations/discord \\\n  -H "Authorization: Bearer dl_sk_live_xxxx" \\\n  -d '{\n    "webhook_url": "https://discord.com/api/webhooks/...",\n    "events": ["progress", "milestones", "reminders"]\n  }'`} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Bot Commands</p>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { cmd: "/coremodel status", desc: "View current mastery levels" },
                { cmd: "/coremodel guide", desc: "Get today's study plan" },
                { cmd: "/coremodel quiz", desc: "Start a quick quiz" },
                { cmd: "/coremodel streak", desc: "Check your study streak" },
              ].map((item) => (
                <div key={item.cmd} className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
                  <code className="font-mono font-medium">{item.cmd}</code>
                  <span className="text-muted-foreground">— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    case "mcp":
      return (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Connect any MCP-compatible client to the {siteConfig.name} server for programmatic access to your learning data.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Server Endpoint</p>
            <CodeBlock code={MOCK_MCP_URL} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Authentication</p>
            <CodeBlock code={`Authorization: Bearer dl_sk_live_xxxxxxxxxxxxxxxxxxxx`} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Generic MCP Client Config</p>
            <CodeBlock code={JSON.stringify({
              mcpServers: {
                coremodel: {
                  url: MOCK_MCP_URL,
                  headers: {
                    Authorization: "Bearer dl_sk_live_xxxxxxxxxxxxxxxxxxxx"
                  }
                }
              }
            }, null, 2)} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">NPX Local Server</p>
            <p className="text-sm text-muted-foreground">Run the MCP server locally for development or offline use:</p>
            <CodeBlock code={`npx @coremodel/mcp-server --api-key dl_sk_live_xxxx`} />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Available Resources & Tools</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                "coremodel://topics",
                "coremodel://mastery",
                "coremodel://guide",
                "coremodel://progress",
                "create_quiz",
                "log_session",
                "get_recommendations",
                "update_schedule",
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-mono">
                  {item.startsWith("coremodel://") ? (
                    <FolderOpen className="size-3 text-muted-foreground shrink-0" />
                  ) : (
                    <Braces className="size-3 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
  }
}

function buildAppStateForExport() {
  const topic = TOPICS[0]
  const project = topic.projects[0]
  return {
    exportedAt: new Date().toISOString(),
    topic: {
      name: topic.name,
      domain: topic.domain,
      fileCount: topic.fileCount,
    },
    project: {
      name: project.name,
      goalType: project.goalType,
      mastery: project.mastery,
      masteryUncertainty: project.masteryUncertainty,
      minutesPerDay: project.minutesPerDay,
      daysPerWeek: project.daysPerWeek,
      deadline: project.deadline,
    },
    masteryData: topic.masteryData.map((m) => ({
      concept: m.concept,
      posteriorMean: m.posteriorMean,
      posteriorSd: m.posteriorSd,
      credibleInterval: [m.credibleLow, m.credibleHigh],
    })),
    guideBlocks: topic.guideBlocks.map((b) => ({
      day: b.dayIndex,
      type: b.blockType,
      minutes: b.plannedMinutes,
      description: b.description,
      completed: b.completed,
    })),
    chatHistory: topic.chatHistory.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
    })),
    files: topic.files.map((f) => ({
      filename: f.filename,
      mimeType: f.mimeType,
      sizeBytes: f.sizeBytes,
      uploadedAt: f.uploadedAt,
      scope: f.scope,
    })),
    auditEvents: AUDIT_EVENTS.map((e) => ({
      occurredAt: e.occurredAt,
      observe: e.observe,
      analyze: e.analyze,
      act: e.act,
      summary: e.summary,
    })),
  }
}


function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function generatePdfHtml(): string {
  const state = buildAppStateForExport()
  const masteryRows = state.masteryData
    .map(
      (m) =>
        `<tr><td>${m.concept}</td><td>${Math.round(m.posteriorMean * 100)}%</td><td>\u00b1${Math.round(m.posteriorSd * 100)}%</td><td>${Math.round(m.credibleInterval[0] * 100)}%–${Math.round(m.credibleInterval[1] * 100)}%</td></tr>`
    )
    .join("")

  let guideHtml = ""
  let currentDay = 0
  for (const b of state.guideBlocks) {
    if (b.day !== currentDay) {
      if (currentDay !== 0) guideHtml += "</ul>"
      currentDay = b.day
      guideHtml += `<h3>Day ${b.day}</h3><ul>`
    }
    guideHtml += `<li>${b.completed ? "\u2705" : "\u2B1C"} <strong>${b.type}</strong> (${b.minutes} min) &mdash; ${b.description}</li>`
  }
  guideHtml += "</ul>"

  const chatHtml = state.chatHistory
    .map(
      (msg) =>
        `<div style="margin-bottom:12px;"><strong>${msg.role === "user" ? "You" : siteConfig.name}</strong> <em>(${new Date(msg.timestamp).toLocaleString()})</em><blockquote style="margin:4px 0 0 0;padding-left:12px;border-left:3px solid #ddd;color:#555;">${msg.content}</blockquote></div>`
    )
    .join("")

  const filesRows = state.files
    .map((f) => {
      const size = f.sizeBytes >= 1_000_000 ? `${(f.sizeBytes / 1_000_000).toFixed(1)} MB` : `${(f.sizeBytes / 1_000).toFixed(1)} KB`
      return `<tr><td>${f.filename}</td><td>${size}</td><td>${f.uploadedAt}</td><td>${f.scope}</td></tr>`
    })
    .join("")

  const auditHtml = state.auditEvents
    .map(
      (e) =>
        `<div style="margin-bottom:16px;border-left:3px solid #6366f1;padding-left:12px;"><strong>${new Date(e.occurredAt).toLocaleString()}</strong><br/><em>Observe:</em> ${e.observe}<br/><em>Analyze:</em> ${e.analyze}<br/><em>Act:</em> ${e.act}<br/><em>Summary:</em> ${e.summary}</div>`
    )
    .join("")

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${siteConfig.name} Export — ${state.topic.name}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#1a1a1a;font-size:14px;line-height:1.6;}
  h1{font-size:24px;border-bottom:2px solid #6366f1;padding-bottom:8px;}
  h2{font-size:18px;margin-top:32px;color:#6366f1;}
  h3{font-size:15px;margin-top:16px;}
  table{width:100%;border-collapse:collapse;margin:12px 0;}
  th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px;}
  th{background:#f5f5f5;font-weight:600;}
  ul{padding-left:20px;}
  li{margin-bottom:4px;}
  .meta{color:#666;font-size:13px;}
  @media print{body{padding:0;}}
</style></head><body>
<h1>${siteConfig.name} Export — ${state.topic.name}</h1>
<p class="meta">Exported: ${new Date(state.exportedAt).toLocaleString()} | Domain: ${state.topic.domain} | Sources: ${state.topic.fileCount}</p>

<h2>Project: ${state.project.name}</h2>
<table><tr><th>Goal Type</th><th>Mastery</th><th>Schedule</th><th>Deadline</th></tr>
<tr><td>${state.project.goalType}</td><td>${Math.round(state.project.mastery * 100)}% (\u00b1${Math.round(state.project.masteryUncertainty * 100)}%)</td><td>${state.project.minutesPerDay} min/day, ${state.project.daysPerWeek} days/week</td><td>${state.project.deadline || "None"}</td></tr></table>

<h2>Mastery Levels</h2>
<table><tr><th>Concept</th><th>Mean</th><th>SD</th><th>90% CI</th></tr>${masteryRows}</table>

<h2>7-Day Study Guide</h2>
${guideHtml}

<h2>Chat History</h2>
${chatHtml}

<h2>Sources</h2>
<table><tr><th>Filename</th><th>Size</th><th>Uploaded</th><th>Scope</th></tr>${filesRows}</table>

<h2>Audit Log</h2>
${auditHtml}

</body></html>`
}

async function exportPdf(): Promise<void> {
  const html = generatePdfHtml()
  const container = document.createElement("div")
  container.innerHTML = html
  container.style.position = "fixed"
  container.style.left = "-9999px"
  document.body.appendChild(container)
  const html2pdf = (await import("html2pdf.js")).default
  await html2pdf()
    .set({
      margin: [10, 10],
      filename: "coremodel-export.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .from(container)
    .save()
  document.body.removeChild(container)
}

async function exportMarkdownViaAI(): Promise<void> {
  const state = buildAppStateForExport()
  const response = await fetch("/api/export-markdown", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  })
  const { markdown } = await response.json()
  downloadFile(markdown, "coremodel-export.md", "text/markdown")
}

function exportJson() {
  const data = buildAppStateForExport()
  downloadFile(JSON.stringify(data, null, 2), "coremodel-export.json", "application/json")
}

function ConnectDialog() {
  const optId = useId()
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationKey | null>(null)
  const [exportingMarkdown, setExportingMarkdown] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const selectedInfo = selectedIntegration
    ? CONNECT_INTEGRATIONS.find((i) => i.key === selectedIntegration)
    : null

  return (
    <Dialog onOpenChange={(open) => { if (!open) setSelectedIntegration(null) }}>
      <DialogTrigger
        render={
          <Button variant="ghost" />
        }
      >
        <Plug className="size-4" data-icon="inline-start" />
        Connect
      </DialogTrigger>
      <DialogContent className={selectedIntegration ? "sm:max-w-xl" : ""}>
        <DialogHeader>
          {selectedIntegration && selectedInfo ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIntegration(null)}
                  className="rounded-md p-1 transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <DialogTitle className="flex items-center gap-2">
                  <selectedInfo.icon className="size-5" />
                  Connect {selectedInfo.label}
                </DialogTitle>
              </div>
              <DialogDescription>
                {selectedInfo.description}
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle>Connect</DialogTitle>
              <DialogDescription>
                Link external services and export your data
              </DialogDescription>
            </>
          )}
        </DialogHeader>

        {selectedIntegration ? (
          <ScrollArea className="max-h-[60vh]">
            <IntegrationContent integration={selectedIntegration} />
          </ScrollArea>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {CONNECT_INTEGRATIONS.map((opt) => {
                const Icon = opt.icon
                return (
                  <button
                    type="button"
                    key={`${optId}-${opt.label}`}
                    onClick={() => setSelectedIntegration(opt.key)}
                    className={`group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors ${
                      opt.connected
                        ? "border-primary/30 bg-primary/5"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className={`size-6 ${opt.connected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-xs font-medium">{opt.label}</span>
                    {opt.connected && (
                      <span className="absolute top-2 right-2 size-2 rounded-full bg-green-500" />
                    )}
                  </button>
                )
              })}
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                Export
              </p>
              <div className="flex gap-2">
                {EXPORT_FORMATS.map((fmt) => {
                  const Icon = fmt.icon
                  const isPdf = fmt.label === "PDF"
                  const isMarkdown = fmt.label === "Markdown"
                  const isLoading = (isMarkdown && exportingMarkdown) || (isPdf && exportingPdf)
                  return (
                    <button
                      type="button"
                      key={`${optId}-export-${fmt.label}`}
                      disabled={isLoading}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={async () => {
                        if (fmt.label === "PDF") {
                          setExportingPdf(true)
                          try {
                            await exportPdf()
                          } finally {
                            setExportingPdf(false)
                          }
                        } else if (fmt.label === "Markdown") {
                          setExportingMarkdown(true)
                          try {
                            await exportMarkdownViaAI()
                          } finally {
                            setExportingMarkdown(false)
                          }
                        }
                        else if (fmt.label === "JSON") exportJson()
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="size-6 animate-spin text-muted-foreground" />
                      ) : (
                        <Icon className="size-6 text-muted-foreground" />
                      )}
                      <span className="text-xs font-medium">
                        {isLoading ? "Generating..." : fmt.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <label className="mt-3 flex items-center gap-2 cursor-pointer">
                <Checkbox />
                <span className="text-xs text-muted-foreground">
                  Include advanced metadata
                </span>
              </label>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ── Voice Agent ──

type LiveKitConnection = {
  token: string
  wsUrl: string
  roomName: string
}

function VoiceAgentUI({
  onDisconnect,
}: {
  onDisconnect: () => void
}) {
  const { state: agentState, audioTrack, agentTranscriptions } = useVoiceAssistant()
  const connectionState = useConnectionState()
  const room = useRoomContext()
  const [isMuted, setIsMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [visualizer, setVisualizer] = useState<VisualizerType>("bars")
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  // Get local participant mic track for user transcriptions
  const { microphoneTrack, localParticipant } = useLocalParticipant()
  const localTrackRef = microphoneTrack
    ? { participant: localParticipant, publication: microphoneTrack, source: Track.Source.Microphone }
    : undefined
  const { segments: userSegments } = useTrackTranscription(localTrackRef)

  const [textInput, setTextInput] = useState("")

  // Build merged transcript entries from voice segments
  const transcriptEntries = useMemo(() => {
    const entries: MessageEntry[] = []
    for (const seg of agentTranscriptions) {
      entries.push({
        id: `agent-${seg.id}`,
        role: "assistant",
        text: seg.text,
        timestamp: seg.firstReceivedTime,
        modality: "voice",
        isFinal: seg.final,
      })
    }
    for (const seg of userSegments) {
      entries.push({
        id: `user-${seg.id}`,
        role: "user",
        text: seg.text,
        timestamp: seg.firstReceivedTime,
        modality: "voice",
        isFinal: seg.final,
      })
    }
    entries.sort((a, b) => a.timestamp - b.timestamp)
    return entries
  }, [agentTranscriptions, userSegments])

  // Sync voice transcripts into the unified conversation store
  useEffect(() => {
    conversationStore.merge(transcriptEntries)
  }, [transcriptEntries])

  // Read the full conversation (voice + any text messages sent during voice mode)
  const allEntries = useConversation()

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcriptEntries])

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const toggleMute = useCallback(() => {
    if (room?.localParticipant) {
      const next = !isMuted
      room.localParticipant.setMicrophoneEnabled(!next)
      setIsMuted(next)
    }
  }, [room, isMuted])

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  const statusText = (() => {
    if (connectionState !== ConnectionState.Connected) return "Connecting..."
    switch (agentState) {
      case "speaking":
        return "Agent is speaking..."
      case "thinking":
        return "Thinking..."
      case "listening":
        return "Listening..."
      default:
        return "Connecting to agent..."
    }
  })()

  const isSpeaking = agentState === "speaking"

  return (
    <div className="flex flex-1 flex-col items-center justify-between overflow-hidden">
      {/* Status */}
      <div className="flex flex-col items-center gap-1 pt-6">
        <span className="text-xs text-muted-foreground">{statusText}</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Main content: visualizer or transcript */}
      {showTranscript ? (
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-2">
            {allEntries.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-muted-foreground">
                  Transcriptions will appear here...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {allEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex flex-col gap-0.5 ${
                      entry.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      {entry.modality === "text" ? (
                        <MessageSquare className="size-2.5" />
                      ) : (
                        <Mic className="size-2.5" />
                      )}
                      {entry.role === "user" ? "You" : "Agent"}
                    </span>
                    <p
                      className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm ${
                        entry.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      } ${!entry.isFinal ? "opacity-60" : ""}`}
                    >
                      {entry.text}
                    </p>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Audio visualization */}
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            {visualizer === "aura" ? (
              <AgentAudioVisualizerAura
                state={agentState}
                audioTrack={audioTrack}
                size="lg"
                themeMode="dark"
                color="#FFFFFF"
                colorShift={0}
                style={{ width: 280, height: 280 }}
                className="!aspect-auto"
              />
            ) : visualizer === "wave" ? (
              <AgentAudioVisualizerWave
                state={agentState}
                audioTrack={audioTrack}
                size="lg"
                color="#FFFFFF"
                colorShift={0}
                style={{ width: 280, height: 280 }}
                className="!aspect-auto"
              />
            ) : (
              <AgentAudioVisualizerBar
                state={agentState}
                audioTrack={audioTrack}
                barCount={5}
                size="lg"
              />
            )}
          </div>

          {/* Visualizer picker + avatar */}
          <div className="flex flex-col items-center gap-2 pb-4">
            <div className="flex items-center gap-1 rounded-full border bg-muted/50 p-0.5">
              {(["bars", "wave", "aura"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisualizer(v)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                    visualizer === v
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Avatar
              size="lg"
              className={
                isSpeaking
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : ""
              }
            >
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">Learning Agent</span>
          </div>
        </>
      )}

      {/* Text input during voice mode */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const msg = textInput.trim()
          if (!msg) return
          // Add to unified conversation store
          conversationStore.addMessage({
            id: `text-${Date.now()}`,
            role: "user",
            text: msg,
            timestamp: Date.now(),
            modality: "text",
            isFinal: true,
          })
          // Send to voice agent via LiveKit data channel
          if (room?.localParticipant) {
            const encoder = new TextEncoder()
            const payload = JSON.stringify({ type: "text_input", text: msg })
            room.localParticipant.publishData(encoder.encode(payload), { reliable: true })
          }
          setTextInput("")
          if (!showTranscript) setShowTranscript(true)
        }}
        className="shrink-0 border-t px-3 py-2"
      >
        <div className="flex gap-2">
          <Input
            placeholder="Type a message while in voice mode..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="h-8 text-sm"
          />
          <Button type="submit" size="icon-xs" disabled={!textInput.trim()}>
            <Send className="size-3.5" />
          </Button>
        </div>
      </form>

      {/* Controls */}
      <div className="flex shrink-0 items-center justify-center gap-3 border-t p-4 pb-6">
        <Button
          variant={showTranscript ? "secondary" : "outline"}
          size="icon"
          onClick={() => setShowTranscript((v) => !v)}
          title="Toggle transcript"
        >
          <FileText className="size-4" />
        </Button>
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          onClick={toggleMute}
        >
          {isMuted ? (
            <MicOff className="size-4" />
          ) : (
            <Mic className="size-4" />
          )}
        </Button>
        <Button
          variant={
            connectionState === ConnectionState.Connected
              ? "default"
              : "outline"
          }
          size="icon-lg"
          className={isSpeaking ? "animate-pulse" : ""}
          disabled
        >
          <Mic className="size-5" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={onDisconnect}
        >
          <Phone className="size-4" />
        </Button>
      </div>
      <RoomAudioRenderer />
    </div>
  )
}

function VoiceAgent({ onSwitchToText }: { onSwitchToText: () => void }) {
  const [micAccess, setMicAccess] = useState<
    "pending" | "granted" | "denied"
  >("pending")
  const [requesting, setRequesting] = useState(false)
  const [connection, setConnection] = useState<LiveKitConnection | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const fetchingRef = useRef(false)

  const requestMic = () => {
    setRequesting(true)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop())
        setMicAccess("granted")
      })
      .catch(() => setMicAccess("denied"))
      .finally(() => setRequesting(false))
  }

  useEffect(() => {
    requestMic()
  }, [])

  // Fetch token once mic is granted
  useEffect(() => {
    if (micAccess !== "granted" || connection || fetchingRef.current) return
    fetchingRef.current = true
    fetch("/api/livekit-token", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to get token: ${res.status}`)
        return res.json()
      })
      .then((data: LiveKitConnection) => {
        setConnection(data)
      })
      .catch((err: unknown) => {
        setTokenError(err instanceof Error ? err.message : "Connection failed")
        fetchingRef.current = false
      })
  }, [micAccess, connection])

  const handleDisconnect = useCallback(() => {
    setConnection(null)
    onSwitchToText()
  }, [onSwitchToText])

  if (micAccess !== "granted") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <MicOff className="size-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">
            {micAccess === "pending"
              ? "Requesting microphone access..."
              : "Microphone access required"}
          </p>
          <p className="text-xs text-muted-foreground">
            {micAccess === "pending"
              ? "Please allow access in the browser prompt"
              : "Allow microphone access to use voice mode"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={requestMic}
            disabled={requesting}
          >
            <RefreshCw
              className={`size-3.5 ${requesting ? "animate-spin" : ""}`}
              data-icon="inline-start"
            />
            {requesting ? "Requesting..." : "Retry"}
          </Button>
          <Button size="sm" variant="outline" onClick={onSwitchToText}>
            Switch to text
          </Button>
        </div>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <Phone className="size-7 text-destructive" />
        </div>
        <p className="text-sm font-medium">Connection failed</p>
        <p className="text-xs text-muted-foreground">{tokenError}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTokenError(null)
              setConnection(null)
            }}
          >
            <RefreshCw className="size-3.5" data-icon="inline-start" />
            Retry
          </Button>
          <Button size="sm" variant="outline" onClick={onSwitchToText}>
            Switch to text
          </Button>
        </div>
      </div>
    )
  }

  if (!connection) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Connecting to voice agent...
        </p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={connection.token}
      serverUrl={connection.wsUrl}
      connect={true}
      audio={true}
      className="flex flex-1 flex-col overflow-hidden"
      onDisconnected={handleDisconnect}
    >
      <VoiceAgentUI
        onDisconnect={handleDisconnect}
      />
    </LiveKitRoom>
  )
}

// ── Agent Chat Tab ──

const TOOL_TYPE_TO_ARTIFACT: Record<string, ArtifactType> = {
  create_quiz: "quiz",
  create_flashcards: "flashcards",
  create_mind_map: "mindmap",
  create_slides: "slidedeck",
  create_spatial: "spatial",
  create_learning_guide: "report",
}

const TOOL_LABELS: Record<string, string> = {
  create_quiz: "View Quiz",
  create_flashcards: "View Flashcards",
  create_mind_map: "View Mind Map",
  create_slides: "View Slides",
  create_spatial: "View 3D Model",
  create_learning_guide: "View Learning Guide",
  navigate_to_view: "Navigating...",
  select_topic: "Switching topic...",
  select_project: "Switching project...",
  show_guide: "Opening guide...",
  show_progress: "Opening progress...",
  show_sources: "Opening sources...",
  complete_guide_block: "Marking complete...",
  open_artifact: "Opening artifact...",
  get_current_state: "Reading state...",
}

const STATE_TOOL_NAMES = new Set([
  "navigate_to_view",
  "select_topic",
  "select_project",
  "show_guide",
  "show_progress",
  "show_sources",
  "complete_guide_block",
  "open_artifact",
  "get_current_state",
])

type StateUpdatePayload = {
  __stateUpdate: boolean
  type?: string
  view?: string
  topicId?: string
  topicName?: string
  projectId?: string
  projectName?: string
  highlightBlockId?: string | null
  blockId?: string
  artifact?: string
  [key: string]: unknown
}

function AgentTab({
  onOpenArtifact,
  onStateUpdate,
}: {
  onOpenArtifact: (type: ArtifactType, scrollToId?: string) => void
  onStateUpdate?: (payload: StateUpdatePayload) => void
}) {
  const msgId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)
  const priorContext = conversationStore.toMessageHistory()
  const { messages, sendMessage, status, error } = useChat({
    body: { priorContext },
  })
  const [input, setInput] = useState("")
  const processedToolCalls = useRef(new Set<string>())

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Process state update tool results from messages
  useEffect(() => {
    if (!onStateUpdate) return
    for (const msg of messages) {
      if (msg.role !== "assistant") continue
      for (const part of msg.parts) {
        if (part.type.startsWith("tool-")) {
          const toolName = part.type.replace("tool-", "")
          if (!STATE_TOOL_NAMES.has(toolName)) continue
          const toolPart = part as { type: string; state: string; toolCallId: string; result?: StateUpdatePayload }
          if (toolPart.state === "result" && toolPart.result?.__stateUpdate && !processedToolCalls.current.has(toolPart.toolCallId)) {
            processedToolCalls.current.add(toolPart.toolCallId)
            onStateUpdate(toolPart.result)
          }
        }
      }
    }
  }, [messages, onStateUpdate])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    // Also add to unified store so voice mode picks it up
    conversationStore.addMessage({
      id: `text-chat-${Date.now()}`,
      role: "user",
      text: input,
      timestamp: Date.now(),
      modality: "text",
      isFinal: true,
    })
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <MessageSquare className="size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Ask me anything about your studies</p>
            </div>
          )}
          {messages.map((msg: UIMessage) => (
            <div
              key={`${msgId}-${msg.id}`}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <Avatar size="sm" className="mt-0.5 shrink-0">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                {msg.parts.map((part, partIdx) => {
                  if (part.type === "text" && part.text.trim()) {
                    return (
                      <div
                        key={`${msg.id}-part-${partIdx}`}
                        className={`rounded-2xl px-3.5 py-1.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {part.text}
                      </div>
                    )
                  }
                  if (part.type.startsWith("tool-")) {
                    const toolName = part.type.replace("tool-", "")
                    const isStateTool = STATE_TOOL_NAMES.has(toolName)
                    const artifactType = TOOL_TYPE_TO_ARTIFACT[toolName]
                    const label = TOOL_LABELS[toolName] ?? toolName
                    const toolPart = part as { type: string; state: string; toolCallId: string }

                    if (toolPart.state === "call" || toolPart.state === "input-streaming") {
                      return (
                        <div key={`${msg.id}-part-${partIdx}`} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="size-3 animate-spin" />
                          {isStateTool ? label : `Creating ${label.toLowerCase().replace("view ", "")}...`}
                        </div>
                      )
                    }

                    if (toolPart.state === "result" && isStateTool) {
                      return (
                        <div key={`${msg.id}-part-${partIdx}`} className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Check className="size-3 text-green-600" />
                          Done
                        </div>
                      )
                    }

                    if (toolPart.state === "result" && artifactType) {
                      return (
                        <div key={`${msg.id}-part-${partIdx}`} className="mt-2">
                          <button
                            type="button"
                            onClick={() => onOpenArtifact(artifactType)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/50"
                          >
                            <ChevronRight className="size-3" />
                            {label}
                          </button>
                        </div>
                      )
                    }

                    return null
                  }
                  return null
                })}
              </div>
              {msg.role === "user" && (
                <Avatar size="sm" className="mt-0.5 shrink-0">
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error.message}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask your learning agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button size="icon" type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ── Adjustments Dialog ──

function AdjustmentsDialog() {
  const [dailyMinutes, setDailyMinutes] = useState([60])
  const [difficulty, setDifficulty] = useState([3])
  const [reviewFrequency, setReviewFrequency] = useState([4])

  const handleSlider = (setter: (v: number[]) => void) => (value: number | readonly number[]) => {
    setter(Array.isArray(value) ? [...value] : [value])
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button size="lg" variant="outline" />}>
        Make Adjustments
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust Your Guide</DialogTitle>
          <DialogDescription>
            Fine-tune your learning preferences and regenerate the guide.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto -mx-6 px-6">
          <Accordion defaultValue={["schedule", "difficulty", "focus"]}>
            <AccordionItem value="schedule">
              <AccordionTrigger>Schedule &amp; Pacing</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Daily study time: {dailyMinutes[0]} min</Label>
                  <Slider
                    value={dailyMinutes}
                    onValueChange={handleSlider(setDailyMinutes)}
                    min={15}
                    max={180}
                    step={15}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred start day</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Days per week</Label>
                  <Input type="number" min={1} max={7} defaultValue={5} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="difficulty">
              <AccordionTrigger>Difficulty &amp; Depth</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Challenge level: {["Beginner", "Easy", "Moderate", "Hard", "Expert"][difficulty[0] - 1]}</Label>
                  <Slider
                    value={difficulty}
                    onValueChange={handleSlider(setDifficulty)}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review frequency: every {reviewFrequency[0]} blocks</Label>
                  <Slider
                    value={reviewFrequency}
                    onValueChange={handleSlider(setReviewFrequency)}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="focus">
              <AccordionTrigger>Focus Areas</AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Topics to prioritize</Label>
                  <Input placeholder="e.g. eigenvalues, matrix decomposition" />
                </div>
                <div className="space-y-2">
                  <Label>Topics to skip or de-emphasize</Label>
                  <Input placeholder="e.g. proofs, history" />
                </div>
                <div className="space-y-2">
                  <Label>Learning goal</Label>
                  <Input placeholder="e.g. pass final exam, build intuition" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <DialogFooter>
          <Button className="w-full" size="lg">
            Regenerate Guide
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Guide Tab ──

function GuideTab({ blocks }: { blocks: MockGuideBlock[] }) {
  const blockId = useId()
  const days = Array.from(new Set(blocks.map((b) => b.dayIndex))).sort()

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-xl border p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          <ShinyText
            text="Welcome to your generated guide"
            speed={3}
            color="#64748b"
            shineColor="#8b5cf6"
            className="text-2xl font-bold tracking-tight"
          />
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload your study materials, and Core Model builds a scientific profile of how you actually learn — then generates an adaptive guide with evidence-traced recommendations that evolve as you do.
        </p>
        <div className="mt-4 flex gap-3">
          <Button size="lg">
            Get Started
          </Button>
          <AdjustmentsDialog />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">7-Day Learning Guide</h2>
        <Badge variant="outline">
          {blocks.filter((b) => b.completed).length}/{blocks.length} completed
        </Badge>
      </div>

      {days.map((day) => {
        const dayBlocks = blocks.filter((b) => b.dayIndex === day)
        const allDone = dayBlocks.every((b) => b.completed)
        return (
          <Card key={`${blockId}-day-${day}`} size="sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Day {day}</CardTitle>
                {allDone && (
                  <Badge variant="secondary" className="text-xs">
                    Complete
                  </Badge>
                )}
                {day === 2 && !allDone && (
                  <Badge className="text-xs">Today</Badge>
                )}
              </div>
              <CardDescription>
                {dayBlocks.reduce((sum, b) => sum + b.plannedMinutes, 0)} min
                total
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dayBlocks.map((block) => {
                const typeInfo = BLOCK_TYPE_LABELS[block.blockType] ?? {
                  label: block.blockType,
                  color: "bg-gray-100 text-gray-800",
                }
                return (
                  <div
                    key={`${blockId}-${block.id}`}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${
                      block.completed ? "opacity-60" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}
                    >
                      {typeInfo.label}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${block.completed ? "line-through" : ""}`}>
                        {block.description}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {block.plannedMinutes} min
                      </p>
                    </div>
                    {!block.completed && day <= 2 && (
                      <Button size="xs" variant="outline">
                        Start
                      </Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

// ── Sources Tab ──

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function SourcesTab({ files }: { files: MockFile[] }) {
  const fileId = useId()
  const uploadId = useId()
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Sources & Resources</h2>
      </div>

      {/* Dropzone */}
      <label
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false) }}
      >
        <Upload className="size-5 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground">PDF, Markdown, images up to 50 MB</p>
        </div>
        <input type="file" multiple className="hidden" accept=".pdf,.md,.png,.jpg,.jpeg" />
      </label>

      {/* Uploading files */}
      {MOCK_UPLOADS.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase">Uploading</p>
          {MOCK_UPLOADS.map((upload) => (
            <div
              key={`${uploadId}-${upload.id}`}
              className="flex flex-col gap-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {upload.status === "uploading" ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-destructive" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{upload.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(upload.sizeBytes)}
                    {upload.status === "uploading" && ` · ${upload.progress}%`}
                  </p>
                </div>
                <Button variant="ghost" size="icon-xs">
                  <X className="size-3" />
                </Button>
              </div>
              {upload.status === "uploading" ? (
                <Progress value={upload.progress} className="h-1" />
              ) : (
                <p className="text-xs text-destructive">{upload.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing files */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase">Sources</p>
        {files.map((file) => (
          <div
            key={`${fileId}-${file.id}`}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{file.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.sizeBytes)} · {file.uploadedAt}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">
              {file.scope === "topic" ? "Topic" : "Project"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Progress Tab ──

function ProgressTab({ mastery, project }: { mastery: MockMastery[]; project: MockProject }) {
  const statId = useId()

  const stats = [
    { label: "Overall Mastery", value: formatPercent(project.mastery), sub: `+/- ${formatPercent(project.masteryUncertainty)}` },
    { label: "Calibration (ECE)", value: "0.18", sub: "Overconfident" },
    { label: "Cognitive Load Risk", value: "0.68", sub: "High" },
    { label: "Adherence", value: "80%", sub: "4/5 blocks" },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={`${statId}-${stat.label}`} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mastery Map */}
      <Card>
        <CardHeader>
          <CardTitle>Mastery Map</CardTitle>
          <CardDescription>
            Bayesian posterior estimates with 90% credible intervals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mastery.map((m) => (
            <MasteryBar key={m.id} item={m} showInterval />
          ))}
        </CardContent>
      </Card>

      {/* Calibration */}
      <Card>
        <CardHeader>
          <CardTitle>Calibration</CardTitle>
          <CardDescription>
            How well your confidence matches your accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">ECE</p>
              <p className="text-2xl font-semibold tabular-nums">0.18</p>
              <p className="text-xs text-muted-foreground">
                Above threshold (0.12)
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Brier Score</p>
              <p className="text-2xl font-semibold tabular-nums">0.31</p>
              <p className="text-xs text-muted-foreground">
                Room for improvement
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Confidence</span>
              <span>Accuracy</span>
              <span>Gap</span>
            </div>
            {[
              { conf: "90%", acc: "62%", gap: "+28%" },
              { conf: "80%", acc: "55%", gap: "+25%" },
              { conf: "70%", acc: "58%", gap: "+12%" },
              { conf: "60%", acc: "52%", gap: "+8%" },
              { conf: "50%", acc: "48%", gap: "+2%" },
            ].map((row) => (
              <div
                key={`cal-${row.conf}`}
                className="flex justify-between text-sm tabular-nums"
              >
                <span>{row.conf}</span>
                <span>{row.acc}</span>
                <span className="text-destructive">{row.gap}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Construct Estimates */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Estimates</CardTitle>
          <CardDescription>
            Derived from your learning behavior patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Cognitive Load Risk", value: 0.68, band: "medium", status: "High -- chunks reduced" },
            { name: "Self-Regulation Risk", value: 0.35, band: "medium", status: "Low-moderate -- monitoring" },
            { name: "Motivation Support Need", value: 0.42, band: "low", status: "Moderate -- no action yet" },
            { name: "Dropout Risk", value: 0.15, band: "low", status: "Low -- attendance stable" },
          ].map((construct) => (
            <div key={`construct-${construct.name}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">{construct.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {construct.value.toFixed(2)}
                </span>
              </div>
              <Progress value={construct.value * 100}>
                <ProgressLabel className="sr-only">
                  {construct.name}
                </ProgressLabel>
              </Progress>
              <p className="text-xs text-muted-foreground">
                {construct.status} (confidence: {construct.band})
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Audit Tab ──

function AuditTab({ events }: { events: MockAuditEvent[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h2 className="text-base font-semibold">
        Audit Trail: Observe &rarr; Analyze &rarr; Act
      </h2>
      <p className="text-sm text-muted-foreground">
        Every recommendation is traceable. Click to expand the full chain.
      </p>

      <Accordion>
        {events.map((event) => (
          <AccordionItem key={event.id} value={event.id}>
            <AccordionTrigger>
              <div className="flex flex-col items-start gap-1 text-left">
                <span className="text-sm font-medium">{event.summary}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.occurredAt).toLocaleDateString()}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Observe
                    </span>
                  </div>
                  <p className="pl-3.5 text-sm">{event.observe}</p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Analyze
                    </span>
                  </div>
                  <p className="pl-3.5 text-sm">{event.analyze}</p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      Act
                    </span>
                  </div>
                  <p className="pl-3.5 text-sm">{event.act}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

// ── Artifact Grid ──

const ARTIFACT_TYPES = [
  { label: "Audio", icon: AudioLines, count: 0, unread: 0 },
  { label: "Video", icon: Video, count: 0, unread: 0 },
  { label: "Mind Map", icon: Map, count: 1, unread: 0 },
  { label: "3D Spatial", icon: Box, count: 3, unread: 1 },
  { label: "Flashcards", icon: FlipHorizontal, count: 3, unread: 2 },
  { label: "Quiz", icon: HelpCircle, count: 2, unread: 1 },
  { label: "Infographic", icon: BarChart3, count: 0, unread: 0 },
  { label: "Slide Deck", icon: Presentation, count: 1, unread: 0 },
  { label: "Data Table", icon: Table2, count: 0, unread: 0 },
  { label: "Reports", icon: FileText, count: 0, unread: 0 },
  { label: "Manim", icon: Clapperboard, count: 3, unread: 1 },
  { label: "Geo", icon: Globe, count: 2, unread: 1 },
] as const

function ArtifactGrid({
  onOpenType,
  activeType,
}: {
  onOpenType: (type: ArtifactType) => void
  activeType: ArtifactType | null
}) {
  const gridId = useId()

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {ARTIFACT_TYPES.map((artifact) => {
        const Icon = artifact.icon
        const artifactType = artifactTypeFromLabel(artifact.label)
        const realCount = artifactType ? getArtifactsByType(artifactType).length : 0
        const hasItems = realCount > 0
        const isActive = activeType === artifactType
        return (
          <button
            type="button"
            key={`${gridId}-${artifact.label}`}
            onClick={() => artifactType && onOpenType(artifactType)}
            className={`group relative flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
              isActive
                ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                : hasItems
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
                  : "border-border/50 bg-muted/30 hover:bg-muted hover:border-border"
            }`}
          >
            <Icon className={`size-4 ${hasItems || isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className={`truncate text-xs font-medium ${hasItems || isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
              {artifact.label}
            </span>
            {realCount > 0 && (
              <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {realCount}
              </span>
            )}
            {!hasItems && !isActive && (
              <Pencil className="absolute top-2.5 right-2.5 size-3 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Shared: Mastery Bar ──

function MasteryBar({
  item,
  showInterval,
}: {
  item: MockMastery
  showInterval?: boolean
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-sm">{item.concept}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatPercent(item.posteriorMean)}
          {showInterval &&
            ` [${formatPercent(item.credibleLow)} - ${formatPercent(item.credibleHigh)}]`}
        </span>
      </div>
      <div className="relative">
        <Progress value={item.posteriorMean * 100}>
          <ProgressLabel className="sr-only">{item.concept}</ProgressLabel>
        </Progress>
        {showInterval && (
          <div
            className="absolute top-0 h-3 rounded-full border-2 border-foreground/20"
            style={{
              left: `${item.credibleLow * 100}%`,
              width: `${(item.credibleHigh - item.credibleLow) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  )
}
