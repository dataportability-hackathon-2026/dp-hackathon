import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { type NextRequest, NextResponse } from "next/server";
import { getEffectiveUserId } from "@/lib/impersonate";
import {
  ALLOWED_CONTENT_TYPES,
  maxSizeForFile,
  sanitizeFilename,
  validateFilename,
} from "@/lib/sources/upload-validation";

/**
 * POST /api/upload
 *
 * Vercel Blob client-upload handler. Generates short-lived client tokens
 * so the browser uploads directly to Vercel Blob — bypassing the Next.js
 * body-size limit entirely.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const response = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const userId = await getEffectiveUserId();
        if (!userId) throw new Error("Unauthorized");

        // clientPayload carries { topicSlug, projectId? } from the client
        const payload = clientPayload
          ? (JSON.parse(clientPayload) as {
              topicSlug: string;
              projectId?: string;
            })
          : null;

        if (!payload?.topicSlug) {
          throw new Error("topicSlug is required");
        }

        // Extract filename from pathname and validate
        const filename = pathname.split("/").pop() ?? pathname;
        const validationError = validateFilename(filename);
        if (validationError) {
          throw new Error(validationError);
        }

        const safeName = sanitizeFilename(filename);

        console.log("[upload] generating token", {
          pathname,
          safeName,
          userId,
          topicSlug: payload.topicSlug,
        });

        return {
          addRandomSuffix: true,
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: maxSizeForFile(safeName),
          tokenPayload: JSON.stringify({
            userId,
            topicSlug: payload.topicSlug,
            projectId: payload.projectId ?? null,
          }),
        };
      },
      onUploadCompleted: async () => {
        // Registration is handled client-side via /api/sources/register
        // so we don't need to do anything here.
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload handler failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
