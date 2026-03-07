"use client"

import { useCallback, useEffect, useState } from "react"
import { Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"

type ImpersonationStatus = {
  isImpersonating: boolean
  targetUser: { id: string; name: string | null; email: string } | null
}

export function ImpersonationBanner() {
  const [status, setStatus] = useState<ImpersonationStatus | null>(null)

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/admin/impersonate/status")
    if (res.ok) {
      setStatus(await res.json() as ImpersonationStatus)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  async function stopImpersonating() {
    await fetch("/api/admin/impersonate", { method: "DELETE" })
    window.location.href = "/admin"
  }

  if (!status?.isImpersonating || !status.targetUser) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-black">
      <Eye className="size-4" />
      <span>
        Viewing as <strong>{status.targetUser.name ?? status.targetUser.email}</strong>
      </span>
      <Button
        variant="outline"
        size="sm"
        className="ml-2 h-6 gap-1 border-black/20 bg-transparent text-black hover:bg-black/10"
        onClick={stopImpersonating}
      >
        <X className="size-3" />
        Stop
      </Button>
    </div>
  )
}
