import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { CREDIT_PACKS, type CreditPackSlug } from "@/lib/credit-packs";
import { db } from "@/db";
import { user, creditPurchase } from "@/db/schema";
import { eq } from "drizzle-orm";

const checkoutSchema = z.object({
  packSlug: z.enum(
    Object.keys(CREDIT_PACKS) as [CreditPackSlug, ...CreditPackSlug[]],
  ),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const { packSlug } = parsed.data;
  const pack = CREDIT_PACKS[packSlug];

  // Get or create Stripe customer
  const dbUsers = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let stripeCustomerId = dbUser.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: dbUser.email,
      metadata: { userId },
    });
    stripeCustomerId = customer.id;
    await db
      .update(user)
      .set({ stripeCustomerId })
      .where(eq(user.id, userId));
  }

  const baseUrl =
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pack.priceCents,
          product_data: { name: pack.label },
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/dashboard?checkout=cancel`,
    metadata: { userId, packSlug },
  });

  await db.insert(creditPurchase).values({
    userId,
    stripeCheckoutSessionId: checkoutSession.id,
    packSlug,
    creditAmount: pack.credits,
    priceCents: pack.priceCents,
    status: "pending",
  });

  return NextResponse.json({ checkoutUrl: checkoutSession.url });
}
