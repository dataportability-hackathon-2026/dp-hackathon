"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

type CreditContextValue = {
  balance: number
  displayCredits: number
  loading: boolean
  refresh: () => void
}

const CreditContext = createContext<CreditContextValue | null>(null)

type BalanceResponse = {
  balance: number
  displayCredits: number
}

export function CreditProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0)
  const [displayCredits, setDisplayCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    fetch("/api/billing/balance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch balance")
        return res.json() as Promise<BalanceResponse>
      })
      .then((data) => {
        setBalance(data.balance)
        setDisplayCredits(data.displayCredits)
      })
      .catch(() => {
        // Silently handle errors, keep previous values
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30_000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <CreditContext value={{ balance, displayCredits, loading, refresh }}>
      {children}
    </CreditContext>
  )
}

export function useCredits(): CreditContextValue {
  const context = useContext(CreditContext)
  if (!context) {
    throw new Error("useCredits must be used within a CreditProvider")
  }
  return context
}
