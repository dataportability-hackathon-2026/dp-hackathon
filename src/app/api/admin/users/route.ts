import { NextResponse, type NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addCredits, deductCredits, getBalance } from "@/lib/credits";

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

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      creditBalance: user.creditBalance,
      createdAt: user.createdAt,
    })
    .from(user);

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      displayCredits: (u.creditBalance ?? 0) / 1000,
    })),
  });
}

type PatchBody = {
  userId: string;
  creditAdjustment: number;
  role?: string;
};

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin();
  if (!session)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json()) as PatchBody;
  const { userId, creditAdjustment, role: newRole } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Update role if provided
  if (newRole && (newRole === "admin" || newRole === "user")) {
    await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
  }

  // Adjust credits if non-zero
  if (creditAdjustment && creditAdjustment !== 0) {
    const amount = Math.abs(creditAdjustment) * 1000; // Convert display credits to internal
    if (creditAdjustment > 0) {
      await addCredits(
        userId,
        amount,
        "adjustment",
        `Admin adjustment by ${session.user.email}`,
      );
    } else {
      await deductCredits(
        userId,
        amount,
        `Admin adjustment by ${session.user.email}`,
      );
    }
  }

  const newBalance = await getBalance(userId);

  return NextResponse.json({
    success: true,
    newBalance,
    displayCredits: newBalance / 1000,
  });
}
