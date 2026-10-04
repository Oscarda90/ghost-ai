import { forbidden, notFound } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

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
