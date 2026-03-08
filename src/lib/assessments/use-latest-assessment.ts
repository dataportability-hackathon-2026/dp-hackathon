"use client";

import { useEffect, useState } from "react";
import { dataStore } from "@/lib/data-store";

type AssessmentRecord = {
  id: string;
  userId: string;
  type: string;
  status: string;
  version: number;
  currentStep: number;
  responses: Record<string, unknown> | null;
  fingerprint: Record<string, unknown> | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useLatestAssessment() {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatest() {
      try {
        const res = await fetch("/api/assessments/latest");
        if (res.status === 404) {
          // No completed assessment — that's fine
          return;
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch assessment: ${res.status}`);
        }
        const data = await res.json();
        if (cancelled) return;
        setAssessment(data);
        dataStore.hydrateFromAssessment(data);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchLatest();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, assessment, error };
}
