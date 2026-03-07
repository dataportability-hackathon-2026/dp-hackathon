import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = ["admin@coremodel.ai"];

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (ADMIN_EMAILS.includes(session.user.email)) {
    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ role: "admin" });
  }

  return NextResponse.json({ role: "user" });
}
