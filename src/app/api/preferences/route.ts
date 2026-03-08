import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";
import {
  DEFAULT_PREFERENCES,
  type UserPreferences,
} from "@/lib/preferences-store";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (!rows[0]) {
    return NextResponse.json(DEFAULT_PREFERENCES);
  }

  const stored = JSON.parse(rows[0].preferences) as Partial<UserPreferences>;
  return NextResponse.json({ ...DEFAULT_PREFERENCES, ...stored });
}

export async function PUT(req: Request) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Partial<UserPreferences>;

  // Validate and merge with defaults
  const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, ...body };

  const existing = await db
    .select({ id: userPreferences.id })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(userPreferences)
      .set({
        preferences: JSON.stringify(prefs),
        templateId: prefs.templateId,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.userId, userId));
  } else {
    await db.insert(userPreferences).values({
      userId,
      preferences: JSON.stringify(prefs),
      templateId: prefs.templateId,
    });
  }

  return NextResponse.json(prefs);
}
