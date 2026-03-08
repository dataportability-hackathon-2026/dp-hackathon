import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SinglePageApp } from "@/components/single-page-app";
import { db } from "@/db";
import { topic } from "@/db/schema";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;

  const [topicRow] = await db
    .select()
    .from(topic)
    .where(eq(topic.slug, topicSlug));

  if (!topicRow) notFound();

  return <SinglePageApp topicId={topicRow.id} />;
}
