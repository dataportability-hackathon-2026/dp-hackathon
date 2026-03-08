import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import {
  type ArtifactInput,
  generateFlashcards,
  generateMindMap,
  generateQuiz,
  generateSlides,
} from "@/lib/ai/generate-artifact";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function POST(req: Request) {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type, input, topicSlug } = body as {
    type: string;
    input: ArtifactInput;
    topicSlug?: string;
  };

  // Look up source IDs for this topic so the AI can read the uploaded content
  let sourceIds: string[] | undefined;
  if (topicSlug) {
    const sources = await db
      .select({ id: source.id })
      .from(source)
      .where(and(eq(source.topicSlug, topicSlug), eq(source.userId, userId)));
    if (sources.length > 0) {
      sourceIds = sources.map((s) => s.id);
    }
  }

  const enrichedInput: ArtifactInput = { ...input, sourceIds, userId };

  try {
    switch (type) {
      case "flashcards": {
        const data = await generateFlashcards(enrichedInput);
        return NextResponse.json({ type: "flashcards", data });
      }
      case "quiz": {
        const data = await generateQuiz(enrichedInput);
        return NextResponse.json({ type: "quiz", data });
      }
      case "mindmap": {
        const data = await generateMindMap(enrichedInput);
        return NextResponse.json({ type: "mindmap", data });
      }
      case "slidedeck": {
        const data = await generateSlides(enrichedInput);
        return NextResponse.json({ type: "slidedeck", data });
      }
      default:
        return NextResponse.json(
          { error: `Unknown type: ${type}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
