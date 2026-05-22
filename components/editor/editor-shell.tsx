"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectActions } from "@/hooks/use-project-actions";
import { Button } from "@/components/ui/button";
import type { EditorProjectLists } from "@/types/projects";

type EditorShellProps = EditorProjectLists & {
  activeProjectId?: string;
};

export function EditorShell({
  activeProjectId,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const projectActions = useProjectActions({ activeProjectId });
  const allProjects = [...ownedProjects, ...sharedProjects];
  const activeProject = allProjects.find(
    (project) => project.id === activeProjectId
  );

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        activeProjectId={activeProjectId}
        isClosed={!isSidebarOpen}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDeleteProject={projectActions.openDeleteDialog}
        onNewProject={projectActions.openCreateDialog}
        onRenameProject={projectActions.openRenameDialog}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <main className="flex flex-1 items-center justify-center bg-base px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-2xl font-semibold text-copy-primary">
            {activeProject?.name ?? "Create a project or open an existing one"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-secondary">
            {activeProject
              ? "This workspace is ready for the next editor foundation."
              : "Start a new architecture workspace, or choose a project from sidebar."}
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={projectActions.openCreateDialog}
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs
        canSubmitName={projectActions.canSubmitName}
        dialogKind={projectActions.dialog.kind}
        errorMessage={projectActions.errorMessage}
        isLoading={projectActions.isLoading}
        isOpen={projectActions.isDialogOpen}
        isRoomIdValid={projectActions.isRoomIdValid}
        name={projectActions.name}
        project={projectActions.dialog.project}
        roomIdPreview={projectActions.roomIdPreview}
        onCreate={projectActions.submitCreate}
        onDelete={projectActions.submitDelete}
        onNameChange={projectActions.setProjectName}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            projectActions.closeDialog();
          }
        }}
        onRename={projectActions.submitRename}
      />
    </div>
  );
}
