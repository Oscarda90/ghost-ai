import { auth } from "@clerk/nextjs/server";

import { Prisma } from "@/app/generated/prisma/client";
import { badRequest, conflict, unauthorized } from "@/lib/api-response";
import { parseCreateId, parseCreateName, readJsonObject } from "@/lib/project-input";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return unauthorized();

  const body = await readJsonObject(request);
  if (!body.ok) return badRequest(body.error);

  const name = parseCreateName(body.value);
  if (!name.ok) return badRequest(name.error);

  const id = parseCreateId(body.value);
  if (!id.ok) return badRequest(id.error);

  try {
    const project = await prisma.project.create({
      data: { id: id.value, ownerId: userId, name: name.value },
    });
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return conflict("Project ID already exists");
    }
    throw error;
  }
}
