import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { source } from "@/db/schema";
import { extractSourceContent } from "./extract-content";

const MAX_TOTAL_CHARS = 50_000;

export async function loadSourceContent(
  sourceIds: string[],
  userId: string,
): Promise<string> {
  if (sourceIds.length === 0) return "";

  const sources = await db
    .select({
      id: source.id,
      filename: source.filename,
      mimeType: source.mimeType,
      blobUrl: source.blobUrl,
    })
    .from(source)
    .where(and(inArray(source.id, sourceIds), eq(source.userId, userId)));

  if (sources.length === 0) return "";

  const parts: string[] = [];
  let totalLength = 0;

  for (const s of sources) {
    if (totalLength >= MAX_TOTAL_CHARS) break;

    const content = await extractSourceContent(
      s.blobUrl,
      s.mimeType,
      s.filename,
    );
    if (!content) continue;

    const section = `### Source: ${s.filename}\n\n${content}`;
    parts.push(section);
    totalLength += section.length;
  }

  const combined = parts.join("\n\n---\n\n");
  if (combined.length > MAX_TOTAL_CHARS) {
    return `${combined.slice(0, MAX_TOTAL_CHARS)}\n\n[Source content truncated at ${MAX_TOTAL_CHARS} characters]`;
  }
  return combined;
}
