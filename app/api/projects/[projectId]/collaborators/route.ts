import {
  badRequest,
  conflict,
  notFound,
  unauthorized,
} from '@/lib/api-response';
import { listCollaborators } from '@/lib/collaborators';
import {
  assertProjectOwner,
  getAccessibleProject,
  getCurrentIdentity,
} from '@/lib/project-access';
import { parseCollaboratorEmail, readJsonObject } from '@/lib/project-input';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/collaborators'>,
) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  // Owners and collaborators may read the list; anyone else sees 404.
  const { projectId } = await ctx.params;
  const project = await getAccessibleProject(projectId, identity);
  if (!project) return notFound();

  const collaborators = await listCollaborators(projectId);
  return Response.json({ collaborators });
}

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/collaborators'>,
) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const email = parseCollaboratorEmail(body.value);
  if (!email.ok) return badRequest(email.error);

  const { projectId } = await ctx.params;
  const denied = await assertProjectOwner(projectId, identity.userId);
  if (denied) return denied;

  if (email.value === identity.primaryEmail) {
    return badRequest('You already own this project');
  }

  const existing = await prisma.projectCollaborator.findFirst({
    where: { projectId, email: { equals: email.value, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) return conflict('This person is already a collaborator');

  try {
    await prisma.projectCollaborator.create({
      data: { projectId, email: email.value },
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return conflict('This person is already a collaborator');
    }
    throw error;
  }

  const collaborators = await listCollaborators(projectId);
  return Response.json({ collaborators }, { status: 201 });
}
