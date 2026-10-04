import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Collaborator } from "@/types/collaborator";

interface ClerkProfile {
  name: string | null;
  avatarUrl: string | null;
}

/** Clerk's `emailAddress` filter accepts up to 100 addresses per request. */
const CLERK_EMAIL_BATCH_SIZE = 100;

/**
 * Looks up Clerk users by email → display name + avatar, keyed by lowercased
 * email. Clerk matches emails partially, so results are re-keyed by exact
 * address. Emails without a Clerk user are absent from the map.
 */
async function getClerkProfiles(emails: string[]) {
  const profiles = new Map<string, ClerkProfile>();
  if (emails.length === 0) return profiles;

  const client = await clerkClient();
  const wanted = new Set(emails);

  for (let start = 0; start < emails.length; start += CLERK_EMAIL_BATCH_SIZE) {
    const batch = emails.slice(start, start + CLERK_EMAIL_BATCH_SIZE);
    const { data: users } = await client.users.getUserList({
      emailAddress: batch,
      limit: CLERK_EMAIL_BATCH_SIZE,
    });

    for (const user of users) {
      const profile = {
        name: user.fullName?.trim() || user.username || null,
        avatarUrl: user.imageUrl || null,
      };
      for (const { emailAddress } of user.emailAddresses) {
        const email = emailAddress.toLowerCase();
        if (wanted.has(email)) profiles.set(email, profile);
      }
    }
  }

  return profiles;
}

/** Project collaborators, oldest first, enriched with Clerk profile data when available. */
export async function listCollaborators(projectId: string): Promise<Collaborator[]> {
  const records = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });

  let profiles = new Map<string, ClerkProfile>();
  try {
    profiles = await getClerkProfiles(records.map(({ email }) => email.toLowerCase()));
  } catch (error) {
    // Enrichment is cosmetic; fall back to email-only rows if Clerk is unavailable.
    console.error("Failed to load collaborator profiles from Clerk", error);
  }

  return records.map(({ id, email }) => {
    const profile = profiles.get(email.toLowerCase());
    return {
      id,
      email,
      name: profile?.name ?? null,
      avatarUrl: profile?.avatarUrl ?? null,
    };
  });
}
