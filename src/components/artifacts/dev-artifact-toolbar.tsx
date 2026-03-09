"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dataStore } from "@/lib/data-store";
import type {
  ArtifactType,
  AudioArtifact,
  FlashcardArtifact,
  MindMapArtifact,
  QuizArtifact,
  RemixArtifact,
  SlideArtifact,
} from "./artifact-store";

/** Types this dev toolbar can generate */
const SUPPORTED_TYPES = new Set<ArtifactType>([
  "flashcards",
  "quiz",
  "mindmap",
  "slidedeck",
  "audio",
  "remix",
]);

const TYPE_LABEL: Partial<Record<ArtifactType, string>> = {
  flashcards: "Generate Flashcards",
  quiz: "Generate Quiz",
  mindmap: "Generate Mind Map",
  slidedeck: "Generate Slides",
  audio: "Generate Audio Lesson",
  remix: "Generate Remix",
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
      } else if (activeType === "audio") {
        const artifact: AudioArtifact = {
          id: `dev-audio-${Date.now()}`,
          type: "audio",
          topicSlug,
          title: result.data.title,
          description: result.data.description,
          audioUrl: result.data.audioUrl,
          duration: result.data.duration,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        dataStore.addArtifact(artifact);
      } else if (activeType === "remix") {
        const artifact: RemixArtifact = {
          id: `dev-remix-${Date.now()}`,
          type: "remix",
          topicSlug,
          title: result.data.title,
          description: result.data.description,
          sections: result.data.sections,
          keyInsights: result.data.keyInsights,
          suggestedNextSteps: result.data.suggestedNextSteps,
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
    <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-2">
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
        {loading
          ? "Generating…"
          : (TYPE_LABEL[activeType] ?? `Generate ${activeType}`)}
      </Button>
      {topicName && (
        <span className="truncate text-xs text-muted-foreground">
          from <span className="font-medium text-foreground">{topicName}</span>
        </span>
      )}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
