import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { setImpersonation, clearImpersonation } from "@/lib/impersonate";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (rows[0]?.role !== "admin") return null;
  return session;
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as { userId: string };
  if (!body.userId)
    return NextResponse.json({ error: "userId required" }, { status: 400 });

  // Verify target user exists
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, body.userId))
    .limit(1);

  if (!rows[0])
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  await setImpersonation(body.userId);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await clearImpersonation();
  return NextResponse.json({ success: true });
}
