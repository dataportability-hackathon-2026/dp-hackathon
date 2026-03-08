"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dataStore } from "@/lib/data-store";
import type {
  ArtifactType,
  FlashcardArtifact,
  MindMapArtifact,
  MindMapNode,
  QuizArtifact,
  SlideArtifact,
  SpatialArtifact,
} from "./artifact-store";

// Fallback input used only when no topic data is available
const FALLBACK_INPUT = {
  subject: "General Study",
  concepts: ["Core Concepts", "Key Principles", "Applications"],
  priorKnowledgeLevel: "intermediate",
  goalType: "deep understanding",
  calibrationAccuracy: "well-calibrated",
  cognitiveLoadRisk: "medium",
  metacognitiveAwareness: "medium",
  coachingTone: "encouraging",
} as const;

// Which artifact types have a generate button
const SUPPORTED_TYPES = new Set<ArtifactType>([
  "flashcards",
  "quiz",
  "mindmap",
  "slidedeck",
  "spatial",
]);

const TYPE_LABELS: Partial<Record<ArtifactType, string>> = {
  flashcards: "Flashcards",
  quiz: "Quiz",
  mindmap: "Mind Map",
  slidedeck: "Slide Deck",
  spatial: "3D Spatial",
};

export function DevArtifactToolbar({
  activeType,
  topicSlug,
  topicName,
  topicConcepts,
}: {
  activeType: ArtifactType;
  /** Slug of the current topic — passed to the API so it can read uploaded sources */
  topicSlug?: string;
  /** Human-readable topic name used as the AI "subject" */
  topicName?: string;
  /** Concept list from the topic's mastery data */
  topicConcepts?: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show for supported types
  if (!SUPPORTED_TYPES.has(activeType)) return null;

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/dev/generate-artifact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeType,
          input: {
            ...FALLBACK_INPUT,
            subject: topicName ?? FALLBACK_INPUT.subject,
            concepts:
              topicConcepts && topicConcepts.length > 0
                ? topicConcepts
                : FALLBACK_INPUT.concepts,
          },
          topicSlug,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `HTTP ${res.status}`,
        );
      }

      const result = await res.json() as { type: string; data: Record<string, unknown> };
      const now = new Date().toISOString().slice(0, 10);

      if (activeType === "flashcards") {
        const data = result.data as FlashcardArtifact;
        dataStore.addArtifact({
          id: `gen-fc-${Date.now()}`,
          type: "flashcards",
          topicSlug,
          title: data.title,
          description: data.description,
          cards: data.cards,
          createdAt: now,
        });
      } else if (activeType === "quiz") {
        const data = result.data as QuizArtifact;
        dataStore.addArtifact({
          id: `gen-quiz-${Date.now()}`,
          type: "quiz",
          topicSlug,
          title: data.title,
          description: data.description,
          questions: data.questions,
          createdAt: now,
        });
      } else if (activeType === "mindmap") {
        const raw = result.data as { title: string; description: string; nodes: Array<{ id: string; label: string; parentId: string | null }> };
        // Normalize null parentId → undefined for the renderer
        const nodes: MindMapNode[] = raw.nodes.map((n) => ({
          id: n.id,
          label: n.label,
          ...(n.parentId != null ? { parentId: n.parentId } : {}),
        }));
        const artifact: MindMapArtifact = {
          id: `gen-mm-${Date.now()}`,
          type: "mindmap",
          topicSlug,
          title: raw.title,
          description: raw.description,
          nodes,
          createdAt: now,
        };
        dataStore.addArtifact(artifact);
      } else if (activeType === "slidedeck") {
        const data = result.data as SlideArtifact;
        dataStore.addArtifact({
          id: `gen-sd-${Date.now()}`,
          type: "slidedeck",
          topicSlug,
          title: data.title,
          description: data.description,
          slides: data.slides,
          createdAt: now,
        });
      } else if (activeType === "spatial") {
        const raw = result.data as {
          title: string;
          description: string;
          autoRotate: boolean | null;
          connections: Array<{ from: string; to: string; color: string | null }> | null;
          objects: Array<{ id: string; label: string; shape: SpatialArtifact["objects"][number]["shape"]; x: number; y: number; z: number; color: string; scale: number | null; rotate: boolean | null }>;
        };
        const artifact: SpatialArtifact = {
          id: `gen-sp-${Date.now()}`,
          type: "spatial",
          topicSlug,
          title: raw.title,
          description: raw.description,
          autoRotate: raw.autoRotate ?? true,
          connections: raw.connections?.map((c) => ({ from: c.from, to: c.to, color: c.color ?? undefined })),
          objects: raw.objects.map((obj) => ({
            id: obj.id,
            label: obj.label,
            shape: obj.shape,
            position: [obj.x, obj.y, obj.z],
            color: obj.color,
            scale: obj.scale ?? undefined,
            rotate: obj.rotate ?? undefined,
          })),
          createdAt: now,
        };
        dataStore.addArtifact(artifact);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  const label = TYPE_LABELS[activeType] ?? activeType;

  return (
    <div className="flex items-center gap-2 border-b px-4 py-2 bg-muted/30">
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleGenerate}
        className="h-7 gap-1.5 text-xs"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Sparkles className="size-3" />
        )}
        {loading ? `Generating ${label}...` : `Generate ${label} with AI`}
      </Button>
      {error && (
        <span className="text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
