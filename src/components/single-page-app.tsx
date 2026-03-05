"use client"

import { useEffect, useId, useState } from "react"
import {
  SiOpenai,
  SiAnthropic,
  SiSlack,
  SiDiscord,
  SiModelcontextprotocol,
  SiMarkdown,
} from "react-icons/si"
import { BsMicrosoftTeams } from "react-icons/bs"
import {
  AudioLines,
  BarChart3,
  Braces,
  Brain,
  Calendar,
  ChevronRight,
  CreditCard,
  AlertCircle,
  FileDown,
  FileText,
  Loader2,
  FlipHorizontal,
  FolderOpen,
  HelpCircle,
  LogOut,
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
  Settings,
  Shield,
  Table2,
  TrendingUp,
  Upload,
  User,
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
import {
  LearningProfileForm,
  MOCK_COMPLETED_PROFILE,
  type LearningProfileData,
} from "@/components/learning-profile-form"
import { ClipboardList } from "lucide-react"

// ── Mock Data ──

type GoalType = "exam" | "project" | "fluency" | "teach"

type MockProject = {
  id: string
  name: string
  goalType: GoalType
  mastery: number
  masteryUncertainty: number
  minutesPerDay: number
  daysPerWeek: number
  deadline: string
}

type MockTopic = {
  id: string
  name: string
  domain: string
  projects: MockProject[]
  fileCount: number
}

type MockMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

type MockGuideBlock = {
  id: string
  dayIndex: number
  blockType: string
  plannedMinutes: number
  description: string
  completed: boolean
}

type MockFile = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  scope: "topic" | "project"
}

type MockUpload = {
  id: string
  filename: string
  sizeBytes: number
  progress: number
  status: "uploading" | "error"
  error?: string
}

type MockMastery = {
  id: string
  concept: string
  posteriorMean: number
  posteriorSd: number
  credibleLow: number
  credibleHigh: number
}

type MockAuditEvent = {
  id: string
  occurredAt: string
  observe: string
  analyze: string
  act: string
  summary: string
}

const TOPICS: MockTopic[] = [
  {
    id: "topic-1",
    name: "Linear Algebra",
    domain: "Mathematics",
    fileCount: 12,
    projects: [
      {
        id: "proj-1",
        name: "Midterm Exam Prep",
        goalType: "exam",
        mastery: 0.55,
        masteryUncertainty: 0.12,
        minutesPerDay: 45,
        daysPerWeek: 5,
        deadline: "2026-03-28",
      },
      {
        id: "proj-2",
        name: "Deep Dive - Eigenvalues",
        goalType: "fluency",
        mastery: 0.38,
        masteryUncertainty: 0.18,
        minutesPerDay: 30,
        daysPerWeek: 3,
        deadline: "",
      },
    ],
  },
  {
    id: "topic-2",
    name: "Machine Learning",
    domain: "Computer Science",
    fileCount: 7,
    projects: [
      {
        id: "proj-3",
        name: "Career Switch Fundamentals",
        goalType: "fluency",
        mastery: 0.22,
        masteryUncertainty: 0.25,
        minutesPerDay: 30,
        daysPerWeek: 4,
        deadline: "",
      },
    ],
  },
]

const CHAT_HISTORY: MockMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Can you help me review eigenvectors before the midterm?",
    timestamp: "2026-03-03T14:30:00Z",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "Of course! Based on your profile, your mastery of eigenvectors is at 0.48 (moderate confidence). Let me create a focused review set. Your calibration data shows you tend to overestimate your confidence here -- I'll include some prediction prompts to help with that.",
    timestamp: "2026-03-03T14:30:15Z",
  },
  {
    id: "msg-3",
    role: "user",
    content: "That makes sense. I do feel like I know it better than I actually do.",
    timestamp: "2026-03-03T14:31:00Z",
  },
  {
    id: "msg-4",
    role: "assistant",
    content:
      "That's great self-awareness! I've generated a flashcard set of 12 cards covering eigenvalue computation, eigenvector properties, and diagonalization. Each card includes a confidence prompt before revealing the answer. Want me to also create a practice quiz?",
    timestamp: "2026-03-03T14:31:20Z",
  },
  {
    id: "msg-5",
    role: "user",
    content: "Yes, a quiz would be great. Focus on application problems.",
    timestamp: "2026-03-03T14:32:00Z",
  },
  {
    id: "msg-6",
    role: "assistant",
    content:
      "Done! I've created a 10-question quiz focused on application and near-transfer problems. Topics covered: finding eigenvalues of 2x2 and 3x3 matrices, determining eigenvectors, and applying diagonalization to solve systems. I've also updated your 7-day guide to include extra practice on these concepts for days 3 and 5.",
    timestamp: "2026-03-03T14:32:30Z",
  },
]

const GUIDE_BLOCKS: MockGuideBlock[] = [
  { id: "gb-1", dayIndex: 1, blockType: "core_practice", plannedMinutes: 25, description: "Matrix operations review -- 8 retrieval items", completed: true },
  { id: "gb-2", dayIndex: 1, blockType: "metacog_routine", plannedMinutes: 10, description: "Confidence calibration exercise", completed: true },
  { id: "gb-3", dayIndex: 2, blockType: "core_practice", plannedMinutes: 30, description: "Vector spaces and subspaces -- 6 application items", completed: true },
  { id: "gb-4", dayIndex: 2, blockType: "skill_builder", plannedMinutes: 10, description: "Time management: Pomodoro technique refresher", completed: false },
  { id: "gb-5", dayIndex: 3, blockType: "core_practice", plannedMinutes: 30, description: "Eigenvalues and eigenvectors -- 4 worked examples + 6 items", completed: false },
  { id: "gb-6", dayIndex: 3, blockType: "metacog_routine", plannedMinutes: 15, description: "Prediction-reflection loop on eigenvalue problems", completed: false },
  { id: "gb-7", dayIndex: 4, blockType: "core_practice", plannedMinutes: 25, description: "Diagonalization -- 8 near-transfer items", completed: false },
  { id: "gb-8", dayIndex: 4, blockType: "motivation_support", plannedMinutes: 5, description: "Progress reflection + choice of next focus area", completed: false },
  { id: "gb-9", dayIndex: 5, blockType: "core_practice", plannedMinutes: 30, description: "Mixed practice -- eigenvalues, determinants, linear transforms", completed: false },
  { id: "gb-10", dayIndex: 5, blockType: "metacog_routine", plannedMinutes: 10, description: "Pre-exam confidence mapping exercise", completed: false },
  { id: "gb-11", dayIndex: 6, blockType: "core_practice", plannedMinutes: 20, description: "Weak spots review -- spaced repetition queue", completed: false },
  { id: "gb-12", dayIndex: 7, blockType: "core_practice", plannedMinutes: 30, description: "Full practice exam simulation", completed: false },
]

const FILES: MockFile[] = [
  { id: "f-1", filename: "Chapter 5 - Eigenvalues.pdf", mimeType: "application/pdf", sizeBytes: 2_400_000, uploadedAt: "2026-02-20", scope: "topic" },
  { id: "f-2", filename: "Lecture 12 Notes.md", mimeType: "text/markdown", sizeBytes: 18_200, uploadedAt: "2026-02-25", scope: "topic" },
  { id: "f-3", filename: "Practice Midterm 2025.pdf", mimeType: "application/pdf", sizeBytes: 5_100_000, uploadedAt: "2026-03-01", scope: "project" },
  { id: "f-4", filename: "Eigenvector Cheat Sheet.md", mimeType: "text/markdown", sizeBytes: 8_400, uploadedAt: "2026-03-02", scope: "project" },
  { id: "f-5", filename: "Homework 7 Solutions.pdf", mimeType: "application/pdf", sizeBytes: 3_700_000, uploadedAt: "2026-02-28", scope: "topic" },
  { id: "f-6", filename: "Study Group Notes.md", mimeType: "text/markdown", sizeBytes: 12_600, uploadedAt: "2026-03-03", scope: "project" },
]

const MOCK_UPLOADS: MockUpload[] = [
  { id: "u-1", filename: "Linear Algebra Textbook Ch6.pdf", sizeBytes: 8_200_000, progress: 64, status: "uploading" },
  { id: "u-2", filename: "Midterm Review Slides.pptx", sizeBytes: 14_500_000, progress: 38, status: "uploading" },
  { id: "u-3", filename: "Corrupted Notes.pdf", sizeBytes: 1_200_000, progress: 12, status: "error", error: "Upload failed — file may be corrupted" },
]

const MASTERY_DATA: MockMastery[] = [
  { id: "m-1", concept: "Matrix Operations", posteriorMean: 0.72, posteriorSd: 0.08, credibleLow: 0.58, credibleHigh: 0.86 },
  { id: "m-2", concept: "Vector Spaces", posteriorMean: 0.61, posteriorSd: 0.11, credibleLow: 0.42, credibleHigh: 0.80 },
  { id: "m-3", concept: "Eigenvalues", posteriorMean: 0.48, posteriorSd: 0.14, credibleLow: 0.24, credibleHigh: 0.72 },
  { id: "m-4", concept: "Eigenvectors", posteriorMean: 0.45, posteriorSd: 0.15, credibleLow: 0.20, credibleHigh: 0.70 },
  { id: "m-5", concept: "Diagonalization", posteriorMean: 0.32, posteriorSd: 0.18, credibleLow: 0.08, credibleHigh: 0.56 },
  { id: "m-6", concept: "Linear Transforms", posteriorMean: 0.58, posteriorSd: 0.10, credibleLow: 0.40, credibleHigh: 0.76 },
  { id: "m-7", concept: "Determinants", posteriorMean: 0.68, posteriorSd: 0.09, credibleLow: 0.52, credibleHigh: 0.84 },
]

const AUDIT_EVENTS: MockAuditEvent[] = [
  {
    id: "ae-1",
    occurredAt: "2026-03-03T15:00:00Z",
    observe: "Error rate rose from 15% to 40% over sessions 8-10 on eigenvalue items.",
    analyze: "Cognitive load risk increased to 0.68 (confidence: medium). Mastery estimate for eigenvalues dropped from 0.55 to 0.48.",
    act: "Reduced chunk size from 8 to 4 items for eigenvalue practice. Added 2 worked examples before each practice block.",
    summary: "Your recent eigenvalue practice showed increasing difficulty. We've made the practice blocks smaller and added worked examples to help.",
  },
  {
    id: "ae-2",
    occurredAt: "2026-03-02T10:00:00Z",
    observe: "Calibration data: predicted 80% confidence, scored 55% across 20 items.",
    analyze: "ECE increased to 0.18 (above 0.12 threshold). Brier score: 0.31. Overconfidence pattern confirmed.",
    act: "Inserted prediction-reflection loops every 3rd item. Added confidence calibration exercise to daily guide.",
    summary: "You're tending to overestimate how well you know the material. We've added reflection prompts to help you calibrate.",
  },
  {
    id: "ae-3",
    occurredAt: "2026-03-01T09:00:00Z",
    observe: "Completed 4 of 5 scheduled blocks this week. Skipped Day 4 metacognition routine.",
    analyze: "Self-regulation risk at 0.35 (low-moderate). Adherence stable at 80%.",
    act: "No policy change -- within acceptable range. Monitoring for decline.",
    summary: "Your attendance is solid at 80%. The system is keeping an eye on it but no changes needed.",
  },
  {
    id: "ae-4",
    occurredAt: "2026-02-28T14:00:00Z",
    observe: "Cross-concept mastery mean reached 0.52 across 5 concepts with medium+ confidence.",
    analyze: "Interleaving readiness threshold met (mean >= 0.5).",
    act: "Enabled mixed problem types within sessions at 40% interleaving ratio.",
    summary: "You've built enough foundation across concepts to benefit from mixed practice. Sessions now blend different problem types.",
  },
]

// ── Helpers ──

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

export function SinglePageApp() {
  const [selectedTopicId] = useState("topic-1")
  const [selectedProjectId] = useState("proj-1")
  const [chatInput, setChatInput] = useState("")
  const [agentOpen, setAgentOpen] = useState(false)
  const [voiceMode, setVoiceMode] = useState(true)
  const [assessmentMode, setAssessmentMode] = useState(false)
  const [userProfile, setUserProfile] = useState<LearningProfileData>(MOCK_COMPLETED_PROFILE)

  const selectedTopic = TOPICS.find((t) => t.id === selectedTopicId) ?? TOPICS[0]
  const selectedProject =
    selectedTopic.projects.find((p) => p.id === selectedProjectId) ??
    selectedTopic.projects[0]

  return (
    <Tabs defaultValue={0} className="flex h-dvh flex-col gap-0 bg-background">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <Brain className="size-5 text-primary" />
          <span className="text-sm font-semibold">DeepLearn</span>

          <Separator orientation="vertical" className="mx-1 h-5" />

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <FolderOpen className="size-3.5" />
            <span className="hidden sm:inline">{selectedTopic.name}</span>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">{selectedProject.name}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Desktop: Nav + Connect + Audit + User */}
            <div className="hidden items-center gap-2 lg:flex">
              <TabsList className="bg-muted/50">
                <TabsTrigger value={0} className="gap-1.5 px-3 text-sm">
                  <Calendar className="size-3.5" />
                  Guide
                </TabsTrigger>
                <TabsTrigger value={1} className="gap-1.5 px-3 text-sm">
                  <FileText className="size-3.5" />
                  Files
                </TabsTrigger>
                <TabsTrigger value={2} className="gap-1.5 px-3 text-sm">
                  <TrendingUp className="size-3.5" />
                  Progress
                </TabsTrigger>
              </TabsList>
              <ConnectDialog />
              <AuditDialog />
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
                    <AvatarFallback>MC</AvatarFallback>
                  </Avatar>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg">
                  <SheetHeader className="flex-row items-center gap-3">
                    <Avatar>
                      <AvatarFallback>MC</AvatarFallback>
                    </Avatar>
                    <SheetTitle>Maya Chen</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-6">
                    <OverviewTab onRetakeAssessment={() => setAssessmentMode(true)} />
                  </div>
                  <Separator />
                  <AccountSection />
                </SheetContent>
              </Sheet>
            </div>

            {/* Mobile: Agent toggle */}
            <Button
              variant={agentOpen ? "default" : "ghost"}
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setAgentOpen(!agentOpen)}
            >
              <MessageSquare className="size-4" />
            </Button>

            {/* Mobile: Hamburger menu */}
            <Sheet>
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
                  {/* Mobile nav */}
                  <TabsList className="w-full border bg-muted/50 p-0.5">
                    <TabsTrigger value={0} className="flex-1 gap-1.5 px-3 py-1.5 text-sm">
                      <Calendar className="size-3.5" />
                      Guide
                    </TabsTrigger>
                    <TabsTrigger value={1} className="flex-1 gap-1.5 px-3 py-1.5 text-sm">
                      <FileText className="size-3.5" />
                      Files
                    </TabsTrigger>
                    <TabsTrigger value={2} className="flex-1 gap-1.5 px-3 py-1.5 text-sm">
                      <TrendingUp className="size-3.5" />
                      Progress
                    </TabsTrigger>
                  </TabsList>

                  <Separator />

                  <div className="flex gap-2">
                    <ConnectDialog />
                    <AuditDialog />
                  </div>

                  <Separator />

                  <Sheet>
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
                      <SheetHeader>
                        <SheetTitle>Maya Chen</SheetTitle>
                      </SheetHeader>
                      <div className="flex-1 overflow-y-auto p-6">
                        <OverviewTab onRetakeAssessment={() => setAssessmentMode(true)} />
                      </div>
                      <Separator />
                      <AccountSection />
                    </SheetContent>
                  </Sheet>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {assessmentMode ? (
            /* Assessment Mode: form replaces sidebar + canvas */
            <div className="flex-1 overflow-hidden">
              <LearningProfileForm
                initialData={userProfile}
                onSave={(profileData) => setUserProfile(profileData)}
                onCancel={() => setAssessmentMode(false)}
              />
            </div>
          ) : (
            <>
              {/* Left Sidebar - Create artifacts */}
              <aside className="hidden w-48 shrink-0 border-r lg:flex lg:flex-col">
                <div className="flex-1 overflow-y-auto p-3">
                  <ArtifactGrid />
                </div>
              </aside>

              {/* Main Content */}
              <main className="relative flex-1 overflow-y-auto">
                <TabsContent value={0} className="p-4 sm:p-6">
                  <GuideTab blocks={GUIDE_BLOCKS} />
                </TabsContent>

                <TabsContent value={1} className="p-4 sm:p-6">
                  <FilesTab files={FILES} />
                </TabsContent>

                <TabsContent value={2} className="p-4 sm:p-6">
                  <ProgressTab mastery={MASTERY_DATA} project={selectedProject} />
                </TabsContent>
              </main>
            </>
          )}

          {/* Agent Right Sidebar - Desktop: always visible, Mobile: toggleable */}
        <aside
          className={`flex w-full flex-col border-l lg:w-96 lg:shrink-0 ${
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
                onClick={() => setAgentOpen(false)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          {voiceMode ? (
            <VoiceAgent onSwitchToText={() => setVoiceMode(false)} />
          ) : (
            <AgentTab
              messages={CHAT_HISTORY}
              chatInput={chatInput}
              onChatInputChange={setChatInput}
            />
          )}
        </aside>
      </div>
    </Tabs>
  )
}

// ── Overview Tab (Learning Profile / "Learning DNA") ──

const PROFILE_STRENGTHS = [
  { area: "Cognitive Reflection", score: 0.72, label: "Strong", description: "You pause to reason through tricky problems rather than going with your gut." },
  { area: "Metacognitive Awareness", score: 0.58, label: "Developing", description: "You have moderate self-awareness of your own learning, but tend to overestimate mastery." },
  { area: "Study Strategy Repertoire", score: 0.65, label: "Good", description: "You use active recall and spaced repetition. Could benefit from more elaboration techniques." },
  { area: "Self-Regulation", score: 0.52, label: "Developing", description: "Decent time management, but you sometimes skip reflection steps when pressed for time." },
] as const

const MOTIVATION_PROFILE = {
  autonomy: 0.78,
  competence: 0.62,
  relatedness: 0.45,
} as const

const CALIBRATION_TENDENCY = {
  tendency: "Overconfident",
  avgConfidence: 0.80,
  avgAccuracy: 0.55,
  gap: 0.25,
} as const

const LEARNING_PREFERENCES = [
  { pref: "Visual diagrams over text-heavy explanations" },
  { pref: "Short practice sessions (25-30 min)" },
  { pref: "Worked examples before free practice" },
  { pref: "Prefers direct, concise coaching tone" },
] as const

const SYSTEM_ADAPTATIONS = [
  { rule: "Chunk size reduced to 4 items", reason: "Cognitive load risk is high during eigenvalue practice" },
  { rule: "Reflection prompts every 3rd item", reason: "Calibration error (ECE 0.18) above threshold" },
  { rule: "Interleaved practice enabled at 40%", reason: "Cross-concept mastery reached 0.5 threshold" },
  { rule: "Autonomy-supportive coaching tone", reason: "High autonomy drive in motivation profile" },
] as const

function OverviewTab({ onRetakeAssessment }: { onRetakeAssessment?: () => void }) {
  const listId = useId()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Retake Assessment */}
      {onRetakeAssessment && (
        <Button variant="outline" className="w-full" onClick={onRetakeAssessment}>
          <ClipboardList className="size-4" data-icon="inline-start" />
          Retake Assessment
        </Button>
      )}

      {/* Profile summary */}
      <div>
        <p className="text-sm text-muted-foreground">
          Learning profile completed Feb 15, 2026
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Badge variant="secondary">Exam-focused</Badge>
          <Badge variant="secondary">45 min/day</Badge>
          <Badge variant="secondary">5 days/week</Badge>
          <Badge variant="outline">Deadline: Mar 28</Badge>
        </div>
      </div>

      {/* Learning Strengths */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Strengths</CardTitle>
          <CardDescription>
            From your 12-screen Learning Profile assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PROFILE_STRENGTHS.map((s) => (
            <div key={`${listId}-str-${s.area}`} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{s.area}</span>
                <Badge
                  variant={s.score >= 0.7 ? "default" : "outline"}
                  className="text-xs"
                >
                  {s.label}
                </Badge>
              </div>
              <Progress value={s.score * 100}>
                <ProgressLabel className="sr-only">{s.area}</ProgressLabel>
              </Progress>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Motivation Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Motivation Profile</CardTitle>
          <CardDescription>
            Self-Determination Theory: what drives your learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(
            [
              { key: "autonomy", label: "Autonomy", desc: "Need for choice and self-direction" },
              { key: "competence", label: "Competence", desc: "Need to feel capable and effective" },
              { key: "relatedness", label: "Relatedness", desc: "Need for connection and belonging" },
            ] as const
          ).map((m) => (
            <div key={`${listId}-mot-${m.key}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">{m.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatPercent(MOTIVATION_PROFILE[m.key])}
                </span>
              </div>
              <Progress value={MOTIVATION_PROFILE[m.key] * 100}>
                <ProgressLabel className="sr-only">{m.label}</ProgressLabel>
              </Progress>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Calibration Tendency */}
      <Card>
        <CardHeader>
          <CardTitle>Confidence Calibration</CardTitle>
          <CardDescription>
            How well your confidence matches your actual performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
              <span className="text-lg font-bold text-destructive">
                +{formatPercent(CALIBRATION_TENDENCY.gap)}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">{CALIBRATION_TENDENCY.tendency}</p>
              <p className="text-xs text-muted-foreground">
                You predict {formatPercent(CALIBRATION_TENDENCY.avgConfidence)} confidence but score{" "}
                {formatPercent(CALIBRATION_TENDENCY.avgAccuracy)} on average
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Preferences</CardTitle>
          <CardDescription>
            From screens 10-11 of your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {LEARNING_PREFERENCES.map((p) => (
              <li
                key={`${listId}-pref-${p.pref}`}
                className="flex items-start gap-2 text-sm"
              >
                <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                {p.pref}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* How the System Adapts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Adaptations</CardTitle>
          <CardDescription>
            How the system is currently adjusting to your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {SYSTEM_ADAPTATIONS.map((a) => (
            <div
              key={`${listId}-adapt-${a.rule}`}
              className="rounded-lg border p-3"
            >
              <p className="text-sm font-medium">{a.rule}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {a.reason}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Agent Tab ──

// ── Audit Dialog ──

function AuditDialog() {
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
      <DialogContent className="flex max-h-[80dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Audit Trail</DialogTitle>
          <DialogDescription>
            Observe &rarr; Analyze &rarr; Act chain for every adaptation
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto -mx-6 px-6">
          <AuditTab events={AUDIT_EVENTS} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Connect Dialog ──

const CONNECT_INTEGRATIONS = [
  { label: "ChatGPT", icon: SiOpenai, description: "Connect your OpenAI account", connected: false },
  { label: "Claude", icon: SiAnthropic, description: "Connect your Anthropic account", connected: true },
  { label: "Slack", icon: SiSlack, description: "Post updates to Slack channels", connected: false },
  { label: "Teams", icon: BsMicrosoftTeams, description: "Sync with Microsoft Teams", connected: false },
  { label: "Discord", icon: SiDiscord, description: "Share progress to Discord", connected: false },
  { label: "MCP", icon: SiModelcontextprotocol, description: "Model Context Protocol server", connected: true },
] as const

const EXPORT_FORMATS = [
  { label: "PDF", icon: FileDown, description: "Export as .pdf report" },
  { label: "Markdown", icon: SiMarkdown, description: "Export as .md files" },
  { label: "JSON", icon: Braces, description: "Export as .json data" },
] as const

function ConnectDialog() {
  const optId = useId()

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" />
        }
      >
        <Plug className="size-4" data-icon="inline-start" />
        Connect
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect</DialogTitle>
          <DialogDescription>
            Link external services and export your data
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          {CONNECT_INTEGRATIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                type="button"
                key={`${optId}-${opt.label}`}
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
              return (
                <button
                  type="button"
                  key={`${optId}-export-${fmt.label}`}
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-muted"
                >
                  <Icon className="size-6 text-muted-foreground" />
                  <span className="text-xs font-medium">{fmt.label}</span>
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
      </DialogContent>
    </Dialog>
  )
}

// ── Account Section (Profile Sheet) ──

const ACCOUNT_LINKS = [
  { label: "Usage", icon: BarChart3 },
  { label: "Billing", icon: CreditCard },
  { label: "Account", icon: User },
] as const

function AccountSection() {
  const linkId = useId()

  return (
    <div className="flex flex-col gap-1 p-6">
      {ACCOUNT_LINKS.map((item) => {
        const Icon = item.icon
        return (
          <button
            type="button"
            key={`${linkId}-${item.label}`}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <Icon className="size-4 text-muted-foreground" />
            {item.label}
          </button>
        )
      })}
      <Separator className="my-1" />
      <button
        type="button"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="size-4" />
        Log out
      </button>
    </div>
  )
}

// ── Voice Agent ──

function VoiceAgent({ onSwitchToText }: { onSwitchToText: () => void }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [elapsed] = useState(47)
  const [micAccess, setMicAccess] = useState<"pending" | "granted" | "denied">("pending")
  const [requesting, setRequesting] = useState(false)

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

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`

  if (micAccess !== "granted") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <MicOff className="size-7 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">
            {micAccess === "pending" ? "Requesting microphone access..." : "Microphone access required"}
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
            <RefreshCw className={`size-3.5 ${requesting ? "animate-spin" : ""}`} data-icon="inline-start" />
            {requesting ? "Requesting..." : "Retry"}
          </Button>
          <Button size="sm" variant="outline" onClick={onSwitchToText}>
            Switch to text
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between overflow-hidden">
      {/* Status */}
      <div className="flex flex-col items-center gap-1 pt-6">
        <span className="text-xs text-muted-foreground">
          {isSpeaking ? "Agent is speaking..." : "Listening..."}
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Waveform visualization */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-[3px]">
          {Array.from({ length: 24 }).map((_, i) => {
            const barId = `voice-bar-${i}`
            const center = 12
            const dist = Math.abs(i - center)
            const baseHeight = Math.max(4, 32 - dist * 2.5)
            return (
              <div
                key={barId}
                className={`w-[3px] rounded-full transition-all duration-300 ${
                  isSpeaking ? "bg-primary" : "bg-primary/60"
                }`}
                style={{
                  height: isSpeaking
                    ? `${baseHeight + Math.sin(Date.now() / 200 + i) * 8}px`
                    : `${Math.max(3, baseHeight * 0.3)}px`,
                  animationName: isSpeaking ? "voice-pulse" : "none",
                  animationDuration: `${0.4 + (i % 5) * 0.1}s`,
                  animationIterationCount: "infinite",
                  animationDirection: "alternate",
                  animationTimingFunction: "ease-in-out",
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Agent avatar */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <Avatar size="lg" className={isSpeaking ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}>
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium">Learning Agent</span>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center justify-center gap-3 border-t p-4">
        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="icon"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
        </Button>
        <Button
          variant={isSpeaking ? "default" : "outline"}
          size="icon-lg"
          className={isSpeaking ? "animate-pulse" : ""}
          onClick={() => setIsSpeaking(!isSpeaking)}
        >
          <Mic className="size-5" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setIsSpeaking(false)}
        >
          <Phone className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ── Agent Chat Tab ──

function AgentTab({
  messages,
  chatInput,
  onChatInputChange,
}: {
  messages: MockMessage[]
  chatInput: string
  onChatInputChange: (v: string) => void
}) {
  const msgId = useId()

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={`${msgId}-${msg.id}`}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <Avatar size="sm" className="mt-0.5 shrink-0">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-1.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <Avatar size="sm" className="mt-0.5 shrink-0">
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask your learning agent..."
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            className="flex-1"
          />
          <Button size="icon">
            <Send />
          </Button>
        </div>
      </div>
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
      <DialogTrigger>
        <Button size="lg" variant="outline">
          Make Adjustments
        </Button>
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
          Welcome to your generated guide
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

// ── Files Tab ──

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilesTab({ files }: { files: MockFile[] }) {
  const fileId = useId()
  const uploadId = useId()
  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Files & Resources</h2>
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
        <p className="text-xs font-medium text-muted-foreground uppercase">Files</p>
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
  { label: "Reports", icon: FileText, count: 0, unread: 0 },
  { label: "Flashcards", icon: FlipHorizontal, count: 3, unread: 2 },
  { label: "Quiz", icon: HelpCircle, count: 2, unread: 1 },
  { label: "Infographic", icon: BarChart3, count: 0, unread: 0 },
  { label: "Slide Deck", icon: Presentation, count: 1, unread: 0 },
  { label: "Data Table", icon: Table2, count: 0, unread: 0 },
] as const

function ArtifactGrid() {
  const gridId = useId()

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {ARTIFACT_TYPES.map((artifact) => {
        const Icon = artifact.icon
        const hasItems = artifact.count > 0
        return (
          <button
            type="button"
            key={`${gridId}-${artifact.label}`}
            className={`group relative flex flex-col items-start gap-1.5 rounded-xl border p-2.5 text-left transition-colors ${
              hasItems
                ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
                : "border-border/50 bg-muted/30 hover:bg-muted hover:border-border"
            }`}
          >
            <Icon className={`size-4 ${hasItems ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
            <span className={`truncate text-xs font-medium ${hasItems ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
              {artifact.label}
            </span>
            {artifact.unread > 0 && (
              <span className="absolute top-2.5 right-2.5 size-3 rounded-full bg-primary" />
            )}
            {!hasItems && (
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
