import { Liveblocks } from "@liveblocks/node";

const globalForLiveblocks = globalThis as unknown as {
  liveblocks: Liveblocks | undefined;
};

/**
 * Cached server-side Liveblocks client. Created lazily so importing this
 * module (e.g. during `next build`) doesn't require the secret key.
 */
export function getLiveblocks() {
  if (globalForLiveblocks.liveblocks) return globalForLiveblocks.liveblocks;

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");

  const liveblocks = new Liveblocks({ secret });
  globalForLiveblocks.liveblocks = liveblocks;
  return liveblocks;
}

/** Cursor colors; chosen to stay legible on the dark canvas. */
const CURSOR_COLORS = [
  "#f87171",
  "#fb923c",
  "#facc15",
  "#4ade80",
  "#2dd4bf",
  "#38bdf8",
  "#818cf8",
  "#c084fc",
  "#f472b6",
  "#a3e635",
] as const;

/** Deterministically maps a user ID to a color from `CURSOR_COLORS`. */
export function getUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}
