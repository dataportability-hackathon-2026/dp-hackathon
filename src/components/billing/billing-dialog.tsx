"use client";

import {
  CreditCard,
  ExternalLink,
  FileDown,
  Gift,
  Loader2,
  Ticket,
} from "lucide-react";
import type { ReactNode } from "react";
import { useId, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { useCredits } from "@/hooks/use-credits";
import { CREDIT_PACKS, type CreditPackSlug } from "@/lib/credit-packs";

type CheckoutResponse = {
  checkoutUrl: string;
};

const EXHAUSTION_OPTIONS = [
  {
    id: "pause",
    label: "Pause generations",
    desc: "Stop all AI generations until credits are renewed",
  },
  {
    id: "auto-purchase",
    label: "Auto-purchase 25 credits",
    desc: "Automatically buy a 25-credit pack ($10)",
  },
  {
    id: "notify",
    label: "Notify me only",
    desc: "Send an email alert but allow overage",
  },
] as const;

const PACKS = Object.values(CREDIT_PACKS);

type BillingDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
};

export function BillingDialog({
  open,
  onOpenChange,
  trigger,
}: BillingDialogProps = {}) {
  const packId = useId();
  const optionId = useId();
  const { displayCredits, loading: creditsLoading, refresh } = useCredits();
  const [loadingPack, setLoadingPack] = useState<CreditPackSlug | null>(null);
  const [activeExhaustion, setActiveExhaustion] = useState("auto-purchase");
  const [claimingFree, setClaimingFree] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [redeemingPromo, setRedeemingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);

  const creditsTotal = 50;
  const progressValue =
    creditsTotal > 0 ? (displayCredits / creditsTotal) * 100 : 0;

  const noCredits = !creditsLoading && Math.round(displayCredits) <= 0;

  async function handleClaimFreeCredits() {
    setClaimingFree(true);
    setClaimError("");
    try {
      const res = await fetch("/api/billing/claim-credits", { method: "POST" });
      if (res.status === 409) {
        setClaimError("You've already claimed your free credits");
        return;
      }
      if (!res.ok) throw new Error("Failed to claim credits");
      refresh();
    } catch {
      setClaimError("Something went wrong");
    } finally {
      setClaimingFree(false);
    }
  }

  async function handlePurchase(slug: CreditPackSlug) {
    setLoadingPack(slug);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packSlug: slug }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = (await res.json()) as CheckoutResponse;
      window.location.href = data.checkoutUrl;
    } catch {
      // Reset loading state on error
      setLoadingPack(null);
    }
  }

  async function handleRedeemPromo() {
    if (!promoCode.trim()) return;
    setRedeemingPromo(true);
    setPromoMessage("");
    setPromoSuccess(false);
    try {
      const res = await fetch("/api/billing/redeem-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        creditsAdded?: number;
        error?: string;
      };
      if (!res.ok) {
        setPromoMessage(data.error ?? "Failed to redeem code");
        setPromoSuccess(false);
      } else {
        setPromoMessage(`Added ${data.creditsAdded} credits!`);
        setPromoSuccess(true);
        setPromoCode("");
        refresh();
      }
    } catch {
      setPromoMessage("Something went wrong");
      setPromoSuccess(false);
    } finally {
      setRedeemingPromo(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ?? (
        <DialogTrigger
          render={
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
            />
          }
        >
          <CreditCard className="size-4 text-muted-foreground" />
          Billing
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[80dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Billing</DialogTitle>
          <DialogDescription>
            Manage your subscription, credits, and payment method
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto -mx-6 px-6">
          {creditsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Free credits alert */}
              {noCredits && (
                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <Gift className="size-4 text-amber-500" />
                  <AlertTitle>You're out of credits</AlertTitle>
                  <AlertDescription className="flex items-center justify-between gap-4">
                    <span>Claim 20 free credits to keep going.</span>
                    <Button
                      size="sm"
                      variant="default"
                      disabled={claimingFree}
                      onClick={handleClaimFreeCredits}
                      className="shrink-0"
                    >
                      {claimingFree ? (
                        <Loader2
                          className="size-3 animate-spin"
                          data-icon="inline-start"
                        />
                      ) : (
                        <Gift className="size-3" data-icon="inline-start" />
                      )}
                      Claim 20 Credits
                    </Button>
                  </AlertDescription>
                  {claimError && (
                    <p className="mt-2 text-xs text-destructive">
                      {claimError}
                    </p>
                  )}
                </Alert>
              )}

              {/* Current balance */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Credit Balance</CardTitle>
                    <Badge>Active</Badge>
                  </div>
                  <CardDescription>
                    Your current available credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Credits remaining
                    </span>
                    <span className="font-medium tabular-nums">
                      {Math.round(displayCredits)} credits
                    </span>
                  </div>
                  <Progress value={progressValue}>
                    <ProgressLabel className="sr-only">
                      Credits remaining
                    </ProgressLabel>
                  </Progress>
                </CardContent>
              </Card>

              {/* Buy more credits */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Need More Credits?
                  </CardTitle>
                  <CardDescription>
                    Purchase additional credit packs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {PACKS.map((pack) => (
                      <button
                        type="button"
                        key={`${packId}-${pack.slug}`}
                        disabled={loadingPack !== null}
                        onClick={() => handlePurchase(pack.slug)}
                        className="flex flex-col items-center gap-1 rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingPack === pack.slug ? (
                          <Loader2 className="size-5 animate-spin text-primary" />
                        ) : (
                          <span className="text-lg font-bold">
                            {pack.credits / 1000}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          credits
                        </span>
                        <span className="text-xs font-medium text-primary">
                          {pack.priceLabel}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Promo code */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    <Ticket className="inline size-4 mr-1.5 -mt-0.5" />
                    Have a Promo Code?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoMessage("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRedeemPromo();
                      }}
                      className="uppercase font-mono"
                    />
                    <Button
                      onClick={handleRedeemPromo}
                      disabled={redeemingPromo || !promoCode.trim()}
                      size="sm"
                      className="shrink-0"
                    >
                      {redeemingPromo ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Redeem"
                      )}
                    </Button>
                  </div>
                  {promoMessage && (
                    <p
                      className={`text-xs ${promoSuccess ? "text-green-600" : "text-destructive"}`}
                    >
                      {promoMessage}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <CreditCard className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Managed via Stripe</p>
                      <p className="text-xs text-muted-foreground">
                        View and update your payment details
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <ExternalLink
                      className="size-3.5"
                      data-icon="inline-start"
                    />
                    Manage in Stripe
                  </Button>
                </CardContent>
              </Card>

              {/* When credits run out */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    When Credits Run Out
                  </CardTitle>
                  <CardDescription>
                    Choose what happens when you exhaust your credits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {EXHAUSTION_OPTIONS.map((opt) => (
                    <label
                      key={`${optionId}-${opt.id}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        activeExhaustion === opt.id
                          ? "border-primary/30 bg-primary/5"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={activeExhaustion === opt.id}
                        onCheckedChange={() => setActiveExhaustion(opt.id)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" size="sm">
            <FileDown className="size-3.5" data-icon="inline-start" />
            Download Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
