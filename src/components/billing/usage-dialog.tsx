"use client";

import { BarChart3, Loader2, Zap } from "lucide-react";
import { useId } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { useCredits } from "@/hooks/use-credits";
import { useUsage } from "@/hooks/use-usage";

function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(1)}K`;
  }
  return String(tokens);
}

export function UsageDialog() {
  const rowId = useId();
  const { displayCredits, loading: creditsLoading } = useCredits();
  const { usage, loading: usageLoading, error } = useUsage();

  const totalInputTokens = usage.reduce(
    (sum, entry) => sum + entry.inputTokens,
    0,
  );
  const totalOutputTokens = usage.reduce(
    (sum, entry) => sum + entry.outputTokens,
    0,
  );
  const totalCreditsConsumed = usage.reduce(
    (sum, entry) => sum + entry.creditsConsumed,
    0,
  );
  const totalGenerations = usage.length;

  const displayConsumed = totalCreditsConsumed / 1000;
  const creditsTotal = displayConsumed + displayCredits;
  const progressValue =
    creditsTotal > 0 ? (displayConsumed / creditsTotal) * 100 : 0;

  const loading = creditsLoading || usageLoading;

  // Group usage entries by date for daily breakdown
  const dailyBreakdown = usage.reduce<
    Record<
      string,
      {
        date: string;
        generations: number;
        inputTokens: number;
        outputTokens: number;
        credits: number;
      }
    >
  >((acc, entry) => {
    const date = new Date(entry.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = {
        date,
        generations: 0,
        inputTokens: 0,
        outputTokens: 0,
        credits: 0,
      };
    }
    acc[date].generations += 1;
    acc[date].inputTokens += entry.inputTokens;
    acc[date].outputTokens += entry.outputTokens;
    acc[date].credits += entry.creditsConsumed;
    return acc;
  }, {});

  const dailyRows = Object.values(dailyBreakdown);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
          />
        }
      >
        <BarChart3 className="size-4 text-muted-foreground" />
        Usage
      </DialogTrigger>
      <DialogContent className="flex max-h-[80dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Usage</DialogTitle>
          <DialogDescription className="sr-only">Usage</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
              {error}
            </div>
          ) : (
            <>
              {/* Credits overview */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="size-4 text-primary" />
                      <span className="text-sm font-medium">Credits Used</span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {Math.round(displayConsumed)} / {Math.round(creditsTotal)}
                    </span>
                  </div>
                  <Progress value={progressValue}>
                    <ProgressLabel className="sr-only">
                      Credits used
                    </ProgressLabel>
                  </Progress>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(displayCredits)} credits remaining
                  </p>
                </CardContent>
              </Card>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold tabular-nums">
                    {totalGenerations}
                  </p>
                  <p className="text-xs text-muted-foreground">Generations</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold tabular-nums">
                    {formatTokenCount(totalInputTokens)}
                  </p>
                  <p className="text-xs text-muted-foreground">Input Tokens</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold tabular-nums">
                    {formatTokenCount(totalOutputTokens)}
                  </p>
                  <p className="text-xs text-muted-foreground">Output Tokens</p>
                </div>
              </div>

              {/* Daily breakdown */}
              {dailyRows.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                    Daily Breakdown
                  </p>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-5 gap-2 border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                      <span>Date</span>
                      <span className="text-right">Gens</span>
                      <span className="text-right">In Tokens</span>
                      <span className="text-right">Out Tokens</span>
                      <span className="text-right">Credits</span>
                    </div>
                    {dailyRows.map((row) => (
                      <div
                        key={`${rowId}-${row.date}`}
                        className="grid grid-cols-5 gap-2 border-b px-3 py-2 text-sm last:border-0"
                      >
                        <span className="text-muted-foreground">
                          {row.date}
                        </span>
                        <span className="text-right tabular-nums">
                          {row.generations}
                        </span>
                        <span className="text-right tabular-nums">
                          {formatTokenCount(row.inputTokens)}
                        </span>
                        <span className="text-right tabular-nums">
                          {formatTokenCount(row.outputTokens)}
                        </span>
                        <span className="text-right tabular-nums">
                          {Math.round(row.credits / 1000)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
