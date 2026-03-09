import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

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
