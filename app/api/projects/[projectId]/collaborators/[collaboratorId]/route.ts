import { notFound, unauthorized } from "@/lib/api-response";
import { assertProjectOwner, getCurrentIdentity } from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]/collaborators/[collaboratorId]">,
) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId, collaboratorId } = await ctx.params;
  const denied = await assertProjectOwner(projectId, identity.userId);
  if (denied) return denied;

  // Scoped to the project so an ID from another project can't be removed here.
  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });
  if (count === 0) return notFound();

  return new Response(null, { status: 204 });
}
