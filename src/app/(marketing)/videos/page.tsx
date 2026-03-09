"use client";

import { Download, Film, Play } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ManifestEntry = {
  id: string;
  title: string;
  tagline: string;
  finalUrl: string;
  clipUrls: string[];
  scenes: { prompt: string; durationSeconds: number }[];
};

export default function VideosPage() {
  const [videos, setVideos] = useState<ManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const keyPrefix = useId();

  useEffect(() => {
    fetch("/api/videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setError(
            "No videos available yet. Run the generation pipeline first.",
          );
        }
      })
      .catch(() => setError("Failed to load videos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <MarketingNav />
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-12">
        <Badge variant="outline" className="mb-4">
          <Film className="h-3 w-3 mr-1" />
          Videos
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
          Marketing Teasers
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mb-16">
          AI-generated 30-second teaser videos showcasing the Core Model
          learning experience.
        </p>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-neutral-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid gap-10">
            {videos.map((video) => (
              <Card key={`${keyPrefix}-${video.id}`}>
                <CardHeader>
                  <CardTitle className="text-2xl">{video.title}</CardTitle>
                  <p className="text-neutral-500 dark:text-neutral-400">
                    {video.tagline}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main video */}
                  <div className="rounded-lg overflow-hidden bg-black aspect-video">
                    <video
                      className="w-full h-full"
                      controls
                      preload="metadata"
                      poster=""
                    >
                      <source src={video.finalUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="flex items-center gap-3">
                    <a href={video.finalUrl} download>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Video
                      </Button>
                    </a>
                    <span className="text-sm text-neutral-400">
                      {video.scenes.reduce(
                        (s, sc) => s + sc.durationSeconds,
                        0,
                      )}
                      s total &middot; {video.scenes.length} scenes
                    </span>
                  </div>

                  {/* Individual clips */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200">
                      <Play className="h-3 w-3 inline mr-1" />
                      View individual clips ({video.clipUrls.length})
                    </summary>
                    <div className="mt-4 grid md:grid-cols-2 gap-4">
                      {video.clipUrls.map((clipUrl, clipIdx) => (
                        <div
                          key={`${keyPrefix}-${video.id}-clip-${clipIdx}`}
                          className="space-y-2"
                        >
                          <div className="rounded-lg overflow-hidden bg-black aspect-video">
                            <video
                              className="w-full h-full"
                              controls
                              preload="metadata"
                            >
                              <source src={clipUrl} type="video/mp4" />
                            </video>
                          </div>
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>
                              Scene {clipIdx + 1} &middot;{" "}
                              {video.scenes[clipIdx]?.durationSeconds ?? "?"}s
                            </span>
                            <a
                              href={clipUrl}
                              download
                              className="hover:text-blue-600"
                            >
                              <Download className="h-3 w-3" />
                            </a>
                          </div>
                          {video.scenes[clipIdx] && (
                            <p className="text-xs text-neutral-400 line-clamp-2">
                              {video.scenes[clipIdx].prompt}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <MarketingFooter />
    </div>
  );
}
