import { NextResponse } from "next/server";
import { db } from "@/db";
import { creditLedger } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { addCredits } from "@/lib/credits";
import { getEffectiveUserId } from "@/lib/impersonate";

const FREE_CREDIT_AMOUNT = 20_000; // 20 display credits (stored as 1000x)

export async function POST() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user already claimed free credits
  const existing = await db
    .select({ id: creditLedger.id })
    .from(creditLedger)
    .where(
      and(
        eq(creditLedger.userId, userId),
        eq(creditLedger.type, "free_claim"),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Free credits already claimed" },
      { status: 409 },
    );
  }

  const result = await addCredits(
    userId,
    FREE_CREDIT_AMOUNT,
    "adjustment",
    "Free 20 credits claim",
  );

  // Mark as claimed by inserting a separate ledger entry with type "free_claim"
  await db.insert(creditLedger).values({
    userId,
    amount: 0,
    type: "free_claim",
    description: "Free credits claim marker",
    balanceAfter: result.newBalance,
  });

  return NextResponse.json({
    success: true,
    newBalance: result.newBalance,
    displayCredits: result.newBalance / 1000,
  });
}
