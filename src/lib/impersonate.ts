import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

const COOKIE_NAME = "impersonate_user_id";

async function isAdmin(userId: string): Promise<boolean> {
  const rows = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return rows[0]?.role === "admin";
}

/**
 * Returns the effective userId for the current request.
 * If the caller is an admin with an active impersonation cookie,
 * returns the impersonated userId. Otherwise returns the session userId.
 */
export async function getEffectiveUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const jar = await cookies();
  const impersonatedId = jar.get(COOKIE_NAME)?.value;
  if (!impersonatedId) return session.user.id;

  // Only admins can impersonate
  if (!(await isAdmin(session.user.id))) return session.user.id;

  return impersonatedId;
}

/**
 * Returns the real admin session (ignoring impersonation).
 * Use this for admin-only routes that should never be impersonated.
 */
export async function getRealSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function setImpersonation(targetUserId: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, targetUserId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 hours
  });
}

export async function clearImpersonation() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getImpersonationTarget(): Promise<{
  isImpersonating: boolean;
  targetUser: { id: string; name: string | null; email: string } | null;
}> {
  const jar = await cookies();
  const impersonatedId = jar.get(COOKIE_NAME)?.value;
  if (!impersonatedId) return { isImpersonating: false, targetUser: null };

  const rows = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, impersonatedId))
    .limit(1);

  if (!rows[0]) return { isImpersonating: false, targetUser: null };
  return { isImpersonating: true, targetUser: rows[0] };
}
