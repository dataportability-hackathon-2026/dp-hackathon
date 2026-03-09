import { put } from "@vercel/blob";
import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source, topic } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

function mimeForFilename(filename: string): string {
  if (filename.endsWith(".jsonl")) return "application/x-ndjson";
  if (filename.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const topicSlug = formData.get("topicSlug") as string | null;
  const categoriesRaw = formData.get("categories") as string | null;

  if (!topicSlug)
    return NextResponse.json(
      { error: "topicSlug is required" },
      { status: 400 },
    );

  if (!categoriesRaw)
    return NextResponse.json(
      { error: "categories is required" },
      { status: 400 },
    );

  const categories = JSON.parse(categoriesRaw) as string[];

  const results: Array<{ id: string; filename: string; error?: string }> = [];

  for (const categoryId of categories) {
    const file = formData.get(categoryId) as File | null;
    if (!file) continue;

    const filename = file.name;
    const mimeType = mimeForFilename(filename);
    const pathname = `sources/${userId}/${topicSlug}/${filename}`;

    try {
      const blob = await put(pathname, file, {
        access: "public",
        addRandomSuffix: true,
      });

      const [row] = await db
        .insert(source)
        .values({
          userId,
          topicSlug,
          filename,
          mimeType,
          sizeBytes: file.size,
          blobUrl: blob.url,
        })
        .returning();

      results.push({ id: row.id, filename });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown upload error";
      results.push({ id: "", filename, error: message });
    }
  }

  // Update source count on topic
  const successCount = results.filter((r) => r.id).length;
  if (successCount > 0) {
    const [topicRow] = await db
      .select()
      .from(topic)
      .where(eq(topic.slug, topicSlug));

    if (topicRow) {
      const [countResult] = await db
        .select({ total: sql<number>`count(*)` })
        .from(source)
        .where(and(eq(source.userId, userId), eq(source.topicSlug, topicSlug)));

      await db
        .update(topic)
        .set({ sourceCount: Number(countResult.total), updatedAt: new Date() })
        .where(eq(topic.id, topicRow.id));
    }
  }

  return NextResponse.json({ results });
}
