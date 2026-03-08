"use client";

import {
  BookOpen,
  HelpCircle,
  Keyboard,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useId, useState } from "react";
import { FeedbackFormInline } from "@/components/feedback-form";
import { ShortcutKbd } from "@/components/shortcut-kbd";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHotkeys } from "@/lib/hooks/use-hotkeys";
import { SHORTCUT_GROUPS, SHORTCUTS } from "@/lib/keyboard-shortcuts";
import { siteConfig } from "@/lib/white-label";

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const groupKeyPrefix = useId();

  useHotkeys({
    "?": () => setOpen(true),
  });

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 left-4 z-50 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="size-4" />
        <span className="sr-only">Help</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Help</DialogTitle>
            <DialogDescription className="sr-only">Help</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="shortcuts">
            <TabsList className="w-full">
              <TabsTrigger value="shortcuts" className="gap-1.5">
                <Keyboard className="size-3.5" />
                Shortcuts
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-1.5">
                <MessageSquare className="size-3.5" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="docs" className="gap-1.5">
                <BookOpen className="size-3.5" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-1.5">
                <Mail className="size-3.5" />
                Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="shortcuts"
              className="mt-4 max-h-80 overflow-y-auto"
            >
              {SHORTCUT_GROUPS.map((group) => {
                const items = SHORTCUTS.filter((s) => s.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={`${groupKeyPrefix}-${group}`} className="mb-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </h4>
                    <div className="space-y-1">
                      {items.map((s) => (
                        <div
                          key={`${groupKeyPrefix}-${s.id}`}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                        >
                          <span>{s.label}</span>
                          <ShortcutKbd shortcut={s.display} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="feedback" className="mt-4">
              <FeedbackFormInline />
            </TabsContent>

            <TabsContent value="docs" className="mt-4">
              <div className="flex flex-col gap-3 text-sm">
                <p className="text-muted-foreground">
                  Learn how to get the most out of {siteConfig.name}.
                </p>
                <Button
                  variant="outline"
                  render={
                    <a href="/docs" target="_blank" rel="noopener noreferrer" />
                  }
                >
                  <BookOpen className="size-4" data-icon="inline-start" />
                  Open Documentation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="mt-4">
              <div className="flex flex-col gap-3 text-sm">
                <p className="text-muted-foreground">
                  Have questions or need help? Reach out to our team.
                </p>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <a
                      href={`mailto:${siteConfig.supportEmail ?? "support@example.com"}`}
                      className="text-primary underline underline-offset-4"
                    >
                      {siteConfig.supportEmail ?? "support@example.com"}
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
