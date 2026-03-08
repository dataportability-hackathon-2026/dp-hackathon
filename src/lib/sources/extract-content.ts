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

async function extractPdfText(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from ${blobUrl}: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const { getDocumentProxy, extractText } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text;
}

export async function extractSourceContent(
  blobUrl: string,
  mimeType: string,
  filename: string,
): Promise<string> {
  let text: string;

  if (mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
    try {
      text = await extractPdfText(blobUrl);
    } catch (err) {
      console.error("PDF extraction failed:", err);
      return "";
    }
  } else if (isTextMime(mimeType) || isTextFilename(filename)) {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch source content from ${blobUrl}: ${response.status}`,
      );
    }
    text = await response.text();
  } else {
    return "";
  }

  if (text.length > MAX_CHARS) {
    return `${text.slice(0, MAX_CHARS)}\n\n[Content truncated at ${MAX_CHARS} characters]`;
  }
  return text;
}
