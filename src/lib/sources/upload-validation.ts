// ─── Shared upload validation constants & helpers ───────────────────────────

export const MAX_FILE_SIZE_DEFAULT = 50 * 1024 * 1024; // 50 MB
export const MAX_FILE_SIZE_MEDIA = 500 * 1024 * 1024; // 500 MB for audio/video
export const MAX_STORAGE_PER_USER = 2 * 1024 * 1024 * 1024; // 2 GB total
export const MAX_FILENAME_LENGTH = 255;

export const BLOCKED_EXTENSIONS = new Set([
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

const MEDIA_EXTENSIONS = new Set([
  "mp3",
  "m4a",
  "wav",
  "ogg",
  "flac",
  "aac",
  "wma",
  "mp4",
  "webm",
  "mov",
  "avi",
  "mkv",
  "m4v",
  "wmv",
]);

export function extFromName(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function isMediaFile(filename: string): boolean {
  return MEDIA_EXTENSIONS.has(extFromName(filename));
}

export function maxSizeForFile(filename: string): number {
  return isMediaFile(filename) ? MAX_FILE_SIZE_MEDIA : MAX_FILE_SIZE_DEFAULT;
}

/** Sanitize filename — strip path traversal, null bytes, control chars */
export function sanitizeFilename(name: string): string {
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

/**
 * Validate a filename for upload. Returns an error string or null if valid.
 * This runs on the server during token generation (before upload starts).
 */
export function validateFilename(filename: string): string | null {
  const safe = sanitizeFilename(filename);
  const ext = extFromName(safe);

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return `Blocked file type: .${ext}`;
  }

  // Check double extensions (e.g. "report.pdf.exe")
  const parts = safe.split(".");
  if (parts.length > 2) {
    const hasBlockedInner = parts
      .slice(1, -1)
      .some((p) => BLOCKED_EXTENSIONS.has(p.toLowerCase()));
    if (hasBlockedInner) {
      return "Suspicious double extension";
    }
  }

  return null;
}

/** Allowed content types for Vercel Blob client uploads */
export const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/epub+zip",
  "application/json",
  "application/xml",
  "application/x-ndjson",
  "text/*",
  "image/*",
  "audio/*",
  "video/*",
];
