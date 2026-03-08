import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getEffectiveUserId } from "@/lib/impersonate";
import {
  type ArtifactInput,
  generateFlashcards,
  generateMindMap,
  generateQuiz,
  generateSlides,
  generateSpatial,
} from "@/lib/ai/generate-artifact";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** MIME types / extensions we can read as plain text */
const TEXT_MIME_PREFIXES = ["text/", "application/json", "application/xml"];
const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "csv", "json", "xml",
  "rst", "org", "tex", "html", "htm",
]);

function isTextFile(mimeType: string, filename: string): boolean {
  if (TEXT_MIME_PREFIXES.some((p) => mimeType.startsWith(p))) return true;
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return TEXT_EXTENSIONS.has(ext);
}

/**
 * Fetch text content from uploaded sources for a given topic.
 * Returns a single string with file excerpts concatenated.
 * Limits to 3 files × 1500 chars each = ~4500 chars total.
 */
async function fetchSourceContext(
  userId: string,
  topicSlug: string,
): Promise<string> {
  const rows = await db
    .select()
    .from(source)
    .where(and(eq(source.userId, userId), eq(source.topicSlug, topicSlug)));

  // Only readable text files
  const textRows = rows
    .filter((r) => isTextFile(r.mimeType, r.filename))
    .slice(0, 3);

  if (textRows.length === 0) return "";

  const excerpts = await Promise.all(
    textRows.map(async (row) => {
      try {
        const res = await fetch(row.blobUrl, { next: { revalidate: 0 } });
        if (!res.ok) return null;
        const text = await res.text();
        const excerpt = text.slice(0, 1500).trim();
        return `### ${row.filename}\n${excerpt}${text.length > 1500 ? "\n[…truncated]" : ""}`;
      } catch {
        return null;
      }
    }),
  );

  return excerpts.filter(Boolean).join("\n\n");
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Require auth in production; open in dev for convenience
  if (process.env.NODE_ENV !== "development") {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();
  const {
    type,
    input,
    topicSlug,
  } = body as { type: string; input: ArtifactInput; topicSlug?: string };

  // Enrich the input with text extracted from the learner's uploaded sources
  let enrichedInput: ArtifactInput = { ...input };
  if (topicSlug && !enrichedInput.sourceContext) {
    try {
      const userId = await getEffectiveUserId();
      if (userId) {
        const context = await fetchSourceContext(userId, topicSlug);
        if (context) enrichedInput = { ...enrichedInput, sourceContext: context };
      }
    } catch {
      // Non-fatal: fall back to generic generation without source context
    }
  }

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
      case "spatial": {
        const data = await generateSpatial(enrichedInput);
        return NextResponse.json({ type: "spatial", data });
      }
      default:
        return NextResponse.json(
          { error: `Unknown artifact type: ${type}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
