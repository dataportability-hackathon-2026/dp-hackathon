"use client"

import { useEffect, useId, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  type Node,
  type Edge,
  Position,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  type Artifact,
  type ArtifactType,
  type AudioArtifact,
  type DataTableArtifact,
  type DataTableRow,
  type FlashcardArtifact,
  type InfographicArtifact,
  type MindMapArtifact,
  type QuizArtifact,
  type ReportArtifact,
  type SlideArtifact,
  type ManimArtifact,
  type VideoArtifact,
  artifactTypeLabel,
} from "./artifact-store"
import { useDataStore } from "@/lib/data-store"
import { DevArtifactToolbar } from "./dev-artifact-toolbar"

// Lazy load heavy 3D/map components — these pull in three.js, deck.gl, maplibre
const SpatialCard = dynamic(
  () => import("./spatial-card").then((m) => ({ default: m.SpatialCard })),
  { loading: () => <HeavyArtifactFallback label="3D scene" />, ssr: false },
)
const GeoCard = dynamic(
  () => import("./geo-card").then((m) => ({ default: m.GeoCard })),
  { loading: () => <HeavyArtifactFallback label="map" />, ssr: false },
)

function HeavyArtifactFallback({ label }: { label: string }) {
  return (
    <Card>
      <CardContent className="flex h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading {label}…</p>
      </CardContent>
    </Card>
  )
}

// ── Main Canvas ──

export function ArtifactCanvas({
  activeType,
  scrollToId,
  onClose,
}: {
  activeType: ArtifactType
  scrollToId?: string | null
  onClose: () => void
}) {
  const artifacts = useDataStore((s) =>
    Array.from(s.artifacts.values()).filter((a) => a.type === activeType)
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollToId && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-artifact-id="${scrollToId}"]`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [scrollToId])

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon-xs" onClick={onClose} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold">
          {artifactTypeLabel(activeType)}
        </span>
        <Badge variant="outline" className="ml-auto text-xs">
          {artifacts.length} item{artifacts.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {process.env.NODE_ENV === "development" && (
        <DevArtifactToolbar activeType={activeType} />
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {artifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                No {artifactTypeLabel(activeType).toLowerCase()} artifacts yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Ask the agent to create one, or click "Create" in the sidebar.
              </p>
            </div>
          ) : (
            artifacts.map((artifact) => (
              <div
                key={artifact.id}
                data-artifact-id={artifact.id}
                className="scroll-mt-4"
              >
                <ArtifactRenderer artifact={artifact} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ── Router ──

function ArtifactRenderer({ artifact }: { artifact: Artifact }) {
  switch (artifact.type) {
    case "video":
      return <VideoCard artifact={artifact} />
    case "audio":
      return <AudioCard artifact={artifact} />
    case "mindmap":
      return <MindMapCard artifact={artifact} />
    case "quiz":
      return <QuizCard artifact={artifact} />
    case "datatable":
      return <DataTableCard artifact={artifact} />
    case "flashcards":
      return <FlashcardCard artifact={artifact} />
    case "report":
      return <ReportCard artifact={artifact} />
    case "infographic":
      return <InfographicCard artifact={artifact} />
    case "slidedeck":
      return <SlideCard artifact={artifact} />
    case "spatial":
      return <SpatialCard artifact={artifact} />
    case "manim":
      return <ManimCard artifact={artifact} />
    case "geo":
      return <GeoCard artifact={artifact} />
  }
}

// ── Video ──

function VideoCard({ artifact }: { artifact: VideoArtifact }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
          setPlaying(true)
        } else {
          video.pause()
          setPlaying(false)
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(!playing)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative overflow-hidden rounded-lg bg-black">
          <video
            ref={videoRef}
            src={artifact.videoUrl}
            className="aspect-video w-full"
            playsInline
            muted
            onEnded={() => setPlaying(false)}
            data-testid={`video-${artifact.id}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon-lg"
              className="bg-black/50 text-white hover:bg-black/70"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="size-6" /> : <Play className="size-6" />}
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{artifact.duration}</span>
          <span>{artifact.createdAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Audio ──

function AudioCard({ artifact }: { artifact: AudioArtifact }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <Volume2 className="size-5 shrink-0 text-primary" />
          <div className="flex-1">
            <audio
              src={artifact.audioUrl}
              controls
              className="w-full"
              data-testid={`audio-${artifact.id}`}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{artifact.duration}</span>
          <span>{artifact.createdAt}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Mind Map (React Flow) ──

function buildFlowGraph(artifact: MindMapArtifact) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const childrenMap: Record<string, string[]> = {}
  const rootIds: string[] = []

  for (const n of artifact.nodes) {
    if (n.parentId) {
      if (!childrenMap[n.parentId]) childrenMap[n.parentId] = []
      childrenMap[n.parentId].push(n.id)
    } else {
      rootIds.push(n.id)
    }
  }

  // Simple tree layout
  const xGap = 200
  const yGap = 80
  let yCounter = 0

  function layout(nodeId: string, depth: number) {
    const nodeData = artifact.nodes.find((n) => n.id === nodeId)
    if (!nodeData) return
    const children = childrenMap[nodeId] || []

    if (children.length === 0) {
      nodes.push({
        id: nodeId,
        data: { label: nodeData.label },
        position: { x: depth * xGap, y: yCounter * yGap },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: depth === 0 ? "#3b82f6" : "#f1f5f9",
          color: depth === 0 ? "white" : "#334155",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: depth === 0 ? "600" : "500",
        },
      })
      yCounter++
    } else {
      const startY = yCounter
      for (const childId of children) {
        layout(childId, depth + 1)
        edges.push({
          id: `e-${nodeId}-${childId}`,
          source: nodeId,
          target: childId,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: "#94a3b8" },
        })
      }
      const endY = yCounter - 1
      const midY = ((startY + endY) / 2) * yGap
      nodes.push({
        id: nodeId,
        data: { label: nodeData.label },
        position: { x: depth * xGap, y: midY },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
          background: depth === 0 ? "#3b82f6" : "#f1f5f9",
          color: depth === 0 ? "white" : "#334155",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "8px 16px",
          fontSize: "13px",
          fontWeight: depth === 0 ? "600" : "500",
        },
      })
    }
  }

  for (const rid of rootIds) {
    layout(rid, 0)
  }

  return { nodes, edges }
}

const LazyReactFlow = dynamic(
  () => import("@xyflow/react").then((m) => ({ default: m.ReactFlow })),
  { ssr: false },
)
const LazyBackground = dynamic(
  () => import("@xyflow/react").then((m) => ({ default: m.Background })),
  { ssr: false },
)
const LazyControls = dynamic(
  () => import("@xyflow/react").then((m) => ({ default: m.Controls })),
  { ssr: false },
)

function MindMapCard({ artifact }: { artifact: MindMapArtifact }) {
  const { nodes, edges } = buildFlowGraph(artifact)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] rounded-lg border" data-testid={`mindmap-${artifact.id}`}>
          <LazyReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <LazyBackground />
            <LazyControls />
          </LazyReactFlow>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-right">
          {artifact.createdAt}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Quiz ──

function QuizCard({ artifact }: { artifact: QuizArtifact }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(false)
  const listId = useId()

  const handleAnswer = (questionId: string, optionIndex: number) => {
    if (showResults) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const score = artifact.questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctIndex ? 1 : 0)
  }, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{artifact.title}</CardTitle>
            <CardDescription>{artifact.description}</CardDescription>
          </div>
          {showResults && (
            <Badge variant={score >= artifact.questions.length * 0.7 ? "default" : "secondary"}>
              {score}/{artifact.questions.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6" data-testid={`quiz-${artifact.id}`}>
        {artifact.questions.map((q, qi) => (
          <div key={`${listId}-${q.id}`} className="space-y-2">
            <p className="text-sm font-medium">
              {qi + 1}. {q.question}
            </p>
            <div className="grid gap-1.5">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi
                const isCorrect = oi === q.correctIndex
                let optClass = "border-border hover:bg-muted"
                if (showResults && selected && isCorrect) {
                  optClass = "border-green-500 bg-green-50 dark:bg-green-950"
                } else if (showResults && selected && !isCorrect) {
                  optClass = "border-red-500 bg-red-50 dark:bg-red-950"
                } else if (showResults && isCorrect) {
                  optClass = "border-green-300 bg-green-50/50 dark:bg-green-950/50"
                } else if (selected) {
                  optClass = "border-primary bg-primary/5"
                }
                return (
                  <button
                    type="button"
                    key={`${listId}-${q.id}-opt-${oi}`}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-sm transition-colors ${optClass}`}
                    onClick={() => handleAnswer(q.id, oi)}
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span>{opt}</span>
                    {showResults && selected && isCorrect && (
                      <CheckCircle2 className="ml-auto size-4 text-green-600" />
                    )}
                    {showResults && selected && !isCorrect && (
                      <XCircle className="ml-auto size-4 text-red-600" />
                    )}
                  </button>
                )
              })}
            </div>
            {showResults && answers[q.id] !== undefined && (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                {q.explanation}
              </p>
            )}
          </div>
        ))}
        <Button
          className="w-full"
          onClick={() => setShowResults(true)}
          disabled={
            showResults ||
            Object.keys(answers).length < artifact.questions.length
          }
        >
          {showResults ? `Score: ${score}/${artifact.questions.length}` : "Submit Answers"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Data Table ──

function DataTableCard({ artifact }: { artifact: DataTableArtifact }) {
  const columns: ColumnDef<DataTableRow>[] = artifact.columns.map((col) => ({
    accessorKey: col.key,
    header: col.label,
  }))

  const table = useReactTable({
    data: artifact.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent data-testid={`datatable-${artifact.id}`}>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b bg-muted/50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 tabular-nums">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-right">
          {artifact.createdAt}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Flashcards ──

function FlashcardCard({ artifact }: { artifact: FlashcardArtifact }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const card = artifact.cards[currentIndex]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{artifact.title}</CardTitle>
            <CardDescription>{artifact.description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {currentIndex + 1}/{artifact.cards.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent data-testid={`flashcards-${artifact.id}`}>
        <button
          type="button"
          className="flex min-h-[160px] w-full items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all hover:border-primary/50"
          onClick={() => setFlipped(!flipped)}
        >
          <p className={`text-sm ${flipped ? "font-normal text-muted-foreground" : "font-medium"}`}>
            {flipped ? card.back : card.front}
          </p>
        </button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Click card to flip
        </p>
        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => { setCurrentIndex(currentIndex - 1); setFlipped(false) }}
          >
            <ChevronLeft className="size-4" data-icon="inline-start" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === artifact.cards.length - 1}
            onClick={() => { setCurrentIndex(currentIndex + 1); setFlipped(false) }}
          >
            Next
            <ChevronRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Report ──

function ReportCard({ artifact }: { artifact: ReportArtifact }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4" data-testid={`report-${artifact.id}`}>
        {artifact.sections.map((section) => (
          <div key={section.heading}>
            <h4 className="mb-1 text-sm font-semibold">{section.heading}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
        <div className="text-xs text-muted-foreground text-right">
          {artifact.createdAt}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Infographic ──

function InfographicCard({ artifact }: { artifact: InfographicArtifact }) {
  const statId = useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent data-testid={`infographic-${artifact.id}`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {artifact.stats.map((stat) => (
            <div
              key={`${statId}-${stat.label}`}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center"
            >
              <div className={`size-3 rounded-full ${stat.color}`} />
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-muted-foreground text-right">
          {artifact.createdAt}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Slide Deck ──

function SlideCard({ artifact }: { artifact: SlideArtifact }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = artifact.slides[currentSlide]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{artifact.title}</CardTitle>
            <CardDescription>{artifact.description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Slide {currentSlide + 1}/{artifact.slides.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent data-testid={`slidedeck-${artifact.id}`}>
        <div className="flex min-h-[200px] flex-col justify-center rounded-xl border bg-gradient-to-br from-background to-muted p-6">
          <h3 className="mb-4 text-lg font-bold">{slide.title}</h3>
          <ul className="space-y-2">
            {slide.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(currentSlide - 1)}
          >
            <ChevronLeft className="size-4" data-icon="inline-start" />
            Prev
          </Button>
          <div className="flex gap-1">
            {artifact.slides.map((_, i) => (
              <button
                type="button"
                key={`slide-dot-${i}`}
                aria-label={`Go to slide ${i + 1}`}
                className={`size-2 rounded-full transition-colors ${
                  i === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentSlide === artifact.slides.length - 1}
            onClick={() => setCurrentSlide(currentSlide + 1)}
          >
            Next
            <ChevronRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Manim ──

function ManimCard({ artifact }: { artifact: ManimArtifact }) {
  const [showCode, setShowCode] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{artifact.title}</CardTitle>
        <CardDescription>{artifact.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {artifact.videoUrl && (
          <div className="overflow-hidden rounded-lg border bg-black">
            <video
              src={artifact.videoUrl}
              controls
              className="w-full"
              preload="metadata"
            />
          </div>
        )}
        <div>
          <button
            type="button"
            onClick={() => setShowCode(!showCode)}
            className="mb-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCode ? "Hide" : "Show"} source code
          </button>
          {showCode && (
            <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 text-xs leading-relaxed">
              <code>{artifact.code}</code>
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
