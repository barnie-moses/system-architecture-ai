import { NextResponse } from "next/server";

import { parseCanvasState } from "@/lib/canvas-state";
import {
  loadProjectCanvasSnapshot,
  saveProjectCanvasSnapshot,
} from "@/lib/canvas-persistence";
import {
  getAccessibleProjectByRoomId,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { readJsonBody } from "@/lib/projects";

type ProjectCanvasRouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function GET(
  _request: Request,
  { params }: ProjectCanvasRouteContext
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const project = await getAccessibleProjectByRoomId(projectId, identity);

  if (!project) {
    return jsonError("Forbidden", 403);
  }

  const snapshot = await loadProjectCanvasSnapshot(project.id);

  return NextResponse.json(snapshot);
}

export async function PUT(
  request: Request,
  { params }: ProjectCanvasRouteContext
) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return jsonError("Unauthorized", 401);
  }

  const { projectId } = await params;
  const project = await getAccessibleProjectByRoomId(projectId, identity);

  if (!project) {
    return jsonError("Forbidden", 403);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return jsonError(body.error, 400);
  }

  const canvasState = parseCanvasState(body.value);

  if (!canvasState.ok) {
    return jsonError(canvasState.error, 400);
  }

  const metadata = await saveProjectCanvasSnapshot(
    project.id,
    canvasState.state
  );

  return NextResponse.json({
    canvas: canvasState.state,
    metadata,
  });
}
