const MAX_CHARS = 30_000;

const TEXT_EXTENSIONS = new Set([
  ".md",
  ".txt",
  ".csv",
  ".tsv",
  ".log",
  ".json",
]);

function isTextMime(mimeType: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  );
}

function isTextFilename(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

export async function extractSourceContent(
  blobUrl: string,
  mimeType: string,
  filename: string,
): Promise<string> {
  if (!isTextMime(mimeType) && !isTextFilename(filename)) {
    if (mimeType === "application/pdf") {
      return "[PDF content extraction not yet supported — plain text and markdown files are supported]";
    }
    return "";
  }

  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch source content from ${blobUrl}: ${response.status}`,
    );
  }

  const text = await response.text();
  if (text.length > MAX_CHARS) {
    return `${text.slice(0, MAX_CHARS)}\n\n[Content truncated at ${MAX_CHARS} characters]`;
  }
  return text;
}
