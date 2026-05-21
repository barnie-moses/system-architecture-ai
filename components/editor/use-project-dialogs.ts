"use client";

import * as React from "react";

export type MockProject = {
  id: string;
  name: string;
  slug: string;
  ownership: "owned" | "shared";
};

export type ProjectDialogKind = "create" | "rename" | "delete";

type ProjectDialogState =
  | {
      kind: null;
      project: null;
    }
  | {
      kind: ProjectDialogKind;
      project: MockProject | null;
    };

type ProjectDialogFormState = {
  name: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const initialMockProjects: MockProject[] = [
  {
    id: "project-1",
    name: "Realtime Payments Platform",
    slug: "realtime-payments-platform",
    ownership: "owned",
  },
  {
    id: "project-2",
    name: "Event Driven Orders",
    slug: "event-driven-orders",
    ownership: "owned",
  },
  {
    id: "project-3",
    name: "Shared Analytics Workspace",
    slug: "shared-analytics-workspace",
    ownership: "shared",
  },
];

export function createProjectSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function createMockProjectId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}`;
}

export function useProjectDialogs() {
  const [projects, setProjects] =
    React.useState<MockProject[]>(initialMockProjects);
  const [dialog, setDialog] = React.useState<ProjectDialogState>({
    kind: null,
    project: null,
  });
  const [form, setForm] = React.useState<ProjectDialogFormState>({
    name: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const slugPreview = createProjectSlug(form.name);
  const isSlugValid = slugPattern.test(slugPreview);
  const canSubmitName = form.name.trim().length > 0 && isSlugValid;
  const isDialogOpen = dialog.kind !== null;

  const closeDialog = React.useCallback(() => {
    setDialog({ kind: null, project: null });
    setForm({ name: "" });
    setIsLoading(false);
  }, []);

  const openCreateDialog = React.useCallback(() => {
    setDialog({ kind: "create", project: null });
    setForm({ name: "" });
  }, []);

  const openRenameDialog = React.useCallback((project: MockProject) => {
    setDialog({ kind: "rename", project });
    setForm({ name: project.name });
  }, []);

  const openDeleteDialog = React.useCallback((project: MockProject) => {
    setDialog({ kind: "delete", project });
    setForm({ name: project.name });
  }, []);

  const setProjectName = React.useCallback((name: string) => {
    setForm({ name });
  }, []);

  const submitCreate = React.useCallback(() => {
    if (!canSubmitName) {
      return;
    }

    setIsLoading(true);
    setProjects((currentProjects) => [
      {
        id: createMockProjectId(),
        name: form.name.trim(),
        slug: slugPreview,
        ownership: "owned",
      },
      ...currentProjects,
    ]);
    closeDialog();
  }, [canSubmitName, closeDialog, form.name, slugPreview]);

  const submitRename = React.useCallback(() => {
    if (!canSubmitName || !dialog.project) {
      return;
    }

    const projectId = dialog.project.id;

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              name: form.name.trim(),
              slug: slugPreview,
            }
          : project
      )
    );
    closeDialog();
  }, [canSubmitName, closeDialog, dialog.project, form.name, slugPreview]);

  const submitDelete = React.useCallback(() => {
    if (!dialog.project) {
      return;
    }

    const projectId = dialog.project.id;

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId)
    );
    closeDialog();
  }, [closeDialog, dialog.project]);

  return {
    canSubmitName,
    closeDialog,
    dialog,
    form,
    isDialogOpen,
    isLoading,
    isSlugValid,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projects,
    setProjectName,
    slugPreview,
    submitCreate,
    submitDelete,
    submitRename,
  };
}
