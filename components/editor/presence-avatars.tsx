"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { shallow, useOthersMapped } from "@liveblocks/react/suspense";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

const MAX_VISIBLE_AVATARS = 5;

// Same size as the collaborator avatars so the group reads as one row.
const userButtonAppearance = { elements: { userButtonAvatarBox: "size-8" } };

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

/**
 * Top-right canvas overlay: other participants' avatars (display-only) plus the
 * current user's Clerk `UserButton`. The current user is resolved from the
 * Clerk session and excluded from the Liveblocks presence list.
 */
export function PresenceAvatars() {
  const { userId } = useAuth();
  const others = useOthersMapped(
    (other) => ({ id: other.id, ...other.info }),
    shallow,
  );

  // One avatar per user, even if they have several tabs/connections open.
  const collaborators = useMemo(() => {
    const byId = new Map<string, Collaborator>();
    for (const [, user] of others) {
      if (user.id === userId || byId.has(user.id)) continue;
      byId.set(user.id, user);
    }
    return [...byId.values()];
  }, [others, userId]);

  const visible = collaborators.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = collaborators.length - visible.length;

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3 rounded-full border border-surface-border bg-bg-surface/90 p-1.5 shadow-lg backdrop-blur">
      {collaborators.length > 0 && (
        <>
          <ul className="flex items-center -space-x-2" aria-label="Collaborators in this room">
            {visible.map((user) => (
              <li key={user.id} title={user.name}>
                <CollaboratorAvatar user={user} />
              </li>
            ))}
            {overflow > 0 && (
              <li
                title={`${overflow} more`}
                className="flex size-8 items-center justify-center rounded-full bg-bg-elevated text-xs font-medium text-copy-secondary ring-2 ring-bg-surface"
              >
                +{overflow}
              </li>
            )}
          </ul>
          <span aria-hidden className="h-6 w-px bg-surface-border" />
        </>
      )}
      <div className="flex size-8 items-center justify-center">
        <UserButton appearance={userButtonAppearance} />
      </div>
    </div>
  );
}

function CollaboratorAvatar({ user }: { user: Collaborator }) {
  const className = "size-8 rounded-full ring-2 ring-bg-surface";

  if (user.avatar) {
    return (
      // Clerk avatar hosts vary per instance; a plain <img> avoids next/image remote config.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.avatar} alt={user.name} className={cn(className, "object-cover")} />
    );
  }

  return (
    <span
      aria-label={user.name}
      className={cn(className, "flex items-center justify-center text-xs font-medium text-bg-base uppercase")}
      style={{ backgroundColor: user.color }}
    >
      {getInitials(user.name)}
    </span>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
}
