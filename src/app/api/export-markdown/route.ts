import { generateText } from "ai"
import { openai } from "@/lib/ai/provider"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const state = await request.json()

  const result = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `You are an expert at creating well-structured, readable Markdown exports of learning data.

Given the following learning project data, generate a comprehensive, well-formatted Markdown document. Make it professional and easy to read. Use proper headings, tables, lists, and formatting. Add brief contextual commentary where helpful (e.g. interpreting mastery levels, summarizing progress trends).

DATA:
${JSON.stringify(state, null, 2)}

Generate the full Markdown document now. Do NOT wrap in code fences. Output raw Markdown only.`,
  })

  return NextResponse.json({ markdown: result.text })
}
