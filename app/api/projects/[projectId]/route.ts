import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  deleteProjectForOwner,
  getRenameProjectName,
  readJsonBody,
  renameProjectForOwner,
} from "@/lib/projects";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

type ProjectRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: ProjectRouteContext
) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const body = await readJsonBody(request);

  if (!body.ok) {
    return jsonError(body.error, 400);
  }

  const projectName = getRenameProjectName(body.value);

  if (!projectName.ok) {
    return jsonError(projectName.error, 400);
  }

  const project = await renameProjectForOwner(
    userId,
    projectId,
    projectName.name
  );

  if (!project) {
    return jsonError("Forbidden", 403);
  }

  return NextResponse.json({ project });
}

export async function DELETE(
  _request: Request,
  { params }: ProjectRouteContext
) {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const didDelete = await deleteProjectForOwner(userId, projectId);

  if (!didDelete) {
    return jsonError("Forbidden", 403);
  }

  return NextResponse.json({ success: true });
}
