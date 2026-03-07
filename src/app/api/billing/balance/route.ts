import { NextResponse } from "next/server";
import { getBalance } from "@/lib/credits";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const balance = await getBalance(userId);

  return NextResponse.json({ balance, displayCredits: balance / 1000 });
}
