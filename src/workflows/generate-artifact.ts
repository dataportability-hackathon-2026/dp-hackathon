import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { generatedArtifact, workflowRun } from "@/db/schema";
import {
  type ArtifactInput,
  generateFlashcards,
  generateMindMap,
  generateQuiz,
  generateSlides,
  generateSpatial,
} from "@/lib/ai/generate-artifact";
import { sendEmail } from "@/lib/email";

type GenerateArtifactParams = {
  userId: string;
  artifactType: string;
  input: ArtifactInput;
  workflowRunId: string;
  notifyEmail?: string;
};

async function recordStart(params: GenerateArtifactParams) {
  "use step";
  await db.insert(workflowRun).values({
    id: params.workflowRunId,
    userId: params.userId,
    workflowType: "artifact_generation",
    status: "running",
    input: JSON.stringify({
      artifactType: params.artifactType,
      ...params.input,
    }),
  });
}

async function callGenerator(artifactType: string, input: ArtifactInput) {
  "use step";
  switch (artifactType) {
    case "quiz":
      return { type: "quiz", data: await generateQuiz(input) };
    case "flashcards":
      return { type: "flashcards", data: await generateFlashcards(input) };
    case "mindmap":
      return { type: "mindmap", data: await generateMindMap(input) };
    case "slidedeck":
      return { type: "slidedeck", data: await generateSlides(input) };
    case "spatial":
      return { type: "spatial", data: await generateSpatial(input) };
    default:
      throw new Error(`Unknown artifact type: ${artifactType}`);
  }
}

async function persistToBlob(
  userId: string,
  workflowRunId: string,
  artifactType: string,
  result: { type: string; data: unknown },
) {
  "use step";
  const blob = await put(
    `artifacts/${userId}/${artifactType}-${Date.now()}.json`,
    JSON.stringify(result.data),
    { access: "public", contentType: "application/json" },
  );

  await db.insert(generatedArtifact).values({
    userId,
    workflowRunId,
    artifactType,
    title: `${artifactType} — ${new Date().toLocaleDateString()}`,
    blobUrl: blob.url,
    status: "completed",
  });

  return blob.url;
}

async function markCompleted(workflowRunId: string, output: string) {
  "use step";
  await db
    .update(workflowRun)
    .set({ status: "completed", output, updatedAt: new Date() })
    .where(eq(workflowRun.id, workflowRunId));
}

async function markFailed(workflowRunId: string, error: string) {
  "use step";
  await db
    .update(workflowRun)
    .set({ status: "failed", error, updatedAt: new Date() })
    .where(eq(workflowRun.id, workflowRunId));
}

async function notifyUser(
  email: string,
  artifactType: string,
  blobUrl: string,
) {
  "use step";
  await sendEmail({
    to: email,
    subject: `Your ${artifactType} is ready — CoreModel`,
    html: `<p>Your <strong>${artifactType}</strong> has been generated and is ready to use.</p>
<p><a href="${blobUrl}">View artifact</a></p>`,
  });
}

export async function generateArtifactWorkflow(params: GenerateArtifactParams) {
  "use workflow";

  await recordStart(params);

  try {
    const result = await callGenerator(params.artifactType, params.input);
    const blobUrl = await persistToBlob(
      params.userId,
      params.workflowRunId,
      params.artifactType,
      result,
    );
    await markCompleted(
      params.workflowRunId,
      JSON.stringify({ artifactType: params.artifactType, blobUrl }),
    );

    if (params.notifyEmail) {
      await notifyUser(params.notifyEmail, params.artifactType, blobUrl);
    }

    return { success: true, blobUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await markFailed(params.workflowRunId, message);
    return { success: false, error: message };
  }
}
