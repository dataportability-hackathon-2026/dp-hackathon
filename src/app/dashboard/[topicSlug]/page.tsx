import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SinglePageApp } from "@/components/single-page-app";
import { db } from "@/db";
import { topic } from "@/db/schema";
import { siteConfig } from "@/lib/white-label";

type Props = { params: Promise<{ topicSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug } = await params;
  const [topicRow] = await db
    .select({ name: topic.name })
    .from(topic)
    .where(eq(topic.slug, topicSlug));

  return {
    title: topicRow ? `${topicRow.name} - ${siteConfig.name}` : siteConfig.name,
  };
}

export default async function TopicPage({ params }: Props) {
  const { topicSlug } = await params;

  const [topicRow] = await db
    .select()
    .from(topic)
    .where(eq(topic.slug, topicSlug));

  if (!topicRow) notFound();

  return (
    <SinglePageApp
      topicId={topicRow.id}
      topicSlug={topicSlug}
      topicName={topicRow.name}
    />
  );
}
