"use client";

import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { BillingDialog } from "@/components/billing/billing-dialog";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { useCredits } from "@/hooks/use-credits";

export function CreditBadge() {
  const { displayCredits, loading } = useCredits();
  const [open, setOpen] = useState(false);
  const hasCredits = !loading && Math.round(displayCredits) > 0;

  return (
    <BillingDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <DialogTrigger render={<Button variant="ghost" />}>
          {hasCredits ? (
            <Sparkles className="size-4" data-icon="inline-start" />
          ) : (
            <AlertTriangle
              className="size-4 text-amber-500"
              data-icon="inline-start"
            />
          )}
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="tabular-nums">{Math.round(displayCredits)}</span>
          )}
          Credits
        </DialogTrigger>
      }
    />
  );
}
