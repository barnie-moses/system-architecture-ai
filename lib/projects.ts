import { prisma } from "@/lib/prisma";
import type {
  EditorProject,
  EditorProjectLists,
  ProjectOwnership,
} from "@/types/projects";

export const DEFAULT_PROJECT_NAME = "Untiled Project";

const projectSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasJasonPath: true,
  createdAt: true,
  updatedAt: true,
} as const;

type ProjectNameResult =
  | {
      ok: true;
      name: string;
    }
  | {
      ok: false;
      error: string;
    };

type CreateProjectPayloadResult =
  | {
      ok: true;
      id: string | null;
      name: string;
    }
  | {
      ok: false;
      error: string;
    };

type JsonBodyResult =
  | {
      ok: true;
      value: unknown;
    }
  | {
      ok: false;
      error: string;
    };

const projectIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toEditorProject(
  project: {
    id: string;
    name: string;
  },
  ownership: ProjectOwnership
): EditorProject {
  return {
    id: project.id,
    name: project.name,
    roomId: project.id,
    ownership,
  };
}

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const rawBody = await request.text();

  if (!rawBody.trim()) {
    return { ok: true, value: {} };
  }

  try {
    return { ok: true, value: JSON.parse(rawBody) };
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }
}

export function getCreateProjectName(value: unknown): ProjectNameResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Project payload must be an object." };
  }

  if (!("name" in value) || value.name === null) {
    return { ok: true, name: DEFAULT_PROJECT_NAME };
  }

  if (typeof value.name !== "string") {
    return { ok: false, error: "Project name must be a string." };
  }

  const name = value.name.trim();

  if (!name) {
    return { ok: false, error: "Project name is required." };
  }

  return { ok: true, name };
}

export function getCreateProjectPayload(
  value: unknown
): CreateProjectPayloadResult {
  const projectName = getCreateProjectName(value);

  if (!projectName.ok) {
    return projectName;
  }

  if (!isRecord(value) || !("id" in value) || value.id === null) {
    return { ok: true, id: null, name: projectName.name };
  }

  if (typeof value.id !== "string") {
    return { ok: false, error: "Project ID must be a string." };
  }

  const id = value.id.trim();

  if (!projectIdPattern.test(id)) {
    return {
      ok: false,
      error:
        "Project ID must use lowercase letters, numbers, and single hyphens.",
    };
  }

  return { ok: true, id, name: projectName.name };
}

export function getRenameProjectName(value: unknown): ProjectNameResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Project payload must be an object." };
  }

  if (typeof value.name !== "string") {
    return { ok: false, error: "Project name is required." };
  }

  const name = value.name.trim();

  if (!name) {
    return { ok: false, error: "Project name is required." };
  }

  return { ok: true, name };
}

export function listProjectsForOwner(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: projectSelect,
  });
}

export async function listEditorProjectsForUser(
  ownerId: string,
  collaboratorEmails: string[]
): Promise<EditorProjectLists> {
  const normalizedEmails = Array.from(
    new Set(
      collaboratorEmails
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  const [ownedProjects, sharedProjects] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: projectSelect,
    }),
    normalizedEmails.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: {
              not: ownerId,
            },
            collborators: {
              some: {
                email: {
                  in: normalizedEmails,
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          select: projectSelect,
        })
      : Promise.resolve([]),
  ]);

  return {
    ownedProjects: ownedProjects.map((project) =>
      toEditorProject(project, "owned")
    ),
    sharedProjects: sharedProjects.map((project) =>
      toEditorProject(project, "shared")
    ),
  };
}

export function createProjectForOwner(
  ownerId: string,
  name: string,
  id?: string | null
) {
  return prisma.project.create({
    data: {
      ...(id ? { id } : {}),
      ownerId,
      name,
    },
    select: projectSelect,
  });
}

export async function renameProjectForOwner(
  ownerId: string,
  projectId: string,
  name: string
) {
  const projects = await prisma.project.updateManyAndReturn({
    where: {
      id: projectId,
      ownerId,
    },
    data: { name },
    select: projectSelect,
  });

  return projects[0] ?? null;
}

export async function deleteProjectForOwner(
  ownerId: string,
  projectId: string
) {
  const result = await prisma.project.deleteMany({
    where: {
      id: projectId,
      ownerId,
    },
  });

  return result.count > 0;
}
