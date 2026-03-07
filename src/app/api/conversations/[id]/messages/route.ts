import { and, asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversation, message } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/conversations/[id]/messages — load messages for a conversation */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  // Verify ownership
  const [conv] = await db
    .select()
    .from(conversation)
    .where(
      and(eq(conversation.id, conversationId), eq(conversation.userId, userId)),
    );

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(asc(message.timestamp));

  return NextResponse.json(rows);
}

type MessageBody = {
  messages: Array<{
    id: string;
    role: string;
    text: string;
    modality: string;
    timestamp: number;
  }>;
};

/** POST /api/conversations/[id]/messages — batch-save messages */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  // Verify ownership
  const [conv] = await db
    .select()
    .from(conversation)
    .where(
      and(eq(conversation.id, conversationId), eq(conversation.userId, userId)),
    );

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { messages } = (await req.json()) as MessageBody;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  const values = messages.map((m) => ({
    id: m.id,
    conversationId,
    role: m.role,
    text: m.text,
    modality: m.modality,
    timestamp: m.timestamp,
  }));

  await db
    .insert(message)
    .values(values)
    .onConflictDoNothing({ target: message.id });

  // Bump conversation updatedAt
  await db
    .update(conversation)
    .set({ updatedAt: new Date() })
    .where(eq(conversation.id, conversationId));

  return NextResponse.json({ saved: values.length });
}
