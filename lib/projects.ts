import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Project } from "@/types/project";

const projectSelect = { id: true, name: true, ownerId: true } as const;

/** Lowercased email addresses of the signed-in user (collaborators are stored by email). */
async function getCurrentUserEmails(): Promise<string[]> {
  const user = await currentUser();
  return user?.emailAddresses.map((email) => email.emailAddress.toLowerCase()) ?? [];
}

function toProject(record: { id: string; name: string; ownerId: string }, userId: string): Project {
  return {
    id: record.id,
    name: record.name,
    role: record.ownerId === userId ? "owner" : "collaborator",
  };
}

/** Projects owned by `userId` and projects shared with the user, newest first. */
export async function getUserProjects(userId: string) {
  const emails = await getCurrentUserEmails();

  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: projectSelect,
    }),
    emails.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: { some: { email: { in: emails } } },
          },
          orderBy: { createdAt: "desc" },
          select: projectSelect,
        })
      : [],
  ]);

  return {
    ownedProjects: owned.map((project) => toProject(project, userId)),
    sharedProjects: shared.map((project) => toProject(project, userId)),
  };
}

/** The project when `userId` owns it or is a collaborator on it; otherwise null. */
export async function getAccessibleProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ...projectSelect, collaborators: { select: { email: true } } },
  });
  if (!project) return null;

  if (project.ownerId !== userId) {
    const emails = await getCurrentUserEmails();
    const isCollaborator = project.collaborators.some((collaborator) =>
      emails.includes(collaborator.email.toLowerCase()),
    );
    if (!isCollaborator) return null;
  }

  return toProject(project, userId);
}
