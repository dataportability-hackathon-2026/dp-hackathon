"use client"

import { useId, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, ExternalLink, FileDown, Loader2 } from "lucide-react"
import { useCredits } from "@/hooks/use-credits"
import { CREDIT_PACKS, type CreditPackSlug } from "@/lib/credit-packs"

type CheckoutResponse = {
  checkoutUrl: string
}

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
] as const

export function BillingDialog() {
  const packId = useId()
  const optionId = useId()
  const { displayCredits, loading: creditsLoading } = useCredits()
  const [loadingPack, setLoadingPack] = useState<CreditPackSlug | null>(null)
  const [activeExhaustion, setActiveExhaustion] = useState("auto-purchase")

  const creditsTotal = 50
  const progressValue =
    creditsTotal > 0 ? (displayCredits / creditsTotal) * 100 : 0

  const packs = Object.values(CREDIT_PACKS)

  async function handlePurchase(slug: CreditPackSlug) {
    setLoadingPack(slug)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packSlug: slug }),
      })
      if (!res.ok) throw new Error("Checkout failed")
      const data = (await res.json()) as CheckoutResponse
      window.location.href = data.checkoutUrl
    } catch {
      // Reset loading state on error
      setLoadingPack(null)
    }
  }

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
        <CreditCard className="size-4 text-muted-foreground" />
        Billing
      </DialogTrigger>
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
                      {displayCredits.toFixed(1)} credits
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
                    {packs.map((pack) => (
                      <button
                        type="button"
                        key={`${packId}-${pack.slug}`}
                        disabled={loadingPack !== null}
                        onClick={() => handlePurchase(pack.slug)}
                        className="flex flex-col items-center gap-1 rounded-xl border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Payment method */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <CreditCard className="size-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Managed via Stripe
                      </p>
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
  )
}
