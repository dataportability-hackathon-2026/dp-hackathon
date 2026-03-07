import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversation } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

/** GET /api/conversations — list user's conversations */
export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(conversation)
    .where(eq(conversation.userId, userId))
    .orderBy(desc(conversation.updatedAt))
    .limit(50);

  return NextResponse.json(rows);
}

/** POST /api/conversations — create a new conversation */
export async function POST(req: Request) {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = (await req.json()) as { title?: string };

  const [row] = await db
    .insert(conversation)
    .values({
      userId,
      title: title ?? "New conversation",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
