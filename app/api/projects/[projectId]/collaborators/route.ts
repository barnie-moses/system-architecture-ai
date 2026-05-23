import { NextResponse } from "next/server";

import {
  addProjectCollaborator,
  canManageProjectCollaborators,
  enrichCollaboratorsWithClerk,
  enrichOwnerWithClerk,
  getProjectShareAccess,
  listProjectCollaboratorRecords,
  parseCollaboratorEmail,
} from "@/lib/project-collaborators";
import { getCurrentProjectIdentity } from "@/lib/project-access";
import { readJsonBody } from "@/lib/projects";

type ProjectCollaboratorsRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function GET(
  _request: Request,
  { params }: ProjectCollaboratorsRouteContext
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const project = await getProjectShareAccess(projectId, identity);

  if (!project) {
    return jsonError("Forbidden", 403);
  }

  const collaboratorRecords = await listProjectCollaboratorRecords(projectId);
  const [owner, collaborators] = await Promise.all([
    enrichOwnerWithClerk(project.ownerId, project.createdAt),
    enrichCollaboratorsWithClerk(collaboratorRecords),
  ]);

  return NextResponse.json({
    owner,
    collaborators,
    canManage: canManageProjectCollaborators(project, identity),
  });
}

export async function POST(
  request: Request,
  { params }: ProjectCollaboratorsRouteContext
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const project = await getProjectShareAccess(projectId, identity);

  if (!project || !canManageProjectCollaborators(project, identity)) {
    return jsonError("Forbidden", 403);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return jsonError(body.error, 400);
  }

  const collaboratorEmail = parseCollaboratorEmail(body.value);

  if (!collaboratorEmail.ok) {
    return jsonError(collaboratorEmail.error, 400);
  }

  const collaborator = await addProjectCollaborator(
    projectId,
    collaboratorEmail.email
  );
  const [enrichedCollaborator] = await enrichCollaboratorsWithClerk([
    collaborator,
  ]);

  return NextResponse.json(
    { collaborator: enrichedCollaborator },
    { status: 201 }
  );
}
