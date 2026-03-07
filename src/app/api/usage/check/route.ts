import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { checkAffordability } from "@/lib/usage";
import { getEffectiveUserId } from "@/lib/impersonate";

const checkSchema = z.object({
  estimatedCredits: z.number(),
});

export async function POST(request: Request) {
  const [userId, body] = await Promise.all([
    getEffectiveUserId(),
    request.json(),
  ]);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = checkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await checkAffordability(userId, parsed.data.estimatedCredits);

  return NextResponse.json(result);
}
