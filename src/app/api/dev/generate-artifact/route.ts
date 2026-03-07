import { NextResponse } from "next/server"
import { generateFlashcards, type ArtifactInput } from "@/lib/ai/generate-artifact"

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Dev only" }, { status: 403 })
  }

  const body = await req.json()
  const { type, input } = body as { type: string; input: ArtifactInput }

  try {
    switch (type) {
      case "flashcards": {
        const data = await generateFlashcards(input)
        return NextResponse.json({ type: "flashcards", data })
      }
      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
