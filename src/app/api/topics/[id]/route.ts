import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { topic } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";
import { slugify } from "@/lib/topics";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/topics/[id] */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const [row] = await db.select().from(topic).where(eq(topic.id, id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Allow viewing community topics or own topics
  if (!row.isCommunity && row.userId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ topic: row });
}

/** PATCH /api/topics/[id] */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    name?: string;
    domain?: string;
    icon?: string;
    isFavorite?: boolean;
  };

  // Verify ownership
  const [existing] = await db
    .select()
    .from(topic)
    .where(and(eq(topic.id, id), eq(topic.userId, userId)));
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) {
    updates.name = body.name;
    const suffix = existing.slug.split("-").pop();
    updates.slug = `${slugify(body.name)}-${suffix}`;
  }
  if (body.domain !== undefined) updates.domain = body.domain;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.isFavorite !== undefined) updates.isFavorite = body.isFavorite;

  const [updated] = await db
    .update(topic)
    .set(updates)
    .where(eq(topic.id, id))
    .returning();

  return NextResponse.json({ topic: updated });
}

/** DELETE /api/topics/[id] */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const [existing] = await db
    .select()
    .from(topic)
    .where(and(eq(topic.id, id), eq(topic.userId, userId)));
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(topic).where(eq(topic.id, id));
  return NextResponse.json({ ok: true });
}
