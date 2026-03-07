import { NextResponse } from "next/server";
import { getEffectiveUserId } from "@/lib/impersonate";
import { getUsageHistory } from "@/lib/usage";

export async function GET(request: Request) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);
  const offset = Number(searchParams.get("offset") ?? 0);

  const usage = await getUsageHistory(userId, limit, offset);

  return NextResponse.json({ usage });
}
