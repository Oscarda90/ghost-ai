import { badRequest, notFound, unauthorized } from '@/lib/api-response';
import { parseCanvasSnapshot } from '@/lib/canvas-snapshot';
import { loadCanvasSnapshot, saveCanvasSnapshot } from '@/lib/canvas-storage';
import { accessibleProjectsWhere, getCurrentIdentity } from '@/lib/project-access';
import { readJsonObject } from '@/lib/project-input';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/canvas'>,
) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const { projectId } = await ctx.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...accessibleProjectsWhere(identity) },
    select: { canvasJsonPath: true },
  });
  if (!project) return notFound();

  const canvas = project.canvasJsonPath
    ? await loadCanvasSnapshot(project.canvasJsonPath)
    : null;
  return Response.json({ canvas });
}

export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/canvas'>,
) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const canvas = parseCanvasSnapshot(body.value);
  if (!canvas.ok) return badRequest(canvas.error);

  // Owners and collaborators both edit the canvas, so both may save it.
  const { projectId } = await ctx.params;
  const project = await prisma.project.findFirst({
    where: { id: projectId, ...accessibleProjectsWhere(identity) },
    select: { id: true },
  });
  if (!project) return notFound();

  const canvasJsonPath = await saveCanvasSnapshot(projectId, canvas.value);
  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath },
  });

  return new Response(null, { status: 204 });
}
