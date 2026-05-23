import { NextResponse } from "next/server";

import {
  canManageProjectCollaborators,
  getProjectShareAccess,
  removeProjectCollaborator,
} from "@/lib/project-collaborators";
import { getCurrentProjectIdentity } from "@/lib/project-access";

type ProjectCollaboratorRouteContext = {
  params: Promise<{
    projectId: string;
    collaboratorId: string;
  }>;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function DELETE(
  _request: Request,
  { params }: ProjectCollaboratorRouteContext
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId, collaboratorId } = await params;
  const project = await getProjectShareAccess(projectId, identity);

  if (!project || !canManageProjectCollaborators(project, identity)) {
    return jsonError("Forbidden", 403);
  }

  const didRemove = await removeProjectCollaborator(projectId, collaboratorId);

  if (!didRemove) {
    return jsonError("Not found", 404);
  }

  return NextResponse.json({ success: true });
}

