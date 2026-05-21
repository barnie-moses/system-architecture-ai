"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/components/editor/use-project-dialogs";
import { Button } from "@/components/ui/button";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const projectDialogs = useProjectDialogs();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      <ProjectSidebar
        isClosed={!isSidebarOpen}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDeleteProject={projectDialogs.openDeleteDialog}
        onNewProject={projectDialogs.openCreateDialog}
        onRenameProject={projectDialogs.openRenameDialog}
        projects={projectDialogs.projects}
      />
      <main className="flex flex-1 items-center justify-center bg-base px-6">
        <div className="max-w-3xl text-center">
          <h1 className="text-2xl font-semibold text-copy-primary">
            Create a project or open an existing one
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-secondary">
            Start a new architecture workspace, or choose a project from
            sidebar.
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={projectDialogs.openCreateDialog}
          >
            <Plus className="h-5 w-5" />
            New Project
          </Button>
        </div>
      </main>
      <ProjectDialogs
        canSubmitName={projectDialogs.canSubmitName}
        dialogKind={projectDialogs.dialog.kind}
        isLoading={projectDialogs.isLoading}
        isOpen={projectDialogs.isDialogOpen}
        isSlugValid={projectDialogs.isSlugValid}
        name={projectDialogs.form.name}
        project={projectDialogs.dialog.project}
        slugPreview={projectDialogs.slugPreview}
        onCreate={projectDialogs.submitCreate}
        onDelete={projectDialogs.submitDelete}
        onNameChange={projectDialogs.setProjectName}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            projectDialogs.closeDialog();
          }
        }}
        onRename={projectDialogs.submitRename}
      />
    </div>
  );
}
