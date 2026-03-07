import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { creditPurchase } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const purchases = await db
    .select()
    .from(creditPurchase)
    .where(eq(creditPurchase.userId, userId))
    .orderBy(desc(creditPurchase.createdAt));

  return NextResponse.json({ purchases });
}
