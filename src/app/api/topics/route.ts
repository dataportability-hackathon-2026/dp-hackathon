import { eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project, topic } from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";
import { slugify } from "@/lib/topics";

/** GET /api/topics → { userTopics, communityTopics } */
export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectCountSq = db
    .select({
      topicId: project.topicId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(project)
    .groupBy(project.topicId)
    .as("pc");

  const rows = await db
    .select({
      id: topic.id,
      userId: topic.userId,
      name: topic.name,
      slug: topic.slug,
      domain: topic.domain,
      parentGroup: topic.parentGroup,
      icon: topic.icon,
      isCommunity: topic.isCommunity,
      sourceCount: topic.sourceCount,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      projectCount: sql<number>`coalesce(${projectCountSq.count}, 0)`,
    })
    .from(topic)
    .leftJoin(projectCountSq, eq(topic.id, projectCountSq.topicId))
    .where(sql`${topic.userId} = ${userId} OR ${topic.isCommunity} = true`);

  const userTopics = rows
    .filter((r) => !r.isCommunity && r.userId === userId)
    .map(formatTopic);
  const communityTopics = rows.filter((r) => r.isCommunity).map(formatTopic);

  return NextResponse.json({ userTopics, communityTopics });
}

/** POST /api/topics → Create a new topic */
export async function POST(req: NextRequest) {
  const userId = await getEffectiveUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    domain?: string;
    parentGroup?: string;
    icon?: string;
  };

  const name = body.name || "Untitled";
  const suffix = crypto.randomUUID().slice(0, 8);
  const slug = `${slugify(name)}-${suffix}`;

  try {
    const [row] = await db
      .insert(topic)
      .values({
        userId,
        name,
        slug,
        domain: body.domain ?? null,
        parentGroup: body.parentGroup ?? null,
        icon: body.icon ?? null,
      })
      .returning();

    return NextResponse.json({
      topic: formatTopic({ ...row, projectCount: 0 }),
    });
  } catch (err: unknown) {
    console.error("Topic insert error:", err);
    const pgErr = err as {
      message?: string;
      code?: string;
      detail?: string;
      constraint_name?: string;
    };
    // pg code 23505 = unique_violation (slug collision)
    if (pgErr.code === "23505") {
      return NextResponse.json(
        { error: "A topic with that slug already exists. Please try again." },
        { status: 409 },
      );
    }
    const message = pgErr.detail || pgErr.message || "Failed to create topic";
    return NextResponse.json(
      { error: message, code: pgErr.code },
      { status: 500 },
    );
  }
}

function formatTopic(row: {
  id: string;
  userId: string;
  name: string;
  slug: string;
  domain: string | null;
  parentGroup: string | null;
  icon: string | null;
  isCommunity: boolean;
  sourceCount: number;
  projectCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}) {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    parentGroup: row.parentGroup,
    icon: row.icon,
    isCommunity: row.isCommunity,
    sourceCount: row.sourceCount,
    projectCount: row.projectCount,
    createdAt: row.createdAt?.toISOString() ?? "",
    updatedAt: row.updatedAt?.toISOString() ?? "",
  };
}
