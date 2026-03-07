import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scheduledTask } from "@/db/schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const existing = await db
    .select()
    .from(scheduledTask)
    .where(eq(scheduledTask.id, id))
    .limit(1);

  if (!existing[0]) {
    return Response.json({ error: "Schedule not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (body.intervalHours) {
    updates.intervalMs = body.intervalHours * 60 * 60 * 1000;
  }
  if (body.status) {
    updates.status = body.status;
  }
  if (body.maxExecutions) {
    updates.maxExecutions = body.maxExecutions;
  }
  if (body.message) {
    const payload = existing[0].payload ? JSON.parse(existing[0].payload) : {};
    payload.message = body.message;
    updates.payload = JSON.stringify(payload);
  }

  await db.update(scheduledTask).set(updates).where(eq(scheduledTask.id, id));

  return Response.json({ id, updated: Object.keys(updates) });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const existing = await db
    .select()
    .from(scheduledTask)
    .where(eq(scheduledTask.id, id))
    .limit(1);

  if (!existing[0]) {
    return Response.json({ error: "Schedule not found" }, { status: 404 });
  }

  await db
    .update(scheduledTask)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(scheduledTask.id, id));

  return Response.json({ id, status: "cancelled" });
}
