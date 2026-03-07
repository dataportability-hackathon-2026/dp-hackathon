"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dataStore } from "@/lib/data-store";
import type { ArtifactType, FlashcardArtifact } from "./artifact-store";

type DevToolConfig = {
  label: string;
  type: ArtifactType;
  defaultInput: {
    subject: string;
    concepts: string[];
    priorKnowledgeLevel: string;
    goalType: string;
  };
};

const DEV_TOOLS: DevToolConfig[] = [
  {
    label: "Generate Flashcards",
    type: "flashcards",
    defaultInput: {
      subject: "Linear Algebra",
      concepts: ["Eigenvalues", "Eigenvectors", "Diagonalization"],
      priorKnowledgeLevel: "intermediate",
      goalType: "exam prep",
    },
  },
];

export function DevArtifactToolbar({
  activeType,
}: {
  activeType: ArtifactType;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tools = DEV_TOOLS.filter((t) => t.type === activeType);

  if (tools.length === 0) return null;

  async function handleGenerate(tool: DevToolConfig) {
    setLoading(tool.type);
    setError(null);

    try {
      const res = await fetch("/api/dev/generate-artifact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tool.type, input: tool.defaultInput }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const result = await res.json();

      if (tool.type === "flashcards") {
        const artifact: FlashcardArtifact = {
          id: `dev-fc-${Date.now()}`,
          type: "flashcards",
          title: result.data.title,
          description: result.data.description,
          cards: result.data.cards,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        dataStore.addArtifact(artifact);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-dashed border-amber-500/40 bg-amber-50/50 px-4 py-2 dark:bg-amber-950/20">
      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
        DEV
      </span>
      {tools.map((tool) => (
        <Button
          key={tool.type}
          variant="outline"
          size="sm"
          disabled={loading !== null}
          onClick={() => handleGenerate(tool)}
          className="h-7 gap-1.5 border-amber-300 text-xs dark:border-amber-700"
        >
          {loading === tool.type ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {tool.label}
        </Button>
      ))}
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
}
