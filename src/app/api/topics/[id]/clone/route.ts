import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { topic } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";
import { slugify } from "@/lib/topics";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/topics/[id]/clone — Clone a community topic into user's own topics */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const [source] = await db.select().from(topic).where(eq(topic.id, id));
  if (!source)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const clonedName = `${source.name} (Copy)`;
  const suffix = crypto.randomUUID().slice(0, 8);
  const slug = `${slugify(clonedName)}-${suffix}`;

  const [cloned] = await db
    .insert(topic)
    .values({
      userId,
      name: clonedName,
      slug,
      domain: source.domain,
      parentGroup: source.parentGroup,
      icon: source.icon,
      isCommunity: false,
      sourceCount: 0,
    })
    .returning();

  return NextResponse.json({ topic: cloned });
}
