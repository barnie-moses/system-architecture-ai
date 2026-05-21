"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { EditorDialogContent } from "@/components/editor/editor-dialog";
import type {
  MockProject,
  ProjectDialogKind,
} from "@/components/editor/use-project-dialogs";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ProjectDialogsProps = {
  canSubmitName: boolean;
  dialogKind: ProjectDialogKind | null;
  isLoading: boolean;
  isOpen: boolean;
  isSlugValid: boolean;
  name: string;
  project: MockProject | null;
  slugPreview: string;
  onCreate: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
  onOpenChange: (isOpen: boolean) => void;
  onRename: () => void;
};

function ProjectNameFields({
  canSubmitName,
  inputLabel,
  isSlugValid,
  name,
  slugPreview,
  onNameChange,
  shouldAutoFocus = false,
}: {
  canSubmitName: boolean;
  inputLabel: string;
  isSlugValid: boolean;
  name: string;
  slugPreview: string;
  onNameChange: (name: string) => void;
  shouldAutoFocus?: boolean;
}) {
  const hasName = name.trim().length > 0;
  const previewText = slugPreview || "project-slug";
  const showInvalidState = hasName && !isSlugValid;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-copy-primary"
          htmlFor="project-name"
        >
          {inputLabel}
        </label>
        <Input
          id="project-name"
          value={name}
          autoFocus={shouldAutoFocus}
          aria-invalid={showInvalidState}
          placeholder="Architecture workspace"
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface p-3">
        <p className="text-xs font-medium text-copy-muted">Slug preview</p>
        <p className="mt-1 break-words font-mono text-sm text-copy-primary">
          {previewText}
        </p>
        {!canSubmitName ? (
          <p className="mt-2 text-xs text-copy-muted">
            Use a project name that produces a lowercase slug with letters,
            numbers, and hyphens.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CreateProjectDialog({
  canSubmitName,
  isLoading,
  isSlugValid,
  name,
  slugPreview,
  onCreate,
  onNameChange,
}: Pick<
  ProjectDialogsProps,
  | "canSubmitName"
  | "isLoading"
  | "isSlugValid"
  | "name"
  | "slugPreview"
  | "onCreate"
  | "onNameChange"
>) {
  return (
    <EditorDialogContent
      title="Create project"
      description="Start a new architecture workspace with a readable project slug."
      footer={
        <Button
          type="submit"
          form="create-project-form"
          disabled={!canSubmitName || isLoading}
        >
          Create Project
        </Button>
      }
    >
      <form
        id="create-project-form"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate();
        }}
      >
        <ProjectNameFields
          canSubmitName={canSubmitName}
          inputLabel="Project name"
          isSlugValid={isSlugValid}
          name={name}
          slugPreview={slugPreview}
          onNameChange={onNameChange}
        />
      </form>
    </EditorDialogContent>
  );
}

function RenameProjectDialog({
  canSubmitName,
  isLoading,
  isSlugValid,
  name,
  project,
  slugPreview,
  onNameChange,
  onRename,
}: Pick<
  ProjectDialogsProps,
  | "canSubmitName"
  | "isLoading"
  | "isSlugValid"
  | "name"
  | "project"
  | "slugPreview"
  | "onNameChange"
  | "onRename"
>) {
  return (
    <EditorDialogContent
      title="Rename project"
      description={`Current project name: ${project?.name ?? "Unknown project"}`}
      footer={
        <Button
          type="submit"
          form="rename-project-form"
          disabled={!canSubmitName || isLoading}
        >
          Rename Project
        </Button>
      }
    >
      <form
        id="rename-project-form"
        onSubmit={(event) => {
          event.preventDefault();
          onRename();
        }}
      >
        <ProjectNameFields
          canSubmitName={canSubmitName}
          inputLabel="Project name"
          isSlugValid={isSlugValid}
          name={name}
          shouldAutoFocus
          slugPreview={slugPreview}
          onNameChange={onNameChange}
        />
      </form>
    </EditorDialogContent>
  );
}

function DeleteProjectDialog({
  isLoading,
  project,
  onDelete,
}: Pick<ProjectDialogsProps, "isLoading" | "project" | "onDelete">) {
  return (
    <EditorDialogContent
      title="Delete project"
      description="This removes the project from the mock project list for this session."
      footer={
        <Button
          type="button"
          variant="destructive"
          disabled={isLoading}
          onClick={onDelete}
        >
          Delete Project
        </Button>
      }
    >
      <div className="flex gap-3 rounded-2xl border border-surface-border bg-surface p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-state-error" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-copy-primary">
            {project?.name ?? "Unknown project"}
          </p>
          <p className="mt-2 text-sm leading-6 text-copy-muted">
            This action does not ask for extra text confirmation.
          </p>
        </div>
      </div>
    </EditorDialogContent>
  );
}

export function ProjectDialogs({
  canSubmitName,
  dialogKind,
  isLoading,
  isOpen,
  isSlugValid,
  name,
  project,
  slugPreview,
  onCreate,
  onDelete,
  onNameChange,
  onOpenChange,
  onRename,
}: ProjectDialogsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {dialogKind === "create" ? (
        <CreateProjectDialog
          canSubmitName={canSubmitName}
          isLoading={isLoading}
          isSlugValid={isSlugValid}
          name={name}
          slugPreview={slugPreview}
          onCreate={onCreate}
          onNameChange={onNameChange}
        />
      ) : null}

      {dialogKind === "rename" ? (
        <RenameProjectDialog
          canSubmitName={canSubmitName}
          isLoading={isLoading}
          isSlugValid={isSlugValid}
          name={name}
          project={project}
          slugPreview={slugPreview}
          onNameChange={onNameChange}
          onRename={onRename}
        />
      ) : null}

      {dialogKind === "delete" ? (
        <DeleteProjectDialog
          isLoading={isLoading}
          project={project}
          onDelete={onDelete}
        />
      ) : null}
    </Dialog>
  );
}
