import { put } from "@vercel/blob";
import { generateObject, generateText } from "ai";
import OpenAI from "openai";
import { loadSourceContent } from "@/lib/sources/load-sources";
import { prompts } from "./prompts";
import { model } from "./provider";
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

export type AudioArtifactData = {
  title: string;
  description: string;
  audioUrl: string;
  duration: string;
};

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
  const { object } = await generateObject({
    model: model("openai/gpt-4o-mini"),
    schema: QuizArtifactSchema,
    prompt: prompts.quizGeneration({ ...input, sourceContent }),
  });
  return object;
}

export async function generateFlashcards(
  input: ArtifactInput,
): Promise<FlashcardArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const { object } = await generateObject({
    model: model("openai/gpt-4o-mini"),
    schema: FlashcardArtifactSchema,
    prompt: prompts.flashcardGeneration({ ...input, sourceContent }),
  });
  return object;
}

export async function generateMindMap(
  input: ArtifactInput,
): Promise<MindMapArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const { object } = await generateObject({
    model: model("openai/gpt-4o-mini"),
    schema: MindMapArtifactSchema,
    prompt: prompts.mindmapGeneration({ ...input, sourceContent }),
  });
  return object;
}

export async function generateSlides(
  input: ArtifactInput,
): Promise<SlideArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const { object } = await generateObject({
    model: model("openai/gpt-4o-mini"),
    schema: SlideArtifactSchema,
    prompt: prompts.slideGeneration({ ...input, sourceContent }),
  });
  return object;
}

export async function generateSpatial(
  input: ArtifactInput,
): Promise<SpatialArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const { object } = await generateObject({
    model: model("openai/gpt-4o-mini"),
    schema: SpatialArtifactSchema,
    prompt: prompts.spatialGeneration({ ...input, sourceContent }),
  });
  return object;
}

export async function generateAudio(
  input: ArtifactInput,
): Promise<AudioArtifactData> {
  const sourceContent = await resolveSourceContent(input);

  // Step 1: Generate the spoken lesson script
  const scriptResult = await generateText({
    model: model("openai/gpt-4o-mini"),
    prompt: prompts.audioScriptGeneration({ ...input, sourceContent }),
  });
  const script = scriptResult.text.trim();
  if (!script) throw new Error("Failed to generate audio script");

  // Step 2: Convert script to speech (OpenAI TTS, ~150 wpm → ~4 min for 600 words)
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const ttsResponse = await openaiClient.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: script,
  });

  const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());

  // Step 3: Upload to Vercel Blob
  const filename = `audio-lesson-${Date.now()}.mp3`;
  const blob = await put(filename, audioBuffer, {
    access: "public",
    contentType: "audio/mpeg",
  });

  // Estimate duration from word count (~150 words per minute)
  const wordCount = script.split(/\s+/).length;
  const totalSeconds = Math.round((wordCount / 150) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const duration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return {
    title: `Audio Lesson: ${input.subject}`,
    description: "Structured lesson: intro → core concepts → summary",
    audioUrl: blob.url,
    duration,
  };
}

export type { ArtifactInput };
