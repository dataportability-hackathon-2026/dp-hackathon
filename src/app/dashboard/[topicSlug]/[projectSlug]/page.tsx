import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SinglePageApp } from "@/components/single-page-app";
import { db } from "@/db";
import { project, topic } from "@/db/schema";
import { siteConfig } from "@/lib/white-label";

type Props = {
  params: Promise<{ topicSlug: string; projectSlug: string }>;
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function getTopicAndProject(topicSlug: string, projectSlug: string) {
  const [topicRow] = await db
    .select()
    .from(topic)
    .where(eq(topic.slug, topicSlug));
  if (!topicRow) return null;

  const projects = await db
    .select()
    .from(project)
    .where(eq(project.topicId, topicRow.id));

  const proj = projects.find((p) => slugify(p.name) === projectSlug);
  if (!proj) return null;

  return { topicRow, proj };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug, projectSlug } = await params;
  const result = await getTopicAndProject(topicSlug, projectSlug);

  if (!result) return { title: siteConfig.name };

  return {
    title: `${result.proj.name} · ${result.topicRow.name} - ${siteConfig.name}`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { topicSlug, projectSlug } = await params;
  const result = await getTopicAndProject(topicSlug, projectSlug);

  if (!result) notFound();

  return (
    <SinglePageApp
      topicId={result.topicRow.id}
      topicSlug={topicSlug}
      topicName={result.topicRow.name}
      projectId={result.proj.id}
      projectName={result.proj.name}
    />
  );
}
