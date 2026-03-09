import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createGateway } from "@ai-sdk/gateway";
import { put } from "@vercel/blob";
import { experimental_generateVideo as generateVideo } from "ai";
import { videoScripts } from "./video-scripts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars from .env.local
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const FFMPEG = "/opt/homebrew/bin/ffmpeg";
const TMP_DIR = "/tmp/coremodel-videos";
const MAX_RETRIES = 2;
const RATE_LIMIT_DELAY_MS = 65_000; // 65s between requests (1 req/min limit)

// Configure Vercel AI Gateway
const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

type ManifestEntry = {
  id: string;
  title: string;
  tagline: string;
  finalUrl: string;
  clipUrls: string[];
  scenes: { prompt: string; durationSeconds: number }[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateClip(
  scriptId: string,
  sceneIndex: number,
  prompt: string,
  durationSeconds: number,
): Promise<string> {
  const outDir = join(TMP_DIR, scriptId);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `clip-${sceneIndex}.mp4`);

  // Skip if already generated
  if (existsSync(outPath)) {
    console.log(`  [${scriptId}] clip-${sceneIndex} already exists, skipping`);
    return outPath;
  }

  console.log(
    `  [${scriptId}] Generating clip-${sceneIndex} (${durationSeconds}s)...`,
  );

  const result = await generateVideo({
    model: gateway.videoModel("google/veo-3.1-generate-001"),
    prompt,
    providerOptions: {
      google: {
        numberOfVideos: 1,
        durationSeconds,
        personGeneration: "allow_all" as const,
      },
    },
  });

  const videoData = result.video;
  if (!videoData) {
    throw new Error(
      `No video data returned for ${scriptId} clip-${sceneIndex}`,
    );
  }

  // The video comes back as a GeneratedFile with uint8Array property
  const bytes = videoData.uint8Array;
  writeFileSync(outPath, bytes);
  console.log(
    `  [${scriptId}] clip-${sceneIndex} saved (${(bytes.length / 1024 / 1024).toFixed(1)}MB)`,
  );
  return outPath;
}

async function generateClipWithRetry(
  scriptId: string,
  sceneIndex: number,
  prompt: string,
  durationSeconds: number,
): Promise<string> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await generateClip(scriptId, sceneIndex, prompt, durationSeconds);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_RETRIES) {
        const isRateLimit = msg.includes("quota");
        const delayMs = isRateLimit ? RATE_LIMIT_DELAY_MS : 5_000;
        console.warn(
          `  [${scriptId}] clip-${sceneIndex} attempt ${attempt + 1} failed: ${msg}. Waiting ${Math.round(delayMs / 1000)}s before retry...`,
        );
        await sleep(delayMs);
      } else {
        throw new Error(
          `[${scriptId}] clip-${sceneIndex} failed after ${MAX_RETRIES + 1} attempts: ${msg}`,
        );
      }
    }
  }
  throw new Error("unreachable");
}

function composeVideo(scriptId: string, clipCount: number): string {
  const dir = join(TMP_DIR, scriptId);
  const filelistPath = join(dir, "filelist.txt");
  const finalPath = join(dir, "final.mp4");

  if (existsSync(finalPath)) {
    console.log(`  [${scriptId}] final.mp4 already exists, skipping compose`);
    return finalPath;
  }

  // Create ffmpeg concat demuxer file
  const lines: string[] = [];
  for (let i = 0; i < clipCount; i++) {
    lines.push(`file 'clip-${i}.mp4'`);
  }
  writeFileSync(filelistPath, lines.join("\n"));

  console.log(`  [${scriptId}] Composing ${clipCount} clips into final.mp4...`);
  execSync(
    `${FFMPEG} -f concat -safe 0 -i "${filelistPath}" -c copy "${finalPath}"`,
    { stdio: "pipe" },
  );
  console.log(`  [${scriptId}] final.mp4 composed`);
  return finalPath;
}

async function uploadFile(
  localPath: string,
  blobPath: string,
): Promise<string> {
  const data = readFileSync(localPath);
  const blob = await put(blobPath, data, {
    access: "public",
    contentType: "video/mp4",
  });
  return blob.url;
}

async function main() {
  console.log("=== CoreModel Video Generation Pipeline ===\n");

  if (!process.env.AI_GATEWAY_API_KEY) {
    console.error("Missing AI_GATEWAY_API_KEY in .env.local");
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Missing BLOB_READ_WRITE_TOKEN in .env.local");
    process.exit(1);
  }

  mkdirSync(TMP_DIR, { recursive: true });

  const manifest: ManifestEntry[] = [];

  for (const script of videoScripts) {
    console.log(`\n--- Script: "${script.title}" (${script.id}) ---`);

    try {
      // Generate clips sequentially (1 req/min rate limit)
      const clipPaths: string[] = [];
      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];
        const clipPath = await generateClipWithRetry(
          script.id,
          i,
          scene.prompt,
          scene.durationSeconds,
        );
        clipPaths.push(clipPath);

        // Wait between requests to respect rate limit
        if (i < script.scenes.length - 1) {
          console.log(
            `  [${script.id}] Waiting ${Math.round(RATE_LIMIT_DELAY_MS / 1000)}s for rate limit...`,
          );
          await sleep(RATE_LIMIT_DELAY_MS);
        }
      }

      // Compose final video
      const finalPath = composeVideo(script.id, clipPaths.length);

      // Upload all clips + final to Vercel Blob
      console.log(`  [${script.id}] Uploading to Vercel Blob...`);

      const clipUrls: string[] = [];
      for (let i = 0; i < clipPaths.length; i++) {
        const url = await uploadFile(
          clipPaths[i],
          `videos/${script.id}/clip-${i}.mp4`,
        );
        clipUrls.push(url);
        console.log(`  [${script.id}] clip-${i} uploaded: ${url}`);
      }

      const finalUrl = await uploadFile(
        finalPath,
        `videos/${script.id}/final.mp4`,
      );
      console.log(`  [${script.id}] final uploaded: ${finalUrl}`);

      manifest.push({
        id: script.id,
        title: script.title,
        tagline: script.tagline,
        finalUrl,
        clipUrls,
        scenes: script.scenes.map((s) => ({
          prompt: s.prompt,
          durationSeconds: s.durationSeconds,
        })),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [${script.id}] SKIPPED due to error: ${msg}`);
    }
  }

  // Upload manifest
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestBlob = await put("videos/manifest.json", manifestJson, {
    access: "public",
    contentType: "application/json",
  });
  console.log(`\n--- Manifest uploaded: ${manifestBlob.url} ---`);

  // Print summary
  console.log("\n=== Summary ===\n");
  for (const entry of manifest) {
    console.log(`${entry.title} (${entry.id})`);
    console.log(`  Final: ${entry.finalUrl}`);
    for (let i = 0; i < entry.clipUrls.length; i++) {
      console.log(`  Clip ${i}: ${entry.clipUrls[i]}`);
    }
    console.log();
  }
  console.log(`Manifest: ${manifestBlob.url}`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
