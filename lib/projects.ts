import { prisma } from "@/lib/prisma";
import { type Identity, toProject } from "@/lib/project-access";

const projectSelect = { id: true, name: true, ownerId: true } as const;

/** Projects owned by the identity and projects shared with its primary email, newest first. */
export async function getUserProjects({ userId, primaryEmail }: Identity) {
  const [owned, shared] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: projectSelect,
    }),
    primaryEmail
      ? prisma.project.findMany({
          where: {
            ownerId: { not: userId },
            collaborators: { some: { email: { equals: primaryEmail, mode: "insensitive" } } },
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
