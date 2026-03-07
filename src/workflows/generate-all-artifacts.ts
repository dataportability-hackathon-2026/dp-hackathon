import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { sleep } from "workflow";
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

const VALID_ARTIFACT_TYPES = [
  "quiz",
  "flashcards",
  "mindmap",
  "slidedeck",
  "spatial",
] as const;

type ValidArtifactType = (typeof VALID_ARTIFACT_TYPES)[number];

/** Per-artifact request with optional overrides on top of shared config. */
type ArtifactRequest = {
  type: ValidArtifactType;
  subject?: string;
  concepts?: string[];
  priorKnowledgeLevel?: string;
  goalType?: string;
  sourceIds?: string[];
  sourceContent?: string;
  instructions?: string;
};

type GenerateArtifactsParams = {
  userId: string;
  workflowRunId: string;
  /** Shared base config — each artifact inherits unless it overrides. */
  shared: ArtifactInput;
  /** List of artifacts to generate. Each can override shared fields. */
  artifacts: ArtifactRequest[];
  notifyEmail?: string;
};

function mergeInput(
  shared: ArtifactInput,
  request: ArtifactRequest,
): ArtifactInput {
  return {
    subject: request.subject ?? shared.subject,
    concepts: request.concepts ?? shared.concepts,
    priorKnowledgeLevel:
      request.priorKnowledgeLevel ?? shared.priorKnowledgeLevel,
    goalType: request.goalType ?? shared.goalType,
    sourceIds: request.sourceIds ?? shared.sourceIds,
    sourceContent: request.sourceContent ?? shared.sourceContent,
    instructions: request.instructions ?? shared.instructions,
  };
}

async function recordBatchStart(params: GenerateArtifactsParams) {
  "use step";
  await db.insert(workflowRun).values({
    id: params.workflowRunId,
    userId: params.userId,
    workflowType: "batch_artifacts",
    status: "running",
    input: JSON.stringify({
      shared: params.shared,
      artifacts: params.artifacts,
    }),
  });
}

async function generateSingleArtifact(
  artifactType: ValidArtifactType,
  input: ArtifactInput,
) {
  "use step";
  switch (artifactType) {
    case "quiz":
      return await generateQuiz(input);
    case "flashcards":
      return await generateFlashcards(input);
    case "mindmap":
      return await generateMindMap(input);
    case "slidedeck":
      return await generateSlides(input);
    case "spatial":
      return await generateSpatial(input);
  }
}

async function persistArtifact(
  userId: string,
  workflowRunId: string,
  artifactType: string,
  index: number,
  data: unknown,
) {
  "use step";
  const blob = await put(
    `artifacts/${userId}/${artifactType}-${index}-${Date.now()}.json`,
    JSON.stringify(data),
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

async function updateProgress(
  workflowRunId: string,
  completed: number,
  total: number,
) {
  "use step";
  await db
    .update(workflowRun)
    .set({
      output: JSON.stringify({ completed, total, status: "in_progress" }),
      updatedAt: new Date(),
    })
    .where(eq(workflowRun.id, workflowRunId));
}

async function markBatchCompleted(
  workflowRunId: string,
  results: Array<{ type: string; index: number; blobUrl: string }>,
) {
  "use step";
  await db
    .update(workflowRun)
    .set({
      status: "completed",
      output: JSON.stringify({ results }),
      updatedAt: new Date(),
    })
    .where(eq(workflowRun.id, workflowRunId));
}

async function markBatchFailed(workflowRunId: string, error: string) {
  "use step";
  await db
    .update(workflowRun)
    .set({ status: "failed", error, updatedAt: new Date() })
    .where(eq(workflowRun.id, workflowRunId));
}

async function sendBatchCompletionEmail(
  email: string,
  results: Array<{ type: string; index: number; blobUrl: string }>,
) {
  "use step";
  const artifactList = results
    .map((r) => `<li><strong>${r.type}</strong> (#${r.index + 1})</li>`)
    .join("");

  await sendEmail({
    to: email,
    subject: "Your artifacts are ready — CoreModel",
    html: `<p>Your batch artifact generation is complete! Here's what was created:</p>
<ul>${artifactList}</ul>
<p>${results.length} artifacts are now available in your CoreModel dashboard.</p>`,
  });
}

export async function generateArtifactsWorkflow(
  params: GenerateArtifactsParams,
) {
  "use workflow";

  await recordBatchStart(params);

  const results: Array<{ type: string; index: number; blobUrl: string }> = [];

  try {
    for (let i = 0; i < params.artifacts.length; i++) {
      const request = params.artifacts[i];
      const input = mergeInput(params.shared, request);

      const data = await generateSingleArtifact(request.type, input);
      const blobUrl = await persistArtifact(
        params.userId,
        params.workflowRunId,
        request.type,
        i,
        data,
      );
      results.push({ type: request.type, index: i, blobUrl });
      await updateProgress(
        params.workflowRunId,
        results.length,
        params.artifacts.length,
      );
      await sleep("2s");
    }

    await markBatchCompleted(params.workflowRunId, results);

    if (params.notifyEmail) {
      await sendBatchCompletionEmail(params.notifyEmail, results);
    }

    return { success: true, results };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await markBatchFailed(params.workflowRunId, message);
    return { success: false, error: message, partialResults: results };
  }
}
