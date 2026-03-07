import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { topic, user } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";
import { buildCommunityTopicRows } from "@/lib/seed-community-topics";

/** POST /api/topics/seed — Seed community topics (admin only, idempotent) */
export async function POST() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check admin role
  const [u] = await db.select().from(user).where(eq(user.id, userId));
  if (!u || u.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Check if already seeded
  const existing = await db
    .select({ id: topic.id })
    .from(topic)
    .where(eq(topic.isCommunity, true))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({
      message: "Community topics already seeded",
      count: 0,
    });
  }

  const rows = buildCommunityTopicRows(userId);
  await db.insert(topic).values(rows);

  return NextResponse.json({
    message: "Seeded community topics",
    count: rows.length,
  });
}
