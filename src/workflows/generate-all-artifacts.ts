import { sleep } from "workflow"
import { put } from "@vercel/blob"
import { db } from "@/db"
import { workflowRun, generatedArtifact } from "@/db/schema"
import { eq } from "drizzle-orm"
import { sendEmail } from "@/lib/email"
import {
  generateQuiz,
  generateFlashcards,
  generateMindMap,
  generateSlides,
  generateSpatial,
  type ArtifactInput,
} from "@/lib/ai/generate-artifact"

const ARTIFACT_TYPES = ["quiz", "flashcards", "mindmap", "slidedeck", "spatial"] as const

type GenerateAllParams = {
  userId: string
  workflowRunId: string
  input: ArtifactInput
  notifyEmail?: string
}

async function recordBatchStart(params: GenerateAllParams) {
  "use step"
  await db.insert(workflowRun).values({
    id: params.workflowRunId,
    userId: params.userId,
    workflowType: "batch_artifacts",
    status: "running",
    input: JSON.stringify(params.input),
  })
}

async function generateSingleArtifact(
  artifactType: string,
  input: ArtifactInput,
) {
  "use step"
  switch (artifactType) {
    case "quiz":
      return await generateQuiz(input)
    case "flashcards":
      return await generateFlashcards(input)
    case "mindmap":
      return await generateMindMap(input)
    case "slidedeck":
      return await generateSlides(input)
    case "spatial":
      return await generateSpatial(input)
    default:
      throw new Error(`Unknown artifact type: ${artifactType}`)
  }
}

async function persistArtifact(
  userId: string,
  workflowRunId: string,
  artifactType: string,
  data: unknown,
) {
  "use step"
  const blob = await put(
    `artifacts/${userId}/${artifactType}-${Date.now()}.json`,
    JSON.stringify(data),
    { access: "public", contentType: "application/json" },
  )

  await db.insert(generatedArtifact).values({
    userId,
    workflowRunId,
    artifactType,
    title: `${artifactType} — ${new Date().toLocaleDateString()}`,
    blobUrl: blob.url,
    status: "completed",
  })

  return blob.url
}

async function updateProgress(workflowRunId: string, completed: number, total: number) {
  "use step"
  await db
    .update(workflowRun)
    .set({
      output: JSON.stringify({ completed, total, status: "in_progress" }),
      updatedAt: new Date(),
    })
    .where(eq(workflowRun.id, workflowRunId))
}

async function markBatchCompleted(workflowRunId: string, results: Array<{ type: string; blobUrl: string }>) {
  "use step"
  await db
    .update(workflowRun)
    .set({
      status: "completed",
      output: JSON.stringify({ results }),
      updatedAt: new Date(),
    })
    .where(eq(workflowRun.id, workflowRunId))
}

async function markBatchFailed(workflowRunId: string, error: string) {
  "use step"
  await db
    .update(workflowRun)
    .set({ status: "failed", error, updatedAt: new Date() })
    .where(eq(workflowRun.id, workflowRunId))
}

async function sendBatchCompletionEmail(
  email: string,
  results: Array<{ type: string; blobUrl: string }>,
) {
  "use step"
  const artifactList = results
    .map((r) => `<li><strong>${r.type}</strong></li>`)
    .join("")

  await sendEmail({
    to: email,
    subject: "All artifacts generated — CoreModel",
    html: `<p>Your batch artifact generation is complete! Here's what was created:</p>
<ul>${artifactList}</ul>
<p>${results.length} artifacts are now available in your CoreModel dashboard.</p>`,
  })
}

export async function generateAllArtifactsWorkflow(params: GenerateAllParams) {
  "use workflow"

  await recordBatchStart(params)

  const results: Array<{ type: string; blobUrl: string }> = []

  try {
    for (const artifactType of ARTIFACT_TYPES) {
      const data = await generateSingleArtifact(artifactType, params.input)
      const blobUrl = await persistArtifact(
        params.userId,
        params.workflowRunId,
        artifactType,
        data,
      )
      results.push({ type: artifactType, blobUrl })
      await updateProgress(params.workflowRunId, results.length, ARTIFACT_TYPES.length)
      await sleep("2s")
    }

    await markBatchCompleted(params.workflowRunId, results)

    if (params.notifyEmail) {
      await sendBatchCompletionEmail(params.notifyEmail, results)
    }

    return { success: true, results }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await markBatchFailed(params.workflowRunId, message)
    return { success: false, error: message, partialResults: results }
  }
}
