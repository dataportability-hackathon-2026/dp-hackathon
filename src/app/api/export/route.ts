import { eq } from "drizzle-orm";
import JSZip from "jszip";
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  assessment,
  conversation,
  generatedArtifact,
  message,
  project,
  source,
  topic,
  userPreferences,
} from "@/db/schema";
import { getEffectiveUserId } from "@/lib/impersonate";

export async function GET() {
  const userId = await getEffectiveUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    sources,
    topics,
    projects,
    conversations,
    assessments,
    artifacts,
    preferences,
    messages,
  ] = await Promise.all([
    db.select().from(source).where(eq(source.userId, userId)),
    db.select().from(topic).where(eq(topic.userId, userId)),
    db.select().from(project).where(eq(project.userId, userId)),
    db.select().from(conversation).where(eq(conversation.userId, userId)),
    db.select().from(assessment).where(eq(assessment.userId, userId)),
    db
      .select()
      .from(generatedArtifact)
      .where(eq(generatedArtifact.userId, userId)),
    db.select().from(userPreferences).where(eq(userPreferences.userId, userId)),
    db
      .select()
      .from(message)
      .innerJoin(conversation, eq(message.conversationId, conversation.id))
      .where(eq(conversation.userId, userId)),
  ]);

  const zip = new JSZip();
  zip.file("sources.json", JSON.stringify(sources, null, 2));
  zip.file("topics.json", JSON.stringify(topics, null, 2));
  zip.file("projects.json", JSON.stringify(projects, null, 2));
  zip.file("conversations.json", JSON.stringify(conversations, null, 2));
  zip.file("messages.json", JSON.stringify(messages, null, 2));
  zip.file("assessments.json", JSON.stringify(assessments, null, 2));
  zip.file("artifacts.json", JSON.stringify(artifacts, null, 2));
  zip.file("preferences.json", JSON.stringify(preferences, null, 2));
  zip.file(
    "export_metadata.json",
    JSON.stringify({ exportedAt: new Date().toISOString(), userId }, null, 2),
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="coremodel-export.zip"',
    },
  });
}
