import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source, topic } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";
import { MAX_STORAGE_PER_USER } from "@/lib/sources/upload-validation";

/**
 * POST /api/sources/register
 *
 * Called by the client immediately after a successful Vercel Blob
 * client-side upload. Creates the DB record and updates the topic's
 * sourceCount so the file appears in the list right away.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    blobUrl: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    topicSlug: string;
    projectId?: string | null;
  };

  const { blobUrl, filename, mimeType, sizeBytes, topicSlug, projectId } = body;

  if (!blobUrl || !filename || !topicSlug) {
    return NextResponse.json(
      { error: "blobUrl, filename, and topicSlug are required" },
      { status: 400 },
    );
  }

  // Guard against duplicate registrations (e.g. if onUploadCompleted also fires)
  const existing = await db
    .select({ id: source.id })
    .from(source)
    .where(and(eq(source.userId, userId), eq(source.blobUrl, blobUrl)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ source: existing[0] });
  }

  // Check quota
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${source.sizeBytes}), 0)` })
    .from(source)
    .where(eq(source.userId, userId));

  if (Number(result.total) + sizeBytes > MAX_STORAGE_PER_USER) {
    const usedMB = Math.round(Number(result.total) / 1024 / 1024);
    const limitMB = Math.round(MAX_STORAGE_PER_USER / 1024 / 1024);
    return NextResponse.json(
      { error: `Storage quota exceeded (${usedMB} MB used of ${limitMB} MB)` },
      { status: 413 },
    );
  }

  const [row] = await db
    .insert(source)
    .values({
      userId,
      projectId: projectId ?? null,
      topicSlug,
      filename,
      mimeType: mimeType || "application/octet-stream",
      sizeBytes,
      blobUrl,
    })
    .returning();

  // Update sourceCount on the topic
  const [topicRow] = await db
    .select({ id: topic.id, name: topic.name })
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

    // Auto-generate title if topic is still "Untitled"
    if (topicRow.name === "Untitled") {
      try {
        const titleRes = await fetch(
          new URL(
            `/api/topics/${topicRow.id}/generate-title`,
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          ),
          { method: "POST", headers: { cookie: "" } },
        );
        if (titleRes.ok) {
          const titleData = (await titleRes.json()) as {
            generatedName: string;
          };
          return NextResponse.json({
            source: row,
            generatedTitle: titleData.generatedName,
          });
        }
      } catch {
        // Non-critical — title generation failure shouldn't break registration
      }
    }
  }

  return NextResponse.json({ source: row });
}
