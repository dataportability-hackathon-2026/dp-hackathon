import { put } from "@vercel/blob";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedArtifact } from "@/db/schema";
import { auth } from "@/lib/auth";

/**
 * GET /api/user-artifacts?topicSlug=...
 * Fetches all completed artifacts for the current user, optionally filtered by topicSlug.
 * Returns the full artifact JSON (fetched from blob URLs).
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topicSlug = request.nextUrl.searchParams.get("topicSlug");

  const rows = await db
    .select()
    .from(generatedArtifact)
    .where(
      and(
        eq(generatedArtifact.userId, session.user.id),
        eq(generatedArtifact.status, "completed"),
      ),
    );

  // Fetch blob JSON for each artifact and reconstruct the full artifact object
  const artifacts = await Promise.all(
    rows.map(async (row) => {
      try {
        const res = await fetch(row.blobUrl);
        if (!res.ok) return null;
        const data = await res.json();

        // The blob stores the inner data; reconstruct the full Artifact shape
        const artifact = {
          id: row.id,
          type: row.artifactType,
          topicSlug: data.topicSlug ?? null,
          ...data,
        };

        // Filter by topicSlug if provided
        if (topicSlug && artifact.topicSlug !== topicSlug) return null;

        return artifact;
      } catch {
        return null;
      }
    }),
  );

  return NextResponse.json(artifacts.filter(Boolean));
}

/**
 * POST /api/user-artifacts
 * Persists an artifact to Vercel Blob + DB for the current user.
 * Body: { artifact: Artifact }
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const artifact = body.artifact;

  if (!artifact?.id || !artifact?.type) {
    return NextResponse.json(
      { error: "Invalid artifact: missing id or type" },
      { status: 400 },
    );
  }

  // Check if this artifact already exists (idempotent)
  const existing = await db
    .select({ id: generatedArtifact.id })
    .from(generatedArtifact)
    .where(eq(generatedArtifact.id, artifact.id))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ ok: true, alreadyExists: true });
  }

  // Upload artifact JSON to Vercel Blob
  const blob = await put(
    `artifacts/${session.user.id}/${artifact.type}-${Date.now()}.json`,
    JSON.stringify(artifact),
    { access: "public", contentType: "application/json" },
  );

  // Insert DB record
  await db.insert(generatedArtifact).values({
    id: artifact.id,
    userId: session.user.id,
    artifactType: artifact.type,
    title:
      artifact.title ?? `${artifact.type} — ${new Date().toLocaleDateString()}`,
    blobUrl: blob.url,
    status: "completed",
  });

  return NextResponse.json({ ok: true });
}
