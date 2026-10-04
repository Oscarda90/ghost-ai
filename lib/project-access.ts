import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";

import { forbidden, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import type { Project } from "@/types/project";

export interface Identity {
  userId: string;
  /** Lowercased primary email; null when the Clerk user has none. */
  primaryEmail: string | null;
}

/** Signed-in Clerk user's ID + primary email, or null when unauthenticated. Deduped per request. */
export const getCurrentIdentity = cache(async (): Promise<Identity | null> => {
  const user = await currentUser();
  if (!user) return null;

  return {
    userId: user.id,
    primaryEmail: user.primaryEmailAddress?.emailAddress.toLowerCase() ?? null,
  };
});

/** Prisma filter: projects owned by the identity or shared with its primary email. */
export function accessibleProjectsWhere({ userId, primaryEmail }: Identity) {
  return {
    OR: [
      { ownerId: userId },
      ...(primaryEmail
        ? [
            {
              collaborators: {
                some: {
                  email: { equals: primaryEmail, mode: "insensitive" as const },
                },
              },
            },
          ]
        : []),
    ],
  };
}

export function toProject(
  record: { id: string; name: string; ownerId: string },
  userId: string,
): Project {
  return {
    id: record.id,
    name: record.name,
    role: record.ownerId === userId ? "owner" : "collaborator",
  };
}

/** The project when the identity owns it or is a collaborator; null when missing or not accessible. */
export async function getAccessibleProject(
  projectId: string,
  identity: Identity,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...accessibleProjectsWhere(identity) },
    select: { id: true, name: true, ownerId: true },
  });

  return project ? toProject(project, identity.userId) : null;
}

/**
 * Ensures `userId` owns the project. Returns an error response to send back,
 * or `null` when the caller may proceed with the mutation.
 */
export async function assertProjectOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return notFound();
  if (project.ownerId !== userId) return forbidden();
  return null;
}
