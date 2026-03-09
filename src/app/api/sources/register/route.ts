import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

const MAX_STORAGE_PER_USER = 2 * 1024 * 1024 * 1024; // 2 GB

/**
 * POST /api/sources/register
 *
 * Called by the client immediately after a successful Vercel Blob
 * client-side upload. Creates the DB record synchronously so the file
 * appears in the list right away — without waiting for the async
 * onUploadCompleted webhook (which is unreliable in local dev).
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

  return NextResponse.json({ source: row });
}
