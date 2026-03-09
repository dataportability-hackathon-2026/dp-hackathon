import { execSync } from "node:child_process";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
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
const LOG_FILE = join(__dirname, "..", "video-generation.log");

// CLI flags
const args = process.argv.slice(2);
const RECOMPOSE = args.includes("--recompose");
const SCRIPT_FILTER = args
  .find((a) => a.startsWith("--script="))
  ?.split("=")[1];

function log(message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);
  appendFileSync(LOG_FILE, `${line}\n`);
}

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
  hasAudio: boolean;
  scenes: { prompt: string; narration: string; durationSeconds: number }[];
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Video clip generation ──────────────────────────────────────────

async function generateClip(
  scriptId: string,
  sceneIndex: number,
  prompt: string,
  durationSeconds: number,
): Promise<string> {
  const outDir = join(TMP_DIR, scriptId);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `clip-${sceneIndex}.mp4`);

  if (existsSync(outPath)) {
    log(`  [${scriptId}] clip-${sceneIndex} already exists, skipping`);
    return outPath;
  }

  log(`  [${scriptId}] Generating clip-${sceneIndex} (${durationSeconds}s)...`);

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

  const bytes = videoData.uint8Array;
  writeFileSync(outPath, bytes);
  log(
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
        log(
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

// ── TTS narration generation ───────────────────────────────────────

async function generateNarration(
  scriptId: string,
  sceneIndex: number,
  narration: string,
  voice: string,
): Promise<string> {
  const outDir = join(TMP_DIR, scriptId);
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `narration-${sceneIndex}.mp3`);

  if (!RECOMPOSE && existsSync(outPath)) {
    log(`  [${scriptId}] narration-${sceneIndex} already exists, skipping`);
    return outPath;
  }

  log(
    `  [${scriptId}] Generating narration-${sceneIndex} (voice: ${voice})...`,
  );

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      input: narration,
      voice,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TTS API error ${response.status}: ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  writeFileSync(outPath, bytes);
  log(
    `  [${scriptId}] narration-${sceneIndex} saved (${(bytes.length / 1024).toFixed(0)}KB)`,
  );
  return outPath;
}

// ── Audio mixing ───────────────────────────────────────────────────

function mixAudioOntoClip(
  scriptId: string,
  sceneIndex: number,
  clipPath: string,
  narrationPath: string,
  musicPath: string | null,
): string {
  const outDir = join(TMP_DIR, scriptId);
  const mixedPath = join(outDir, `clip-${sceneIndex}-mixed.mp4`);

  if (!RECOMPOSE && existsSync(mixedPath)) {
    log(`  [${scriptId}] clip-${sceneIndex}-mixed already exists, skipping`);
    return mixedPath;
  }

  // Remove stale mixed file if recomposing
  if (existsSync(mixedPath)) {
    unlinkSync(mixedPath);
  }

  log(`  [${scriptId}] Mixing audio onto clip-${sceneIndex}...`);

  if (musicPath && existsSync(musicPath)) {
    // Mix narration + background music onto video
    // Narration at full volume, music at 15% volume
    execSync(
      `${FFMPEG} -y -i "${clipPath}" -i "${narrationPath}" -i "${musicPath}" ` +
        `-filter_complex "[1:a]volume=1.0[narr];[2:a]volume=0.15,aloop=loop=-1:size=2e+09[music];` +
        `[narr][music]amix=inputs=2:duration=shortest[aout]" ` +
        `-map 0:v -map "[aout]" -c:v copy -c:a aac -shortest "${mixedPath}"`,
      { stdio: "pipe" },
    );
  } else {
    // Narration only — overlay onto video, trim to video length
    execSync(
      `${FFMPEG} -y -i "${clipPath}" -i "${narrationPath}" ` +
        `-map 0:v -map 1:a -c:v copy -c:a aac -shortest "${mixedPath}"`,
      { stdio: "pipe" },
    );
  }

  log(`  [${scriptId}] clip-${sceneIndex}-mixed ready`);
  return mixedPath;
}

// ── Compose final video ────────────────────────────────────────────

function composeVideo(scriptId: string, mixedPaths: string[]): string {
  const dir = join(TMP_DIR, scriptId);
  const filelistPath = join(dir, "filelist.txt");
  const finalPath = join(dir, "final.mp4");

  // Check if final is stale — if any mixed clip is newer, recompose
  if (existsSync(finalPath) && !RECOMPOSE) {
    const finalMtime = statSync(finalPath).mtimeMs;
    const anyNewer = mixedPaths.some(
      (p) => existsSync(p) && statSync(p).mtimeMs > finalMtime,
    );
    if (!anyNewer) {
      log(
        `  [${scriptId}] final.mp4 already exists and is up-to-date, skipping compose`,
      );
      return finalPath;
    }
    log(
      `  [${scriptId}] final.mp4 is stale (mixed clips are newer), recomposing...`,
    );
  }

  // Remove stale final before recomposing
  if (existsSync(finalPath)) {
    unlinkSync(finalPath);
  }

  // Create ffmpeg concat demuxer file using mixed clip paths
  const lines = mixedPaths.map((p) => `file '${p}'`);
  writeFileSync(filelistPath, lines.join("\n"));

  log(
    `  [${scriptId}] Composing ${mixedPaths.length} mixed clips into final.mp4...`,
  );

  // Re-encode to ensure consistent streams for concat
  execSync(
    `${FFMPEG} -y -f concat -safe 0 -i "${filelistPath}" ` +
      `-c:v libx264 -preset fast -crf 23 -c:a aac -b:a 192k "${finalPath}"`,
    { stdio: "pipe" },
  );

  log(`  [${scriptId}] final.mp4 composed`);
  return finalPath;
}

// ── Upload ─────────────────────────────────────────────────────────

async function uploadFile(
  localPath: string,
  blobPath: string,
): Promise<string> {
  const data = readFileSync(localPath);
  const blob = await put(blobPath, data, {
    access: "public",
    contentType: "video/mp4",
    allowOverwrite: true,
  });
  return blob.url;
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  log("=== CoreModel Video Generation Pipeline ===");
  if (RECOMPOSE) log("  Mode: --recompose (regenerate audio + composite only)");
  if (SCRIPT_FILTER) log(`  Filter: --script=${SCRIPT_FILTER}`);

  if (!process.env.AI_GATEWAY_API_KEY) {
    log("ERROR: Missing AI_GATEWAY_API_KEY in .env.local");
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    log("ERROR: Missing BLOB_READ_WRITE_TOKEN in .env.local");
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    log("ERROR: Missing OPENAI_API_KEY in .env.local");
    process.exit(1);
  }

  mkdirSync(TMP_DIR, { recursive: true });

  // Optional background music file
  const musicPath = join(__dirname, "background-music.mp3");
  const hasMusic = existsSync(musicPath);
  if (hasMusic) {
    log(`  Background music found: ${musicPath}`);
  } else {
    log(
      "  No background music file (place background-music.mp3 in scripts/ to add)",
    );
  }

  const manifest: ManifestEntry[] = [];

  const scriptsToProcess = SCRIPT_FILTER
    ? videoScripts.filter((s) => s.id === SCRIPT_FILTER)
    : videoScripts;

  if (scriptsToProcess.length === 0) {
    log(`ERROR: No script found matching --script=${SCRIPT_FILTER}`);
    process.exit(1);
  }

  for (const script of scriptsToProcess) {
    log(`\n--- Script: "${script.title}" (${script.id}) ---`);

    const scriptDir = join(TMP_DIR, script.id);
    mkdirSync(scriptDir, { recursive: true });

    try {
      // Step 1: Generate video clips (skip in recompose mode)
      const clipPaths: string[] = [];
      let lastClipWasGenerated = false;

      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];

        if (RECOMPOSE) {
          // In recompose mode, clips must already exist
          const clipPath = join(scriptDir, `clip-${i}.mp4`);
          if (!existsSync(clipPath)) {
            throw new Error(
              `clip-${i}.mp4 not found — cannot recompose without existing clips`,
            );
          }
          clipPaths.push(clipPath);
          continue;
        }

        const clipAlreadyExists = existsSync(join(scriptDir, `clip-${i}.mp4`));

        if (lastClipWasGenerated && i > 0) {
          log(
            `  [${script.id}] Waiting ${Math.round(RATE_LIMIT_DELAY_MS / 1000)}s for rate limit...`,
          );
          await sleep(RATE_LIMIT_DELAY_MS);
        }

        const clipPath = await generateClipWithRetry(
          script.id,
          i,
          scene.prompt,
          scene.durationSeconds,
        );
        clipPaths.push(clipPath);
        lastClipWasGenerated = !clipAlreadyExists;
      }

      // Step 2: Generate TTS narration for each scene
      const narrationPaths: string[] = [];
      for (let i = 0; i < script.scenes.length; i++) {
        const scene = script.scenes[i];
        const narrationPath = await generateNarration(
          script.id,
          i,
          scene.narration,
          script.voice,
        );
        narrationPaths.push(narrationPath);
      }

      // Step 3: Mix audio onto each clip
      const mixedPaths: string[] = [];
      for (let i = 0; i < clipPaths.length; i++) {
        const mixedPath = mixAudioOntoClip(
          script.id,
          i,
          clipPaths[i],
          narrationPaths[i],
          hasMusic ? musicPath : null,
        );
        mixedPaths.push(mixedPath);
      }

      // Step 4: Compose final video from mixed clips
      const finalPath = composeVideo(script.id, mixedPaths);

      // Step 5: Upload all clips + final to Vercel Blob
      log(`  [${script.id}] Uploading to Vercel Blob...`);

      const clipUrls: string[] = [];
      for (let i = 0; i < mixedPaths.length; i++) {
        const url = await uploadFile(
          mixedPaths[i],
          `videos/${script.id}/clip-${i}.mp4`,
        );
        clipUrls.push(url);
        log(`  [${script.id}] clip-${i} uploaded: ${url}`);
      }

      const finalUrl = await uploadFile(
        finalPath,
        `videos/${script.id}/final.mp4`,
      );
      log(`  [${script.id}] final uploaded: ${finalUrl}`);

      manifest.push({
        id: script.id,
        title: script.title,
        tagline: script.tagline,
        finalUrl,
        clipUrls,
        hasAudio: true,
        scenes: script.scenes.map((s) => ({
          prompt: s.prompt,
          narration: s.narration,
          durationSeconds: s.durationSeconds,
        })),
      });

      log(`  [${script.id}] COMPLETE — ${clipUrls.length} clips + final`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  [${script.id}] SKIPPED due to error: ${msg}`);
    }
  }

  // Upload manifest
  const manifestJson = JSON.stringify(manifest, null, 2);
  const manifestBlob = await put("videos/manifest.json", manifestJson, {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
  log(`\n--- Manifest uploaded: ${manifestBlob.url} ---`);

  // Print summary
  log("\n=== Summary ===");
  for (const entry of manifest) {
    log(`${entry.title} (${entry.id}) — audio: ${entry.hasAudio}`);
    log(`  Final: ${entry.finalUrl}`);
    for (let i = 0; i < entry.clipUrls.length; i++) {
      log(`  Clip ${i}: ${entry.clipUrls[i]}`);
    }
  }
  log(`Manifest: ${manifestBlob.url}`);
  log("Done!");
}

main().catch((err) => {
  log(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
