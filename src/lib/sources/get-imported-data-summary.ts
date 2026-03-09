import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { source } from "@/db/schema";
import { extractSourceContent } from "@/lib/sources/extract-content";

const PERSONA_FILE_PATTERNS = [
  "conversations.jsonl",
  "calendar.jsonl",
  "lifelog.jsonl",
  "email.jsonl",
  "financial.jsonl",
  "social.jsonl",
  "files_metadata.jsonl",
  "persona_profile.json",
];

interface DateRange {
  earliest: string;
  latest: string;
}

function tryExtractDateRange(content: string): DateRange | null {
  try {
    const lines = content.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return null;

    const first = JSON.parse(lines[0]) as Record<string, unknown>;
    const last = JSON.parse(lines[lines.length - 1]) as Record<string, unknown>;

    const firstDate = (first.date ?? first.timestamp) as string | undefined;
    const lastDate = (last.date ?? last.timestamp) as string | undefined;

    if (firstDate && lastDate) {
      return { earliest: String(firstDate), latest: String(lastDate) };
    }
    return null;
  } catch {
    return null;
  }
}

function labelForFilename(filename: string): string {
  const map: Record<string, string> = {
    "conversations.jsonl": "AI conversation sessions",
    "calendar.jsonl": "calendar events",
    "lifelog.jsonl": "lifelog entries",
    "email.jsonl": "email messages",
    "financial.jsonl": "financial records",
    "social.jsonl": "social media entries",
    "files_metadata.jsonl": "file metadata records",
    "persona_profile.json": "persona profile",
  };
  return map[filename] ?? filename;
}

export async function getImportedDataSummary(
  userId: string,
  topicSlug: string,
): Promise<string> {
  const sources = await db
    .select()
    .from(source)
    .where(and(eq(source.userId, userId), eq(source.topicSlug, topicSlug)));

  const personaSources = sources.filter((s) =>
    PERSONA_FILE_PATTERNS.includes(s.filename),
  );
  const regularSources = sources.filter(
    (s) => !PERSONA_FILE_PATTERNS.includes(s.filename),
  );

  if (personaSources.length === 0) {
    return "";
  }

  const bulletPoints: string[] = [];

  for (const src of personaSources) {
    try {
      const content = await extractSourceContent(
        src.blobUrl,
        src.mimeType,
        src.filename,
      );

      if (src.filename.endsWith(".jsonl")) {
        const lineCount = content.split("\n").filter((l) => l.trim()).length;
        const dateRange = tryExtractDateRange(content);
        const label = labelForFilename(src.filename);
        const rangeStr = dateRange
          ? ` (${dateRange.earliest} to ${dateRange.latest})`
          : "";
        bulletPoints.push(`- ${lineCount} ${label}${rangeStr}`);
      } else {
        bulletPoints.push(`- ${labelForFilename(src.filename)}`);
      }
    } catch {
      // Skip sources whose content can't be fetched
    }
  }

  if (regularSources.length > 0) {
    bulletPoints.push(
      `- ${regularSources.length} uploaded study material${regularSources.length === 1 ? "" : "s"}`,
    );
  }

  if (bulletPoints.length === 0) {
    return "";
  }

  return `

## Imported Data Context
The learner has imported:
${bulletPoints.join("\n")}

Use these data sources to personalize recommendations. Reference specific patterns when relevant.`;
}
