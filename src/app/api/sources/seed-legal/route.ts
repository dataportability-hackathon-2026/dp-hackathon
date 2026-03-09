import { readFileSync } from "node:fs";
import { join } from "node:path";
import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source, topic } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

// ─── Mapping from topicSlug → case filenames ────────────────────────────────

const CASE_FILES_BY_TOPIC: Record<string, string[]> = {
  "constitutional-law": [
    "marbury-v-madison.md",
    "brown-v-board-of-education.md",
    "miranda-v-arizona.md",
    "roe-v-wade.md",
    "obergefell-v-hodges.md",
    "mcculloch-v-maryland.md",
    "gibbons-v-ogden.md",
    "new-york-times-v-sullivan.md",
    "texas-v-johnson.md",
    "dc-v-heller.md",
  ],
  "data-privacy-law": [
    "carpenter-v-united-states.md",
    "riley-v-california.md",
    "katz-v-united-states.md",
    "gdpr-article-20-data-portability.md",
    "kyllo-v-united-states.md",
    "smith-v-maryland.md",
    "united-states-v-jones.md",
  ],
  "intellectual-property": [
    "oracle-v-google.md",
    "alice-corp-v-cls-bank.md",
    "mayo-v-prometheus.md",
    "sony-v-universal.md",
    "diamond-v-chakrabarty.md",
    "ebay-v-mercexchange.md",
  ],
  "tort-law": [
    "palsgraf-v-long-island-railroad.md",
    "liebeck-v-mcdonalds.md",
    "macpherson-v-buick.md",
    "donoghue-v-stevenson.md",
    "escola-v-coca-cola.md",
  ],
  "criminal-law": [
    "gideon-v-wainwright.md",
    "terry-v-ohio.md",
    "mapp-v-ohio.md",
    "batson-v-kentucky.md",
    "brady-v-maryland.md",
    "strickland-v-washington.md",
    "weeks-v-united-states.md",
  ],
};

const ALL_FILES = Object.values(CASE_FILES_BY_TOPIC).flat();

export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { topicSlug?: string };
  const topicSlug = body.topicSlug;
  if (!topicSlug) {
    return NextResponse.json(
      { error: "topicSlug is required" },
      { status: 400 },
    );
  }

  const filenames =
    topicSlug in CASE_FILES_BY_TOPIC
      ? CASE_FILES_BY_TOPIC[topicSlug]
      : ALL_FILES;

  const results: Array<{ filename: string; status: "created" | "skipped" }> =
    [];

  for (const filename of filenames) {
    // Check for duplicate
    const existing = await db
      .select({ id: source.id })
      .from(source)
      .where(
        and(
          eq(source.userId, userId),
          eq(source.topicSlug, topicSlug),
          eq(source.filename, filename),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      results.push({ filename, status: "skipped" });
      continue;
    }

    const blobUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/datasets/legal/${filename}`;

    const filePath = join(process.cwd(), "public/datasets/legal", filename);
    const fileBuffer = readFileSync(filePath);
    const sizeBytes = fileBuffer.length;

    await db.insert(source).values({
      userId,
      topicSlug,
      filename,
      mimeType: "text/markdown",
      sizeBytes,
      blobUrl,
    });

    results.push({ filename, status: "created" });
  }

  // Update topic.sourceCount
  const [countResult] = await db
    .select({ total: sql<number>`count(*)` })
    .from(source)
    .where(and(eq(source.userId, userId), eq(source.topicSlug, topicSlug)));

  await db
    .update(topic)
    .set({ sourceCount: Number(countResult.total), updatedAt: new Date() })
    .where(eq(topic.slug, topicSlug));

  return NextResponse.json({ results });
}
