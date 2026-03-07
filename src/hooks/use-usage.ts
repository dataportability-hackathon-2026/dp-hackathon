"use client";

import { useCallback, useEffect, useState } from "react";

export type UsageEntry = {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  creditsConsumed: number;
  feature: string;
  createdAt: string;
};

type UsageState = {
  usage: UsageEntry[];
  loading: boolean;
  error: string | null;
};

type UsageResponse = { usage: UsageEntry[] };

export function useUsage(): UsageState {
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/usage")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch usage data");
        return res.json() as Promise<UsageResponse>;
      })
      .then((data) => {
        setUsage(data.usage);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, loading, error };
}
