"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dataStore } from "@/lib/data-store";
import type {
  ArtifactType,
  FlashcardArtifact,
  MindMapArtifact,
  QuizArtifact,
  SlideArtifact,
} from "./artifact-store";

/** Types this dev toolbar can generate */
const SUPPORTED_TYPES = new Set<ArtifactType>([
  "flashcards",
  "quiz",
  "mindmap",
  "slidedeck",
]);

const TYPE_LABEL: Partial<Record<ArtifactType, string>> = {
  flashcards: "Generate Flashcards",
  quiz: "Generate Quiz",
  mindmap: "Generate Mind Map",
  slidedeck: "Generate Slides",
};

export function DevArtifactToolbar({
  activeType,
  topicSlug,
  topicName,
  topicConcepts,
}: {
  activeType: ArtifactType;
  topicSlug?: string;
  topicName?: string;
  topicConcepts?: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          topicSlug,
          input: {
            subject: topicName ?? "Unknown topic",
            concepts: topicConcepts ?? [],
            priorKnowledgeLevel: "intermediate",
            goalType: "mastery",
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json();

      if (activeType === "flashcards") {
        const artifact: FlashcardArtifact = {
          id: `dev-fc-${Date.now()}`,
          type: "flashcards",
          topicSlug,
          title: result.data.title,
          description: result.data.description,
          cards: result.data.cards,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        dataStore.addArtifact(artifact);
      } else if (activeType === "quiz") {
        const artifact: QuizArtifact = {
          id: `dev-quiz-${Date.now()}`,
          type: "quiz",
          topicSlug,
          title: result.data.title,
          description: result.data.description,
          questions: result.data.questions,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        dataStore.addArtifact(artifact);
      } else if (activeType === "mindmap") {
        const artifact: MindMapArtifact = {
          id: `dev-mm-${Date.now()}`,
          type: "mindmap",
          topicSlug,
          title: result.data.title,
          description: result.data.description,
          nodes: result.data.nodes,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        dataStore.addArtifact(artifact);
      } else if (activeType === "slidedeck") {
        const artifact: SlideArtifact = {
          id: `dev-slide-${Date.now()}`,
          type: "slidedeck",
          topicSlug,
          title: result.data.title,
          description: result.data.description,
          slides: result.data.slides,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        dataStore.addArtifact(artifact);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-dashed border-amber-500/40 bg-amber-50/50 px-4 py-2 dark:bg-amber-950/20">
      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
        DEV
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={handleGenerate}
        className="h-7 gap-1.5 border-amber-300 text-xs dark:border-amber-700"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Sparkles className="size-3" />
        )}
        {TYPE_LABEL[activeType] ?? `Generate ${activeType}`}
      </Button>
      {topicName && (
        <span className="truncate text-xs text-amber-600 dark:text-amber-500">
          {topicName}
        </span>
      )}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
