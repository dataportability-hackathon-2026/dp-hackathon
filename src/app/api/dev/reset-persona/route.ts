import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  user,
  account,
  session,
  conversation,
  creditPurchase,
  creditLedger,
  usageLog,
  source,
  project,
} from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * DEV ONLY: Delete a stale demo persona account so it can be re-created
 * with a fresh password hash. This handles the case where accounts were
 * created in a previous DB (e.g. SQLite) and password hashes don't match.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 });
  }

  const { email } = (await req.json()) as { email: string };
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Find the user
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));

  if (!existing) {
    return NextResponse.json({ deleted: false });
  }

  const uid = existing.id;

  // Delete all FK-dependent records, then user
  await db.delete(conversation).where(eq(conversation.userId, uid));
  await db.delete(source).where(eq(source.userId, uid));
  await db.delete(project).where(eq(project.userId, uid));
  await db.delete(usageLog).where(eq(usageLog.userId, uid));
  await db.delete(creditLedger).where(eq(creditLedger.userId, uid));
  await db.delete(creditPurchase).where(eq(creditPurchase.userId, uid));
  await db.delete(session).where(eq(session.userId, uid));
  await db.delete(account).where(eq(account.userId, uid));
  await db.delete(user).where(eq(user.id, uid));

  return NextResponse.json({ deleted: true });
}
