import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SinglePageApp } from "@/components/single-page-app";
import { db } from "@/db";
import { project, topic } from "@/db/schema";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ topicSlug: string; projectSlug: string }>;
}) {
  const { topicSlug, projectSlug } = await params;

  const [topicRow] = await db
    .select()
    .from(topic)
    .where(eq(topic.slug, topicSlug));
  if (!topicRow) notFound();

  // Find project by slug match (slugify the project name)
  const projects = await db
    .select()
    .from(project)
    .where(eq(project.topicId, topicRow.id));

  const slugify = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const proj = projects.find((p) => slugify(p.name) === projectSlug);
  if (!proj) notFound();

  return <SinglePageApp topicId={topicRow.id} projectId={proj.id} />;
}
