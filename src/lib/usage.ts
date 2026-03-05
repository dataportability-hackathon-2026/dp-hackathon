import { db } from "@/db";
import { usageLog } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { deductCredits, getBalance } from "./credits";

type RecordUsageParams = {
  userId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  creditsConsumed: number;
  feature: "voice" | "generation" | "chat";
  metadata?: Record<string, unknown>;
};

export async function recordUsage(params: RecordUsageParams) {
  const deductResult = await deductCredits(
    params.userId,
    params.creditsConsumed,
    `${params.feature} usage: ${params.model}`,
  );

  if (!deductResult.success) {
    return { success: false as const };
  }

  await db.insert(usageLog).values({
    userId: params.userId,
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    creditsConsumed: params.creditsConsumed,
    feature: params.feature,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
  });

  return { success: true as const, newBalance: deductResult.newBalance };
}

export async function checkAffordability(
  userId: string,
  estimatedCredits: number,
) {
  const balance = await getBalance(userId);
  return {
    affordable: balance >= estimatedCredits,
    balance,
    estimatedCredits,
  };
}

export async function getUsageHistory(
  userId: string,
  limit = 50,
  offset = 0,
) {
  const rows = await db
    .select()
    .from(usageLog)
    .where(eq(usageLog.userId, userId))
    .orderBy(desc(usageLog.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}
