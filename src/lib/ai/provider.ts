import { createOpenAI } from "@ai-sdk/openai";

/**
 * AI provider configured for the Vercel AI Gateway.
 *
 * Uses AI_GATEWAY_API_KEY and routes through the gateway at
 * https://ai-gateway.vercel.sh/v1. Falls back to direct OpenAI
 * if OPENAI_API_KEY is set and AI_GATEWAY_API_KEY is not.
 */
const gatewayKey = process.env.AI_GATEWAY_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

export const openai = gatewayKey
  ? createOpenAI({
      apiKey: gatewayKey,
      baseURL: "https://ai-gateway.vercel.sh/v1",
    })
  : createOpenAI({
      apiKey: openaiKey,
    });
