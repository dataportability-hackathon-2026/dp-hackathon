import { createGateway } from "@ai-sdk/gateway";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * AI model helper.
 *
 * Uses the Vercel AI Gateway when AI_GATEWAY_API_KEY is set (automatic on
 * Vercel deploys), otherwise falls back to direct OpenAI.
 *
 * Usage:  model("openai/gpt-4o-mini")
 */
const gatewayKey = process.env.AI_GATEWAY_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const gateway = gatewayKey ? createGateway({ apiKey: gatewayKey }) : null;

const directOpenAI = createOpenAI({ apiKey: openaiKey ?? gatewayKey });

/**
 * Resolve a model ID like "openai/gpt-4o-mini".
 * Prefers the gateway; falls back to direct OpenAI Chat Completions API.
 */
export function model(id: string) {
  if (gateway) return gateway(id);
  // Strip "openai/" prefix for direct provider
  const bare = id.startsWith("openai/") ? id.slice("openai/".length) : id;
  return directOpenAI.chat(bare);
}
