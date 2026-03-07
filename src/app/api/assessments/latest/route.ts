import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { assessment } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [latest] = await db
    .select()
    .from(assessment)
    .where(
      and(eq(assessment.userId, userId), eq(assessment.status, "completed")),
    )
    .orderBy(desc(assessment.createdAt))
    .limit(1);

  if (!latest)
    return NextResponse.json(
      { error: "No completed assessment" },
      { status: 404 },
    );

  return NextResponse.json({
    ...latest,
    responses: latest.responses ? JSON.parse(latest.responses) : null,
    fingerprint: latest.fingerprint ? JSON.parse(latest.fingerprint) : null,
  });
}
