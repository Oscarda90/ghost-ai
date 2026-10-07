import { get, put } from "@vercel/blob";

import { parseCanvasSnapshot, type CanvasSnapshot } from "@/lib/canvas-snapshot";

// The Blob store is configured for private access; reads go through `get`
// with the server token, never the raw URL.
const BLOB_ACCESS = "private";

const canvasPathname = (projectId: string) => `canvas/${projectId}.json`;

/** Uploads the snapshot to `canvas/{projectId}.json` (overwriting) and returns its blob URL. */
export async function saveCanvasSnapshot(
  projectId: string,
  snapshot: CanvasSnapshot,
): Promise<string> {
  const blob = await put(canvasPathname(projectId), JSON.stringify(snapshot), {
    access: BLOB_ACCESS,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

/** Reads a saved snapshot by blob URL; null when the blob is missing or no longer valid. */
export async function loadCanvasSnapshot(url: string): Promise<CanvasSnapshot | null> {
  // Skip the CDN cache: the same URL is overwritten on every save.
  const result = await get(url, { access: BLOB_ACCESS, useCache: false });
  if (!result || result.statusCode !== 200) return null;

  const parsed = parseCanvasSnapshot(await new Response(result.stream).json());
  return parsed.ok ? parsed.value : null;
}
