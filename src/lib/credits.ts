import { db } from "@/db";
import { user, creditLedger, creditPurchase } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getBalance(userId: string): Promise<number> {
  const result = await db
    .select({ creditBalance: user.creditBalance })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return result[0]?.creditBalance ?? 0;
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string,
): Promise<{ success: true; newBalance: number } | { success: false }> {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(user)
      .set({
        creditBalance: sql`${user.creditBalance} - ${amount}`,
      })
      .where(
        sql`${user.id} = ${userId} AND ${user.creditBalance} >= ${amount}`,
      )
      .returning({ creditBalance: user.creditBalance });

    if (updated.length === 0) {
      return { success: false as const };
    }

    const newBalance = updated[0].creditBalance ?? 0;

    await tx.insert(creditLedger).values({
      userId,
      amount: -amount,
      type: "debit",
      description,
      referenceId,
      balanceAfter: newBalance,
    });

    return { success: true as const, newBalance };
  });
}

export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "refund" | "adjustment",
  description: string,
  referenceId?: string,
): Promise<{ success: true; newBalance: number }> {
  return db.transaction(async (tx) => {
    const updated = await tx
      .update(user)
      .set({
        creditBalance: sql`${user.creditBalance} + ${amount}`,
      })
      .where(eq(user.id, userId))
      .returning({ creditBalance: user.creditBalance });

    const newBalance = updated[0].creditBalance ?? 0;

    await tx.insert(creditLedger).values({
      userId,
      amount,
      type,
      description,
      referenceId,
      balanceAfter: newBalance,
    });

    return { success: true as const, newBalance };
  });
}

export async function completePurchase(
  checkoutSessionId: string,
): Promise<void> {
  const rows = await db
    .select()
    .from(creditPurchase)
    .where(eq(creditPurchase.stripeCheckoutSessionId, checkoutSessionId))
    .limit(1);

  const purchase = rows[0];
  if (!purchase || purchase.status === "completed") {
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(creditPurchase)
      .set({ status: "completed" })
      .where(eq(creditPurchase.id, purchase.id));

    const updated = await tx
      .update(user)
      .set({
        creditBalance: sql`${user.creditBalance} + ${purchase.creditAmount}`,
      })
      .where(eq(user.id, purchase.userId))
      .returning({ creditBalance: user.creditBalance });

    const newBalance = updated[0].creditBalance ?? 0;

    await tx.insert(creditLedger).values({
      userId: purchase.userId,
      amount: purchase.creditAmount,
      type: "purchase",
      description: `Purchased ${purchase.packSlug} pack`,
      referenceId: purchase.id,
      balanceAfter: newBalance,
    });
  });
}
