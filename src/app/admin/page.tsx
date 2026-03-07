"use client";

import {
  Eye,
  Loader2,
  Minus,
  Plus,
  Save,
  Ticket,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  creditBalance: number;
  displayCredits: number;
  createdAt: string | null;
};

type PromoCodeRow = {
  id: string;
  code: string;
  creditAmount: number;
  displayCredits: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string | null;
};

type UsersResponse = { users: UserRow[] };
type PromoCodesResponse = { codes: PromoCodeRow[] };
type PatchResponse = { success: boolean; displayCredits: number };
type PromoCreateResponse = { success: boolean; promoCode: PromoCodeRow };
type PromoUpdateResponse = { success: boolean; promoCode: PromoCodeRow };

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [tab, setTab] = useState<"users" | "promos">("users");

  // Promo code creation form
  const [newCode, setNewCode] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.status === 403) {
      router.push("/");
      return;
    }
    const data = (await res.json()) as UsersResponse;
    setUsers(data.users);
  }, [router]);

  const fetchPromoCodes = useCallback(async () => {
    const res = await fetch("/api/admin/promo-codes");
    if (res.ok) {
      const data = (await res.json()) as PromoCodesResponse;
      setPromoCodes(data.codes);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
      return;
    }
    if (session) {
      Promise.all([fetchUsers(), fetchPromoCodes()]).then(() =>
        setLoading(false),
      );
    }
  }, [session, isPending, router, fetchUsers, fetchPromoCodes]);

  function updateAdjustment(userId: string, delta: number) {
    setAdjustments((prev) => ({
      ...prev,
      [userId]: (prev[userId] ?? 0) + delta,
    }));
  }

  async function saveAdjustment(userId: string) {
    const adjustment = adjustments[userId];
    if (!adjustment || adjustment === 0) return;

    setSaving(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, creditAdjustment: adjustment }),
    });

    if (res.ok) {
      const data = (await res.json()) as PatchResponse;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                displayCredits: data.displayCredits,
                creditBalance: data.displayCredits * 1000,
              }
            : u,
        ),
      );
      setAdjustments((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    }
    setSaving(null);
  }

  async function createPromoCode() {
    setPromoError("");
    const credits = Number.parseFloat(newCredits);
    if (!newCode.trim() || !credits || credits <= 0) {
      setPromoError("Code and a positive credit amount are required");
      return;
    }

    setCreatingPromo(true);
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: newCode.trim(),
        displayCredits: credits,
        maxUses: newMaxUses ? Number.parseInt(newMaxUses, 10) : null,
        expiresAt: newExpiry || null,
      }),
    });

    if (!res.ok) {
      const err = (await res.json()) as { error: string };
      setPromoError(err.error);
    } else {
      const data = (await res.json()) as PromoCreateResponse;
      setPromoCodes((prev) => [data.promoCode, ...prev]);
      setNewCode("");
      setNewCredits("");
      setNewMaxUses("");
      setNewExpiry("");
    }
    setCreatingPromo(false);
  }

  async function togglePromoActive(id: string, currentlyActive: boolean) {
    const res = await fetch("/api/admin/promo-codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !currentlyActive }),
    });
    if (res.ok) {
      const data = (await res.json()) as PromoUpdateResponse;
      setPromoCodes((prev) =>
        prev.map((c) => (c.id === id ? data.promoCode : c)),
      );
    }
  }

  async function viewAsUser(userId: string) {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      window.location.href = "/";
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, credits, and promo codes
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/")}>
          Back to App
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={tab === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("users")}
        >
          Users
        </Button>
        <Button
          variant={tab === "promos" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("promos")}
        >
          <Ticket className="size-4" data-icon="inline-start" />
          Promo Codes
        </Button>
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[80px]" />
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Adjust</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const adj = adjustments[u.id] ?? 0;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "admin" ? "default" : "secondary"}
                      >
                        {u.role ?? "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        onClick={() => viewAsUser(u.id)}
                      >
                        <Eye className="size-3" />
                        View as
                      </Button>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Math.round(u.displayCredits)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => updateAdjustment(u.id, -10)}
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Input
                          className="w-20 text-center tabular-nums h-7"
                          value={adj}
                          onChange={(e) => {
                            const val = Number.parseInt(e.target.value, 10);
                            setAdjustments((prev) => ({
                              ...prev,
                              [u.id]: Number.isNaN(val) ? 0 : val,
                            }));
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() => updateAdjustment(u.id, 10)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={adj === 0 || saving === u.id}
                        onClick={() => saveAdjustment(u.id)}
                      >
                        {saving === u.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Save className="size-3" data-icon="inline-start" />
                        )}
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Promo Codes Tab */}
      {tab === "promos" && (
        <div className="space-y-6">
          {/* Create new promo code */}
          <div className="rounded-lg border p-4 space-y-4">
            <h2 className="text-lg font-semibold">Create Promo Code</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Code
                </label>
                <Input
                  placeholder="WELCOME50"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Credits
                </label>
                <Input
                  type="number"
                  placeholder="50"
                  value={newCredits}
                  onChange={(e) => setNewCredits(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Max Uses (optional)
                </label>
                <Input
                  type="number"
                  placeholder="Unlimited"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Expires (optional)
                </label>
                <Input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                />
              </div>
            </div>
            {promoError && (
              <p className="text-sm text-destructive">{promoError}</p>
            )}
            <Button onClick={createPromoCode} disabled={creatingPromo}>
              {creatingPromo ? (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <Plus className="size-4" data-icon="inline-start" />
              )}
              Create Code
            </Button>
          </div>

          {/* Promo codes list */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                  <TableHead className="text-right">Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No promo codes yet. Create one above.
                    </TableCell>
                  </TableRow>
                ) : (
                  promoCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <code className="rounded bg-muted px-2 py-0.5 text-sm font-mono">
                          {code.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {code.displayCredits}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {code.usedCount}
                        {code.maxUses !== null ? ` / ${code.maxUses}` : ""}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {code.expiresAt
                          ? new Date(code.expiresAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={code.active ? "default" : "secondary"}>
                          {code.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() =>
                            togglePromoActive(code.id, code.active)
                          }
                          title={code.active ? "Deactivate" : "Activate"}
                        >
                          {code.active ? (
                            <ToggleRight className="size-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
