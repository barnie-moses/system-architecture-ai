import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { Prisma } from "@/app/generated/prisma/client";
import {
  createProjectForOwner,
  getCreateProjectPayload,
  listProjectsForOwner,
  readJsonBody,
} from "@/lib/projects";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function GET() {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const projects = await listProjectsForOwner(userId);

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return jsonError(body.error, 400);
  }

  const projectPayload = getCreateProjectPayload(body.value);

  if (!projectPayload.ok) {
    return jsonError(projectPayload.error, 400);
  }

  try {
    const project = await createProjectForOwner(
      userId,
      projectPayload.name,
      projectPayload.id
    );

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("Project ID already exists.", 409);
    }

    throw error;
  }
}
