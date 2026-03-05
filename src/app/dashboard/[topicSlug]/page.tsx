import { redirect } from "next/navigation"
import { findTopicBySlug, slugify } from "@/lib/topics"
import { notFound } from "next/navigation"

export default async function TopicPage({ params }: { params: Promise<{ topicSlug: string }> }) {
  const { topicSlug } = await params
  const topic = findTopicBySlug(topicSlug)
  if (!topic) notFound()
  const firstProject = topic.projects[0]
  if (!firstProject) notFound()
  redirect(`/dashboard/${topicSlug}/${slugify(firstProject.name)}`)
}
