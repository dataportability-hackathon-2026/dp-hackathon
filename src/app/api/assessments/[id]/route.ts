import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { LearningProfileData } from "@/components/learning-profile-form";
import { db } from "@/db";
import { assessment } from "@/db/schema";
import { generateFingerprint } from "@/lib/assessments/generate-fingerprint";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [row] = await db
    .select()
    .from(assessment)
    .where(and(eq(assessment.id, id), eq(assessment.userId, userId)));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...row,
    responses: row.responses ? JSON.parse(row.responses) : null,
    fingerprint: row.fingerprint ? JSON.parse(row.fingerprint) : null,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify ownership
  const [existing] = await db
    .select()
    .from(assessment)
    .where(and(eq(assessment.id, id), eq(assessment.userId, userId)));

  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.currentStep !== undefined) {
    updates.currentStep = body.currentStep;
  }

  if (body.responses !== undefined) {
    // Merge partial responses with existing
    const existingResponses = existing.responses
      ? JSON.parse(existing.responses)
      : {};
    const merged = { ...existingResponses, ...body.responses };
    updates.responses = JSON.stringify(merged);
  }

  if (body.status === "completed") {
    updates.status = "completed";
    updates.completedAt = new Date();

    // Generate fingerprint from the final responses
    const finalResponses = body.responses
      ? {
          ...(existing.responses ? JSON.parse(existing.responses) : {}),
          ...body.responses,
        }
      : existing.responses
        ? JSON.parse(existing.responses)
        : {};

    // Also save the final merged responses
    updates.responses = JSON.stringify(finalResponses);

    try {
      const fingerprint = await generateFingerprint(
        finalResponses as LearningProfileData,
      );
      updates.fingerprint = JSON.stringify(fingerprint);
    } catch (e) {
      console.error("Failed to generate fingerprint:", e);
      // Still complete the assessment, just without a fingerprint
    }
  }

  const [updated] = await db
    .update(assessment)
    .set(updates)
    .where(eq(assessment.id, id))
    .returning();

  return NextResponse.json({
    ...updated,
    responses: updated.responses ? JSON.parse(updated.responses) : null,
    fingerprint: updated.fingerprint ? JSON.parse(updated.fingerprint) : null,
  });
}
