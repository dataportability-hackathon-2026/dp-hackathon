import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, promoCode } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (rows[0]?.role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const codes = await db
    .select()
    .from(promoCode)
    .orderBy(desc(promoCode.createdAt));

  return NextResponse.json({
    codes: codes.map((c) => ({
      ...c,
      displayCredits: c.creditAmount / 1000,
    })),
  });
}

type CreateBody = {
  code: string;
  displayCredits: number;
  maxUses?: number | null;
  expiresAt?: string | null;
};

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as CreateBody;
  const { code, displayCredits, maxUses, expiresAt } = body;

  if (!code || !displayCredits || displayCredits <= 0) {
    return NextResponse.json(
      { error: "code and displayCredits are required" },
      { status: 400 },
    );
  }

  const normalizedCode = code.trim().toUpperCase();

  // Check for duplicate
  const existing = await db
    .select({ id: promoCode.id })
    .from(promoCode)
    .where(eq(promoCode.code, normalizedCode))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "A promo code with this name already exists" },
      { status: 409 },
    );
  }

  const [created] = await db
    .insert(promoCode)
    .values({
      code: normalizedCode,
      creditAmount: displayCredits * 1000,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: session.user.id,
    })
    .returning();

  return NextResponse.json({
    success: true,
    promoCode: { ...created, displayCredits: created.creditAmount / 1000 },
  });
}

type PatchBody = {
  id: string;
  active?: boolean;
  maxUses?: number | null;
  expiresAt?: string | null;
};

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as PatchBody;
  const { id, active, maxUses, expiresAt } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (active !== undefined) updates.active = active;
  if (maxUses !== undefined) updates.maxUses = maxUses;
  if (expiresAt !== undefined)
    updates.expiresAt = expiresAt ? new Date(expiresAt) : null;

  const [updated] = await db
    .update(promoCode)
    .set(updates)
    .where(eq(promoCode.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Promo code not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    promoCode: { ...updated, displayCredits: updated.creditAmount / 1000 },
  });
}
