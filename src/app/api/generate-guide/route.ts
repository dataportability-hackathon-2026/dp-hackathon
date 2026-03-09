import { NextResponse } from "next/server";
import { generateGuideForUser } from "@/lib/ai/generate-guide";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function POST(req: Request) {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicSlug, topicName } = (await req.json()) as {
    topicSlug: string;
    topicName?: string;
  };

  if (!topicSlug) {
    return NextResponse.json(
      { error: "topicSlug is required" },
      { status: 400 },
    );
  }

  const guide = await generateGuideForUser({ userId, topicSlug, topicName });

  return NextResponse.json(guide);
}
