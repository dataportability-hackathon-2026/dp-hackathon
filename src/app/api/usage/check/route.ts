import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { checkAffordability } from "@/lib/usage";

const checkSchema = z.object({
  estimatedCredits: z.number(),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await request.json();
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
