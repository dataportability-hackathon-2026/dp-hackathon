import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { promoCode, promoCodeRedemption } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { addCredits } from "@/lib/credits";

type RedeemBody = {
  code: string;
};

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = (await request.json()) as RedeemBody;
  const code = body.code?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json(
      { error: "Promo code is required" },
      { status: 400 },
    );
  }

  // Find the promo code
  const [promo] = await db
    .select()
    .from(promoCode)
    .where(eq(promoCode.code, code))
    .limit(1);

  if (!promo) {
    return NextResponse.json(
      { error: "Invalid promo code" },
      { status: 404 },
    );
  }

  if (!promo.active) {
    return NextResponse.json(
      { error: "This promo code is no longer active" },
      { status: 410 },
    );
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This promo code has expired" },
      { status: 410 },
    );
  }

  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json(
      { error: "This promo code has reached its usage limit" },
      { status: 410 },
    );
  }

  // Check if user already redeemed this code
  const [existing] = await db
    .select({ id: promoCodeRedemption.id })
    .from(promoCodeRedemption)
    .where(
      and(
        eq(promoCodeRedemption.userId, userId),
        eq(promoCodeRedemption.promoCodeId, promo.id),
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "You've already redeemed this promo code" },
      { status: 409 },
    );
  }

  // Redeem: add credits, record redemption, increment used count
  const result = await addCredits(
    userId,
    promo.creditAmount,
    "promo",
    `Promo code: ${promo.code}`,
    promo.id,
  );

  await db.insert(promoCodeRedemption).values({
    userId,
    promoCodeId: promo.id,
    creditAmount: promo.creditAmount,
  });

  await db
    .update(promoCode)
    .set({ usedCount: sql`${promoCode.usedCount} + 1` })
    .where(eq(promoCode.id, promo.id));

  return NextResponse.json({
    success: true,
    creditsAdded: promo.creditAmount / 1000,
    newBalance: result.newBalance / 1000,
  });
}
