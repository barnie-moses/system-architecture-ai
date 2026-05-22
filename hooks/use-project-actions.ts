"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import type { EditorProject } from "@/types/projects";

export type ProjectDialogKind = "create" | "rename" | "delete";

type ProjectDialogState =
  | {
      kind: null;
      project: null;
    }
  | {
      kind: ProjectDialogKind;
      project: EditorProject | null;
    };

type ProjectActionOptions = {
  activeProjectId?: string;
};

const roomIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createProjectRoomSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createShortSuffix() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0].toString(36).slice(0, 5).padStart(5, "0");
  }

  return Math.random().toString(36).slice(2, 7).padEnd(5, "0");
}

async function parseProjectResponse(response: Response) {
  const body = (await response.json()) as {
    error?: string;
    project?: {
      id: string;
    };
  };

  if (!response.ok) {
    throw new Error(body.error ?? "Project request failed.");
  }

  return body.project;
}

export function useProjectActions({ activeProjectId }: ProjectActionOptions) {
  const router = useRouter();
  const [dialog, setDialog] = React.useState<ProjectDialogState>({
    kind: null,
    project: null,
  });
  const [name, setName] = React.useState("");
  const [createSuffix, setCreateSuffix] = React.useState(createShortSuffix);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const baseSlug = createProjectRoomSlug(name);
  const roomIdPreview = dialog.kind === "create" && baseSlug
    ? `${baseSlug}-${createSuffix}`
    : dialog.project?.roomId ?? "";
  const isRoomIdValid =
    dialog.kind !== "create" || roomIdPattern.test(roomIdPreview);
  const canSubmitName =
    name.trim().length > 0 &&
    (dialog.kind === "create" ? isRoomIdValid : true);
  const isDialogOpen = dialog.kind !== null;

  const closeDialog = React.useCallback(() => {
    setDialog({ kind: null, project: null });
    setName("");
    setErrorMessage(null);
    setIsLoading(false);
  }, []);

  const openCreateDialog = React.useCallback(() => {
    setCreateSuffix(createShortSuffix());
    setDialog({ kind: "create", project: null });
    setName("");
    setErrorMessage(null);
  }, []);

  const openRenameDialog = React.useCallback((project: EditorProject) => {
    setDialog({ kind: "rename", project });
    setName(project.name);
    setErrorMessage(null);
  }, []);

  const openDeleteDialog = React.useCallback((project: EditorProject) => {
    setDialog({ kind: "delete", project });
    setName(project.name);
    setErrorMessage(null);
  }, []);

  const submitCreate = React.useCallback(async () => {
    if (!canSubmitName || !roomIdPreview) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: roomIdPreview,
          name: name.trim(),
        }),
      });
      const project = await parseProjectResponse(response);

      if (!project) {
        throw new Error("Project response did not include a project.");
      }

      closeDialog();
      router.push(`/editor/${project.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Project request failed."
      );
      setIsLoading(false);
    }
  }, [canSubmitName, closeDialog, name, roomIdPreview, router]);

  const submitRename = React.useCallback(async () => {
    if (!canSubmitName || !dialog.project) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      await parseProjectResponse(response);
      closeDialog();
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Project request failed."
      );
      setIsLoading(false);
    }
  }, [canSubmitName, closeDialog, dialog.project, name, router]);

  const submitDelete = React.useCallback(async () => {
    if (!dialog.project) {
      return;
    }

    const projectId = dialog.project.id;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Project request failed.");
      }

      closeDialog();

      if (activeProjectId === projectId) {
        router.replace("/editor");
        return;
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Project request failed."
      );
      setIsLoading(false);
    }
  }, [activeProjectId, closeDialog, dialog.project, router]);

  return {
    canSubmitName,
    closeDialog,
    dialog,
    errorMessage,
    isDialogOpen,
    isLoading,
    isRoomIdValid,
    name,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    roomIdPreview,
    setProjectName: setName,
    submitCreate,
    submitDelete,
    submitRename,
  };
}
