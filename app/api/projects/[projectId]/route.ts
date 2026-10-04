import { auth } from "@clerk/nextjs/server";

import { badRequest, unauthorized } from "@/lib/api-response";
import { assertProjectOwner } from "@/lib/project-access";
import { parseRenameName, readJsonObject } from "@/lib/project-input";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">,
) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const name = parseRenameName(body.value);
  if (!name.ok) return badRequest(name.error);

  const { projectId } = await ctx.params;
  const denied = await assertProjectOwner(projectId, userId);
  if (denied) return denied;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: name.value },
  });

  return Response.json({ project });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/projects/[projectId]">,
) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const { projectId } = await ctx.params;
  const denied = await assertProjectOwner(projectId, userId);
  if (denied) return denied;

  await prisma.project.delete({ where: { id: projectId } });

  return new Response(null, { status: 204 });
}
