import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { addCredits, getBalance } from "@/lib/credits";
import { getEffectiveUserId } from "@/lib/impersonate";

const DEMO_EMAILS = [
  "priya@university.edu",
  "marcus@risd.edu",
  "maya@stanford.edu",
];

const MIN_DEMO_BALANCE = 30_000; // 30 display credits

export async function POST() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify this is a demo persona
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const email = rows[0]?.email;
  if (!email || !DEMO_EMAILS.includes(email)) {
    return NextResponse.json({ error: "Not a demo persona" }, { status: 403 });
  }

  const currentBalance = await getBalance(userId);
  if (currentBalance >= MIN_DEMO_BALANCE) {
    return NextResponse.json({
      success: true,
      balance: currentBalance,
      displayCredits: currentBalance / 1000,
    });
  }

  const topUp = MIN_DEMO_BALANCE - currentBalance;
  const result = await addCredits(
    userId,
    topUp,
    "adjustment",
    "Demo persona credit top-up to 30",
  );

  return NextResponse.json({
    success: true,
    balance: result.newBalance,
    displayCredits: result.newBalance / 1000,
  });
}
