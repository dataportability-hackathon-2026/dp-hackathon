import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getBalance } from "@/lib/credits";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const balance = await getBalance(userId);

  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  const unlimited = rows[0]?.role === "admin";

  return NextResponse.json({
    balance,
    displayCredits: balance / 1000,
    unlimited,
  });
}
