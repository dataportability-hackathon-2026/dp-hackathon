import { put } from "@vercel/blob";
import { generateObject, generateText } from "ai";
import OpenAI from "openai";
import { z } from "zod/v4";
import { loadSourceContent } from "@/lib/sources/load-sources";
import { prompts } from "./prompts";
import { model } from "./provider";
import type {
  FlashcardArtifactData,
  MindMapArtifactData,
  QuizArtifactData,
  RemixArtifactData,
  SlideArtifactData,
  SpatialArtifactData,
} from "./schemas";
import {
  FlashcardArtifactSchema,
  MindMapArtifactSchema,
  QuizArtifactSchema,
  RemixArtifactSchema,
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

export async function generateRemix(
  input: ArtifactInput & { profileContext?: string },
): Promise<RemixArtifactData> {
  const sourceContent = await resolveSourceContent(input);
  const { object } = await generateObject({
    model: model("openai/gpt-4o-mini"),
    schema: RemixArtifactSchema,
    prompt: prompts.remixGeneration({
      ...input,
      sourceContent,
      profileContext: input.profileContext,
    }),
  });
  return object;
}

// ── Manim ─────────────────────────────────────────────────────────────────────

export type ManimArtifactData = {
  title: string;
  description: string;
  code: string;
  videoUrl?: string;
  duration?: string;
};

/** Schema for the LLM's structured response when generating Manim code */
const ManimCodeSchema = z.object({
  title: z.string(),
  description: z.string(),
  sceneName: z.string(),
  code: z.string(),
});

export async function generateManim(
  input: ArtifactInput,
): Promise<ManimArtifactData> {
  const sourceContent = await resolveSourceContent(input);

  // ── Step 1: Ask the LLM to write Manim Python code ───────────────────────
  const { object: manimCode } = await generateObject({
    model: model("openai/gpt-4o"), // use gpt-4o for better code quality
    schema: ManimCodeSchema,
    prompt: prompts.manimGeneration({ ...input, sourceContent }),
  });

  // ── Step 2: Send code to Railway render service ───────────────────────────
  const serviceUrl = process.env.MANIM_SERVICE_URL;
  const apiKey = process.env.MANIM_API_KEY ?? "";

  if (!serviceUrl) {
    throw new Error(
      "MANIM_SERVICE_URL is not configured. Add it to your environment variables.",
    );
  }

  const renderRes = await fetch(`${serviceUrl}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "X-Api-Key": apiKey } : {}),
    },
    body: JSON.stringify({
      code: manimCode.code,
      scene: manimCode.sceneName,
      topic_slug: input.subject.toLowerCase().replace(/\s+/g, "-"),
      quality: "low",
    }),
    signal: AbortSignal.timeout(150_000), // 2.5 min hard cap
  });

  if (!renderRes.ok) {
    const errBody = await renderRes.text().catch(() => "");
    throw new Error(
      `Manim render service returned ${renderRes.status}: ${errBody.slice(0, 300)}`,
    );
  }

  // Railway returns raw MP4 bytes — Next.js uploads to Vercel Blob
  const duration = renderRes.headers.get("X-Duration") ?? "unknown";
  const mp4Buffer = Buffer.from(await renderRes.arrayBuffer());
  const filename = `manim-${Date.now()}.mp4`;
  const blob = await put(filename, mp4Buffer, {
    access: "public",
    contentType: "video/mp4",
  });

  return {
    title: manimCode.title,
    description: manimCode.description,
    code: manimCode.code,
    videoUrl: blob.url,
    duration,
  };
}

export type { ArtifactInput };
