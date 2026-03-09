"use client";

import { Loader2, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  PERSONA_CATEGORIES,
  type PersonaCategory,
} from "@/lib/persona/categories";

type CategoryState = {
  enabled: boolean;
  file: File | null;
  lineCount: number | null;
};

type PersonaImportDialogProps = {
  topicSlug: string;
  onImportComplete?: () => void;
};

async function countLines(file: File): Promise<number> {
  const text = await file.text();
  if (!text.trim()) return 0;
  return text.trim().split("\n").length;
}

export function PersonaImportDialog({
  topicSlug,
  onImportComplete,
}: PersonaImportDialogProps) {
  const idPrefix = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const [categoryStates, setCategoryStates] = useState<
    Map<string, CategoryState>
  >(() => {
    const map = new Map<string, CategoryState>();
    for (const cat of PERSONA_CATEGORIES) {
      map.set(cat.id, {
        enabled: cat.defaultEnabled,
        file: null,
        lineCount: null,
      });
    }
    return map;
  });

  function updateCategory(id: string, update: Partial<CategoryState>) {
    setCategoryStates((prev) => {
      const next = new Map(prev);
      const current = next.get(id);
      if (current) {
        next.set(id, { ...current, ...update });
      }
      return next;
    });
  }

  async function handleFileChange(
    category: PersonaCategory,
    fileList: FileList | null,
  ) {
    if (!fileList || fileList.length === 0) {
      updateCategory(category.id, { file: null, lineCount: null });
      return;
    }
    const file = fileList[0];
    let lineCount: number | null = null;
    if (category.filename.endsWith(".jsonl")) {
      lineCount = await countLines(file);
    }
    updateCategory(category.id, { file, lineCount });
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("topicSlug", topicSlug);

      const enabledCategories: string[] = [];

      for (const [catId, state] of categoryStates) {
        if (state.enabled && state.file) {
          enabledCategories.push(catId);
          formData.set(catId, state.file);
        }
      }

      if (enabledCategories.length === 0) {
        setError("Select and attach at least one file to import.");
        setLoading(false);
        return;
      }

      formData.set("categories", JSON.stringify(enabledCategories));

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? `Import failed (${res.status})`);
      }

      setOpen(false);
      onImportComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  const enabledCount = Array.from(categoryStates.values()).filter(
    (s) => s.enabled && s.file,
  ).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Upload className="mr-2 h-4 w-4" />
        Import Study Data
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Persona Data</DialogTitle>
          <DialogDescription>
            Select data categories and attach the corresponding JSONL or JSON
            files to import into this topic.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {PERSONA_CATEGORIES.map((cat) => {
            const state = categoryStates.get(cat.id);
            if (!state) return null;
            const switchId = `${idPrefix}-switch-${cat.id}`;
            const fileId = `${idPrefix}-file-${cat.id}`;

            return (
              <div
                key={`${idPrefix}-${cat.id}`}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor={switchId} className="font-medium">
                      {cat.label}
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      {cat.description}
                    </p>
                  </div>
                  <Switch
                    id={switchId}
                    checked={state.enabled}
                    onCheckedChange={(checked) =>
                      updateCategory(cat.id, { enabled: checked })
                    }
                  />
                </div>

                {state.enabled && (
                  <div className="mt-3">
                    <Label htmlFor={fileId} className="text-sm">
                      {cat.filename}
                    </Label>
                    <input
                      id={fileId}
                      ref={(el) => {
                        if (el) fileInputRefs.current.set(cat.id, el);
                      }}
                      type="file"
                      accept=".jsonl,.json"
                      className="mt-1 block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium"
                      onChange={(e) => handleFileChange(cat, e.target.files)}
                    />
                    {state.file && state.lineCount !== null && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {state.lineCount.toLocaleString()} records found
                      </p>
                    )}
                    {state.file && state.lineCount === null && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {(state.file.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={loading || enabledCount === 0}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import{" "}
            {enabledCount > 0
              ? `${enabledCount} file${enabledCount > 1 ? "s" : ""}`
              : "Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
