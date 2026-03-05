import { notFound } from "next/navigation"
import { findTopicBySlug, findProjectBySlug } from "@/lib/topics"
import { SinglePageApp } from "@/components/single-page-app"

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ topicSlug: string; projectSlug: string }>
}) {
  const { topicSlug, projectSlug } = await params
  const topic = findTopicBySlug(topicSlug)
  if (!topic) notFound()
  const project = findProjectBySlug(topic, projectSlug)
  if (!project) notFound()

  return <SinglePageApp topicId={topic.id} projectId={project.id} />
}
