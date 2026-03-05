import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { creditPurchase } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const purchases = await db
    .select()
    .from(creditPurchase)
    .where(eq(creditPurchase.userId, userId))
    .orderBy(desc(creditPurchase.createdAt));

  return NextResponse.json({ purchases });
}
