// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      // Canvas cursor coordinates; null when the pointer is outside the canvas
      cursor: { x: number; y: number } | null;
      // True while the user is waiting on an AI response
      isThinking: boolean;
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    // Example, a conflict-free list: `animals: LiveList<string>`
    Storage: Record<string, never>;

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      // Clerk user ID
      id: string;
      info: {
        name: string;
        avatar: string;
        // Deterministic per-user cursor color (see lib/liveblocks.ts)
        color: string;
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener
    // Example, a union: `{ type: "PLAY" } | { type: "REACTION"; emoji: "🔥" }`
    RoomEvent: Record<string, never>;

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    // Example, attaching coordinates to a thread: `x: number; y: number`
    ThreadMetadata: Record<string, never>;

    // Custom room info set with resolveRoomsInfo, for useRoomInfo
    // Example, rooms with a title and url: `title: string; url: string`
    RoomInfo: Record<string, never>;
  }
}

export {};
