import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

// ─── Limits ─────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_MEDIA = 500 * 1024 * 1024; // 500 MB for audio/video
const MAX_STORAGE_PER_USER = 2 * 1024 * 1024 * 1024; // 2 GB total
const MAX_FILENAME_LENGTH = 255;

// ─── Blocked extensions — executables and dangerous files ───────────────────

const BLOCKED_EXTENSIONS = new Set([
  "exe",
  "msi",
  "bat",
  "cmd",
  "com",
  "scr",
  "pif",
  "vbs",
  "vbe",
  "js",
  "jse",
  "ws",
  "wsf",
  "wsc",
  "wsh",
  "ps1",
  "ps2",
  "psc1",
  "psc2",
  "msh",
  "msh1",
  "msh2",
  "inf",
  "reg",
  "dll",
  "sys",
  "cpl",
  "hta",
  "apk",
  "app",
  "dmg",
  "iso",
  "bin",
  "sh",
  "bash",
  "lnk",
  "jar",
  "war",
]);

function extFromName(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

/** Sanitize filename — strip path traversal, null bytes, control chars */
function sanitizeFilename(name: string): string {
  return (
    name
      .replace(/[/\\]/g, "_") // no path separators
      .replace(/\.\./g, "_") // no directory traversal
      .replace(/[\x00-\x1f]/g, "") // no control characters
      .replace(/^\.+/, "") // no leading dots (hidden files)
      .slice(0, MAX_FILENAME_LENGTH)
      .trim() || "unnamed"
  );
}

/** Get total storage used by a user */
async function getUserStorageUsed(userId: string): Promise<number> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${source.sizeBytes}), 0)` })
    .from(source)
    .where(eq(source.userId, userId));
  return Number(result.total);
}

/** GET /api/sources?topicSlug=xxx */
export async function GET(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const topicSlug = req.nextUrl.searchParams.get("topicSlug");
  if (!topicSlug)
    return NextResponse.json(
      { error: "topicSlug is required" },
      { status: 400 },
    );

  const rows = await db
    .select()
    .from(source)
    .where(and(eq(source.userId, userId), eq(source.topicSlug, topicSlug)));

  return NextResponse.json({ sources: rows });
}

/**
 * POST /api/sources
 *
 * Uses Vercel Blob client-side upload pattern to avoid multipart body
 * parsing issues in Next.js App Router. The browser uploads the file
 * directly to Vercel Blob; this route only handles:
 *   1. Token generation  (type: "blob.generate-client-token")
 *   2. Upload completion (type: "blob.upload-completed") → creates DB record
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload ?? "{}") as {
          topicSlug?: string;
          projectId?: string;
          size?: number;
        };

        const topicSlug = payload.topicSlug;
        if (!topicSlug) throw new Error("topicSlug is required");

        const safeName = sanitizeFilename(
          pathname.split("/").pop() ?? pathname,
        );
        const ext = extFromName(safeName);

        // Block dangerous extensions
        if (BLOCKED_EXTENSIONS.has(ext))
          throw new Error(`Blocked file type: .${ext}`);

        // Check double extensions (e.g. "report.pdf.exe")
        const parts = safeName.split(".");
        if (parts.length > 2) {
          const hasBlockedInner = parts
            .slice(1, -1)
            .some((p) => BLOCKED_EXTENSIONS.has(p.toLowerCase()));
          if (hasBlockedInner) throw new Error("Suspicious double extension");
        }

        // Check storage quota
        const fileSize = payload.size ?? 0;
        const storageUsed = await getUserStorageUsed(userId);
        if (storageUsed + fileSize > MAX_STORAGE_PER_USER) {
          const usedMB = Math.round(storageUsed / 1024 / 1024);
          const limitMB = Math.round(MAX_STORAGE_PER_USER / 1024 / 1024);
          throw new Error(
            `Storage quota exceeded (${usedMB} MB used of ${limitMB} MB)`,
          );
        }

        return {
          maximumSizeInBytes: MAX_FILE_SIZE_MEDIA,
          // tokenPayload is passed through to onUploadCompleted — used to
          // carry userId and file metadata since the completion callback
          // runs outside the user's request context in production.
          tokenPayload: JSON.stringify({
            userId,
            topicSlug,
            projectId: payload.projectId ?? null,
            filename: safeName,
            sizeBytes: fileSize,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const parsed = JSON.parse(tokenPayload ?? "{}") as {
          userId: string;
          topicSlug: string;
          projectId: string | null;
          filename: string;
          sizeBytes: number;
        };

        await db.insert(source).values({
          userId: parsed.userId,
          projectId: parsed.projectId,
          topicSlug: parsed.topicSlug,
          filename: parsed.filename,
          mimeType: blob.contentType ?? "application/octet-stream",
          sizeBytes: parsed.sizeBytes,
          blobUrl: blob.url,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Upload failed" },
      { status: 400 },
    );
  }
}
