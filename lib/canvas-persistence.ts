import { del, get, put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import {
  CANVAS_SNAPSHOT_VERSION,
  EMPTY_CANVAS_STATE,
  createStoredCanvasSnapshot,
  parseCanvasState,
} from "@/lib/canvas-state";
import type { CanvasState } from "@/lib/canvas-state";

const CANVAS_BLOB_CONTENT_TYPE = "application/json";

export type SavedCanvasMetadata = {
  canvasJsonPath: string;
  updatedAt: string;
};

export type LoadedCanvasSnapshot = {
  canvas: CanvasState;
  metadata: SavedCanvasMetadata | null;
};

export async function saveProjectCanvasSnapshot(
  projectId: string,
  state: CanvasState
): Promise<SavedCanvasMetadata> {
  const existingProject = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      canvasJsonPath: true,
    },
  });

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  const pathname = getCanvasBlobPath(projectId);
  const snapshot = createStoredCanvasSnapshot(state);
  const blob = await put(pathname, JSON.stringify(snapshot), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: CANVAS_BLOB_CONTENT_TYPE,
  });

  const project = await prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      canvasJsonPath: blob.url,
    },
    select: {
      canvasJsonPath: true,
      updatedAt: true,
    },
  });

  if (
    existingProject.canvasJsonPath &&
    existingProject.canvasJsonPath !== blob.url
  ) {
    await deletePreviousCanvasBlob(existingProject.canvasJsonPath);
  }

  return {
    canvasJsonPath: project.canvasJsonPath ?? blob.url,
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function loadProjectCanvasSnapshot(
  projectId: string
): Promise<LoadedCanvasSnapshot> {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      canvasJsonPath: true,
      updatedAt: true,
    },
  });

  if (!project?.canvasJsonPath) {
    return {
      canvas: EMPTY_CANVAS_STATE,
      metadata: null,
    };
  }

  const blob = await get(project.canvasJsonPath, {
    access: "private",
    useCache: false,
  });

  if (!blob || blob.statusCode !== 200) {
    return {
      canvas: EMPTY_CANVAS_STATE,
      metadata: {
        canvasJsonPath: project.canvasJsonPath,
        updatedAt: project.updatedAt.toISOString(),
      },
    };
  }

  const text = await readStreamAsText(blob.stream);
  const parsedJson = parseStoredSnapshotJson(text);

  if (!parsedJson.ok) {
    throw new Error(parsedJson.error);
  }

  return {
    canvas: parsedJson.state,
    metadata: {
      canvasJsonPath: project.canvasJsonPath,
      updatedAt: project.updatedAt.toISOString(),
    },
  };
}

function getCanvasBlobPath(projectId: string) {
  return `canvas/${projectId}.json`;
}

async function deletePreviousCanvasBlob(canvasJsonPath: string) {
  try {
    await del(canvasJsonPath);
  } catch {
    // A stale blob should not make the latest successful save fail.
  }
}

async function readStreamAsText(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();

  return text;
}

function parseStoredSnapshotJson(text: string) {
  try {
    const value = JSON.parse(text) as unknown;

    if (!isRecord(value) || value.version !== CANVAS_SNAPSHOT_VERSION) {
      return { ok: false as const, error: "Canvas snapshot version is invalid." };
    }

    return parseCanvasState(value);
  } catch {
    return { ok: false as const, error: "Canvas snapshot must be valid JSON." };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
