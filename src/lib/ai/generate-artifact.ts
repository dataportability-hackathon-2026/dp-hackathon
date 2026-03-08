import { generateText, Output } from "ai";
import { loadSourceContent } from "@/lib/sources/load-sources";
import { prompts } from "./prompts";
import { openai } from "./provider";
import type {
  FlashcardArtifactData,
  MindMapArtifactData,
  QuizArtifactData,
  SlideArtifactData,
  SpatialArtifactData,
} from "./schemas";
import {
  FlashcardArtifactSchema,
  MindMapArtifactSchema,
  QuizArtifactSchema,
  SlideArtifactSchema,
  SpatialArtifactSchema,
} from "./schemas";

type ArtifactInput = {
  subject: string;
  concepts: string[];
  priorKnowledgeLevel: string;
  goalType: string;
  sourceIds?: string[];
  sourceContent?: string;
  instructions?: string;
  userId?: string;
};

async function resolveSourceContent(
  input: ArtifactInput,
): Promise<string | undefined> {
  if (input.sourceContent) return input.sourceContent;
  if (input.sourceIds?.length && input.userId) {
    const content = await loadSourceContent(input.sourceIds, input.userId);
    return content || undefined;
  }
  return undefined;
}

export async function generateQuiz(
  input: ArtifactInput,
): Promise<QuizArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: QuizArtifactSchema }),
    prompt: prompts.quizGeneration({ ...input, sourceContent }),
  });
  if (!result.output) {
    throw new Error("Failed to generate quiz");
  }
  return result.output;
}

export async function generateFlashcards(
  input: ArtifactInput,
): Promise<FlashcardArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: FlashcardArtifactSchema }),
    prompt: prompts.flashcardGeneration({ ...input, sourceContent }),
  });
  if (!result.output) {
    throw new Error("Failed to generate flashcards");
  }
  return result.output;
}

export async function generateMindMap(
  input: ArtifactInput,
): Promise<MindMapArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: MindMapArtifactSchema }),
    prompt: prompts.mindmapGeneration({ ...input, sourceContent }),
  });
  if (!result.output) {
    throw new Error("Failed to generate mind map");
  }
  return result.output;
}

export async function generateSlides(
  input: ArtifactInput,
): Promise<SlideArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: SlideArtifactSchema }),
    prompt: prompts.slideGeneration({ ...input, sourceContent }),
  });
  if (!result.output) {
    throw new Error("Failed to generate slides");
  }
  return result.output;
}

export async function generateSpatial(
  input: ArtifactInput,
): Promise<SpatialArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: SpatialArtifactSchema }),
    prompt: prompts.spatialGeneration({ ...input, sourceContent }),
  });
  if (!result.output) {
    throw new Error("Failed to generate spatial model");
  }
  return result.output;
}

export type { ArtifactInput };
