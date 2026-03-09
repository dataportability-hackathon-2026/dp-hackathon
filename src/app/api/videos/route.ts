import { NextResponse } from "next/server";
import { listArtifacts } from "@/lib/artifacts";

export async function GET() {
  try {
    // Try to fetch the manifest directly
    const blobs = await listArtifacts("videos/");
    const manifestBlob = blobs.blobs.find((b) =>
      b.pathname.endsWith("manifest.json"),
    );

    if (manifestBlob) {
      const res = await fetch(manifestBlob.url);
      if (res.ok) {
        const manifest = await res.json();
        return NextResponse.json(manifest);
      }
    }

    // Fallback: return blob listing grouped by script
    const videos = blobs.blobs
      .filter((b) => b.pathname.endsWith(".mp4"))
      .map((b) => ({
        pathname: b.pathname,
        url: b.url,
        size: b.size,
        uploadedAt: b.uploadedAt,
      }));

    return NextResponse.json({ videos });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
