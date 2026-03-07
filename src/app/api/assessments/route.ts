import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { assessment } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET(req: Request) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 20), 100);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  const rows = await db
    .select()
    .from(assessment)
    .where(eq(assessment.userId, userId))
    .orderBy(desc(assessment.createdAt))
    .limit(limit)
    .offset(offset);

  const parsed = rows.map((r) => ({
    ...r,
    responses: r.responses ? JSON.parse(r.responses) : null,
    fingerprint: r.fingerprint ? JSON.parse(r.fingerprint) : null,
  }));

  return NextResponse.json(parsed);
}

export async function POST(req: Request) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const type = body.type ?? "full_onboarding";

  // Auto-calculate version
  const [maxRow] = await db
    .select({
      maxVersion: sql<number>`coalesce(max(${assessment.version}), 0)`,
    })
    .from(assessment)
    .where(eq(assessment.userId, userId));

  const version = (maxRow?.maxVersion ?? 0) + 1;

  const [created] = await db
    .insert(assessment)
    .values({
      userId,
      type,
      status: "in_progress",
      version,
      currentStep: 0,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
