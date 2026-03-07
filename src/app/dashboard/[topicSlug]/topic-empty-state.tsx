"use client";

import { FileUp, Loader2, MessageSquare, Pencil } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useUpdateTopic } from "@/lib/hooks/use-topics";

export function TopicEmptyState({
  topicId,
  topicSlug,
  topicName,
}: {
  topicId: string;
  topicSlug: string;
  topicName: string;
}) {
  const [name, setName] = useState(topicName);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateTopic } = useUpdateTopic(topicId);

  const handleSaveName = useCallback(async () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== topicName) {
      await updateTopic({ name: trimmed });
    } else {
      setName(topicName);
    }
  }, [name, topicName, updateTopic]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSaveName();
      if (e.key === "Escape") {
        setName(topicName);
        setEditing(false);
      }
    },
    [handleSaveName, topicName],
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.set("topicSlug", topicSlug);
        for (const file of Array.from(files)) {
          formData.append("files", file);
        }
        const res = await fetch("/api/sources", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          // Check if title was auto-generated
          const data = (await res.json()) as {
            results: Array<{ id: string; filename: string }>;
            generatedTitle?: string;
          };
          if (data.generatedTitle) {
            setName(data.generatedTitle);
          }
          // Reload to show sources
          window.location.reload();
        }
      } finally {
        setUploading(false);
      }
    },
    [topicSlug],
  );

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg text-center">
        {/* Inline editable title */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {editing ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className={
                "bg-transparent text-3xl font-bold text-center outline-none border-b-2 border-primary/40 " +
                (name === "Untitled" ? "text-muted-foreground italic" : "")
              }
              // biome-ignore lint/a11y/noAutofocus: intentional for inline editing
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="group flex items-center gap-2"
            >
              <h1
                className={
                  "text-3xl font-bold " +
                  (name === "Untitled" ? "text-muted-foreground italic" : "")
                }
              >
                {name}
              </h1>
              <Pencil className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Upload drop zone */}
        <div
          className="mb-6 rounded-xl border-2 border-dashed border-border/60 p-10 hover:border-primary/40 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUpload(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading ? (
            <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <FileUp className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drop files here or click to upload sources
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                PDFs, documents, images, audio, video
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <MessageSquare className="size-3.5" />
          <span>Or ask the agent to help decide what to study</span>
        </div>
      </div>
    </div>
  );
}
