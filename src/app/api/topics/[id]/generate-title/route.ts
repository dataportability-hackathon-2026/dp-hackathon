import { generateText } from "ai";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source, topic } from "@/db/schema";
import { openai } from "@/lib/ai/provider";
import { getEffectiveUserId } from "@/lib/impersonate";
import { slugify } from "@/lib/topics";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/topics/[id]/generate-title — AI-generate a title from source filenames */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const [topicRow] = await db
    .select()
    .from(topic)
    .where(and(eq(topic.id, id), eq(topic.userId, userId)));
  if (!topicRow)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Get source filenames for this topic
  const sources = await db
    .select({ filename: source.filename })
    .from(source)
    .where(eq(source.topicSlug, topicRow.slug));

  if (sources.length === 0) {
    return NextResponse.json(
      { error: "No sources to generate title from" },
      { status: 400 },
    );
  }

  const filenames = sources.map((s) => s.filename).join(", ");

  const { text: generatedName } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `Given these uploaded file names for a learning topic, suggest a concise topic title (2-4 words, no quotes):\n\nFiles: ${filenames}`,
  });

  const name = generatedName.trim().replace(/^["']|["']$/g, "");
  const suffix = topicRow.slug.split("-").pop();
  const newSlug = `${slugify(name)}-${suffix}`;

  const [updated] = await db
    .update(topic)
    .set({ name, slug: newSlug, updatedAt: new Date() })
    .where(eq(topic.id, id))
    .returning();

  return NextResponse.json({ topic: updated, generatedName: name });
}
