"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type CreditContextValue = {
  balance: number;
  displayCredits: number;
  unlimited: boolean;
  loading: boolean;
  refresh: () => void;
};

const CreditContext = createContext<CreditContextValue | null>(null);

type BalanceResponse = {
  balance: number;
  displayCredits: number;
  unlimited?: boolean;
};

export function CreditProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(0);
  const [displayCredits, setDisplayCredits] = useState(0);
  const [unlimited, setUnlimited] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch("/api/billing/balance")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch balance");
        return res.json() as Promise<BalanceResponse>;
      })
      .then((data) => {
        setBalance(data.balance);
        setDisplayCredits(data.displayCredits);
        setUnlimited(data.unlimited ?? false);
      })
      .catch(() => {
        // Silently handle errors, keep previous values
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <CreditContext
      value={{ balance, displayCredits, unlimited, loading, refresh }}
    >
      {children}
    </CreditContext>
  );
}

export function useCredits(): CreditContextValue {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditProvider");
  }
  return context;
}
