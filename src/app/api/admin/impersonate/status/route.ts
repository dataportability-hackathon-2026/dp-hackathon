import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getImpersonationTarget } from "@/lib/impersonate";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ isImpersonating: false, targetUser: null });

  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (rows[0]?.role !== "admin")
    return NextResponse.json({ isImpersonating: false, targetUser: null });

  const result = await getImpersonationTarget();
  return NextResponse.json(result);
}
