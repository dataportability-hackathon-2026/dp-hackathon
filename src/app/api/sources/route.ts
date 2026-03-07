import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { put } from "@vercel/blob";
import { getEffectiveUserId } from "@/lib/impersonate";

// ─── Limits ─────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_DEFAULT = 50 * 1024 * 1024; // 50 MB
const MAX_FILE_SIZE_MEDIA = 500 * 1024 * 1024; // 500 MB for audio/video
const MAX_FILES_PER_REQUEST = 20;
const MAX_STORAGE_PER_USER = 2 * 1024 * 1024 * 1024; // 2 GB total
const MAX_FILENAME_LENGTH = 255;

// ─── Blocked extensions — executables and dangerous files ───────────────────

const BLOCKED_EXTENSIONS = new Set([
  "exe", "msi", "bat", "cmd", "com", "scr", "pif", "vbs", "vbe",
  "js", "jse", "ws", "wsf", "wsc", "wsh", "ps1", "ps2", "psc1",
  "psc2", "msh", "msh1", "msh2", "inf", "reg", "dll", "sys",
  "cpl", "hta", "apk", "app", "dmg", "iso", "bin", "sh", "bash",
  "lnk", "jar", "war",
]);

// ─── Magic bytes for content-type validation ────────────────────────────────

const MAGIC_BYTES: Array<{ ext: string; bytes: number[] }> = [
  { ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] },           // %PDF
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47] },           // .PNG
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },                  // JPEG
  { ext: "gif", bytes: [0x47, 0x49, 0x46] },                  // GIF
  { ext: "zip", bytes: [0x50, 0x4b, 0x03, 0x04] },           // ZIP (also docx/xlsx/pptx)
  { ext: "mp3", bytes: [0x49, 0x44, 0x33] },                  // ID3
  { ext: "mp4", bytes: [0x00, 0x00, 0x00] },                  // ftyp (partial)
  { ext: "wav", bytes: [0x52, 0x49, 0x46, 0x46] },           // RIFF
];

// Extensions that are Office Open XML (zip-based) — skip exe-in-zip check
const ZIP_BASED_EXTENSIONS = new Set([
  "docx", "xlsx", "pptx", "odt", "ods", "odp", "epub", "ipynb",
]);

// ─── Dangerous content patterns (embedded in files) ─────────────────────────

const DANGEROUS_PATTERNS = [
  /\x00\x00\x00\x00MZPE/,           // PE executable embedded
  /<script[\s>]/i,                    // HTML script injection
  /javascript:/i,                     // JS protocol
  /\beval\s*\(/,                      // eval() in text files
];

function extFromName(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isMediaFile(filename: string): boolean {
  const ext = extFromName(filename);
  return ["mp3", "m4a", "wav", "ogg", "flac", "aac", "wma",
    "mp4", "webm", "mov", "avi", "mkv", "m4v", "wmv"].includes(ext);
}

/** Sanitize filename — strip path traversal, null bytes, control chars */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\]/g, "_")        // no path separators
    .replace(/\.\./g, "_")         // no directory traversal
    .replace(/[\x00-\x1f]/g, "")   // no control characters
    .replace(/^\.+/, "")            // no leading dots (hidden files)
    .slice(0, MAX_FILENAME_LENGTH)
    .trim() || "unnamed";
}

/** Check if file content matches a known dangerous executable signature */
async function scanFileContent(file: File, ext: string): Promise<string | null> {
  const slice = await file.slice(0, 8192).arrayBuffer();
  const header = new Uint8Array(slice);

  // Check for PE executable magic bytes (MZ header) regardless of extension
  if (header[0] === 0x4d && header[1] === 0x5a) {
    return "File contains executable content";
  }

  // Check for ELF executable (Linux)
  if (header[0] === 0x7f && header[1] === 0x45 && header[2] === 0x4c && header[3] === 0x46) {
    return "File contains executable content";
  }

  // Check for Mach-O executable (macOS)
  if (
    (header[0] === 0xfe && header[1] === 0xed && header[2] === 0xfa) ||
    (header[0] === 0xcf && header[1] === 0xfa && header[2] === 0xed)
  ) {
    return "File contains executable content";
  }

  // For text-like files, scan for dangerous patterns
  const textExts = new Set(["txt", "md", "csv", "tex", "bib", "r", "rmd", "svg", "html", "xml", "json", "yaml", "yml"]);
  if (textExts.has(ext)) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(header);
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(text)) {
        return "File contains potentially dangerous content";
      }
    }
  }

  // For files claiming to be ZIP-based (docx etc), verify they actually start with PK
  if (ZIP_BASED_EXTENSIONS.has(ext)) {
    if (header[0] !== 0x50 || header[1] !== 0x4b) {
      return `File does not match expected .${ext} format`;
    }
  }

  // Verify PDF files actually start with %PDF
  if (ext === "pdf" && !(header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46)) {
    return "File does not match expected PDF format";
  }

  return null; // clean
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
      { status: 400 }
    );

  const rows = await db
    .select()
    .from(source)
    .where(
      and(eq(source.userId, userId), eq(source.topicSlug, topicSlug))
    );

  return NextResponse.json({ sources: rows });
}

/** POST /api/sources — multipart upload */
export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const topicSlug = formData.get("topicSlug") as string | null;
  const projectId = (formData.get("projectId") as string | null) || null;

  if (!topicSlug)
    return NextResponse.json(
      { error: "topicSlug is required" },
      { status: 400 }
    );

  const files = formData.getAll("files") as File[];
  if (files.length === 0)
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  if (files.length > MAX_FILES_PER_REQUEST)
    return NextResponse.json(
      { error: `Too many files (max ${MAX_FILES_PER_REQUEST} per upload)` },
      { status: 400 }
    );

  // Check user storage quota before uploading
  const storageUsed = await getUserStorageUsed(userId);
  const batchSize = files.reduce((sum, f) => sum + f.size, 0);
  if (storageUsed + batchSize > MAX_STORAGE_PER_USER) {
    const usedMB = Math.round(storageUsed / 1024 / 1024);
    const limitMB = Math.round(MAX_STORAGE_PER_USER / 1024 / 1024);
    return NextResponse.json(
      { error: `Storage quota exceeded (${usedMB} MB used of ${limitMB} MB)` },
      { status: 413 }
    );
  }

  const results: Array<{ id: string; filename: string; error?: string }> = [];

  for (const file of files) {
    const safeName = sanitizeFilename(file.name);
    const ext = extFromName(safeName);

    // 1. Block dangerous extensions
    if (BLOCKED_EXTENSIONS.has(ext)) {
      results.push({ id: "", filename: safeName, error: `Blocked file type: .${ext}` });
      continue;
    }

    // 2. Check double extensions (e.g. "report.pdf.exe")
    const parts = safeName.split(".");
    if (parts.length > 2) {
      const hasBlockedInner = parts.slice(1, -1).some((p) => BLOCKED_EXTENSIONS.has(p.toLowerCase()));
      if (hasBlockedInner) {
        results.push({ id: "", filename: safeName, error: "Suspicious double extension" });
        continue;
      }
    }

    // 3. Check file size
    const maxSize = isMediaFile(safeName) ? MAX_FILE_SIZE_MEDIA : MAX_FILE_SIZE_DEFAULT;
    if (file.size > maxSize) {
      results.push({
        id: "",
        filename: safeName,
        error: `File too large (max ${maxSize / 1024 / 1024} MB)`,
      });
      continue;
    }

    // 4. Reject empty files
    if (file.size === 0) {
      results.push({ id: "", filename: safeName, error: "Empty file" });
      continue;
    }

    // 5. Scan file content for malicious signatures
    const scanResult = await scanFileContent(file, ext);
    if (scanResult) {
      results.push({ id: "", filename: safeName, error: scanResult });
      continue;
    }

    // All checks passed — upload to blob storage
    const mime = file.type || "application/octet-stream";
    const pathname = `sources/${userId}/${topicSlug}/${safeName}`;
    const blob = await put(pathname, file, { access: "public" });

    const [row] = await db
      .insert(source)
      .values({
        userId: userId,
        projectId,
        topicSlug,
        filename: safeName,
        mimeType: mime,
        sizeBytes: file.size,
        blobUrl: blob.url,
      })
      .returning();

    results.push({ id: row.id, filename: safeName });
  }

  return NextResponse.json({ results });
}
