/**
 * Client-side upload token endpoint
 *
 * The browser uploads the file DIRECTLY to Vercel Blob — it never passes
 * through this server. This bypasses Vercel's 4.5 MB serverless body limit
 * entirely, so large photography files work without any size restrictions.
 *
 * Flow:
 *   1. Browser calls POST here with { type: "blob.generate-client-token" }
 *   2. We validate the admin password from clientPayload and return a token
 *   3. Browser uploads directly to Vercel Blob using the token
 *   4. Browser calls POST /api/admin/photos to save the metadata record
 */

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

export async function POST(req: NextRequest) {
  const body = await req.json() as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // Validate admin password passed from the browser
        const { password } = JSON.parse(clientPayload ?? "{}") as { password?: string };
        if (!password || password !== ADMIN_PASSWORD) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: [
            "image/jpeg", "image/jpg", "image/png",
            "image/webp", "image/gif", "image/avif",
          ],
          addRandomSuffix: false,
          maximumSizeInBytes: 100 * 1024 * 1024, // 100 MB
        };
      },

      onUploadCompleted: async () => {
        // Metadata is saved separately via POST /api/admin/photos after upload
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
