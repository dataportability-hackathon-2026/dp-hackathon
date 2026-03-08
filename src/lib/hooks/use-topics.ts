"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Topic } from "@/lib/types/topic";

type TopicsData = {
  userTopics: Topic[];
  communityTopics: Topic[];
  isLoading: boolean;
  error: string | null;
  mutate: () => void;
};

export function useTopics(): TopicsData {
  const [userTopics, setUserTopics] = useState<Topic[]>([]);
  const [communityTopics, setCommunityTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const mutate = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch("/api/topics")
      .then((r) => r.json())
      .then((data: { userTopics: Topic[]; communityTopics: Topic[] }) => {
        if (cancelled) return;
        setUserTopics(data.userTopics);
        setCommunityTopics(data.communityTopics);
        setError(null);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { userTopics, communityTopics, isLoading, error, mutate };
}

export function useCreateTopic() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const createTopic = useCallback(
    async (opts?: { name?: string; domain?: string }) => {
      setIsCreating(true);
      try {
        let lastError: Error | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          const res = await fetch("/api/topics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(opts ?? {}),
          });
          // Retry once on slug collision (409)
          if (res.status === 409 && attempt === 0) continue;
          if (!res.ok) {
            const text = await res.text();
            lastError = new Error(
              text || `Failed to create topic (${res.status})`,
            );
            break;
          }
          const data = (await res.json()) as { topic: Topic };
          router.push(`/dashboard/${data.topic.slug}`);
          return data.topic;
        }
        throw lastError ?? new Error("Failed to create topic");
      } finally {
        setIsCreating(false);
      }
    },
    [router],
  );

  return { createTopic, isCreating };
}

export function useUpdateTopic(id: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTopic = useCallback(
    async (updates: { name?: string; domain?: string; icon?: string }) => {
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/topics/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to update topic (${res.status})`);
        }
        return (await res.json()) as { topic: Topic };
      } finally {
        setIsUpdating(false);
      }
    },
    [id],
  );

  return { updateTopic, isUpdating };
}
