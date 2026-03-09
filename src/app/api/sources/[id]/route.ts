import { del } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { source } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

/** DELETE /api/sources/:id */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [row] = await db
    .select()
    .from(source)
    .where(and(eq(source.id, id), eq(source.userId, userId)));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await del(row.blobUrl);
  await db
    .delete(source)
    .where(and(eq(source.id, id), eq(source.userId, userId)));

  return NextResponse.json({ ok: true });
}

/** PATCH /api/sources/:id — rename */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const filename = body.filename as string | undefined;
  const excluded = body.excluded as boolean | undefined;

  const updates: { filename?: string; excluded?: boolean; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (typeof filename === "string") {
    if (filename.trim().length === 0)
      return NextResponse.json(
        { error: "filename is required" },
        { status: 400 },
      );
    updates.filename = filename.trim();
  }

  if (typeof excluded === "boolean") {
    updates.excluded = excluded;
  }

  if (!updates.filename && updates.excluded === undefined)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const [row] = await db
    .update(source)
    .set(updates)
    .where(and(eq(source.id, id), eq(source.userId, userId)))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ source: row });
}
