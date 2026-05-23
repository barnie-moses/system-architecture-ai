"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { BaseCanvas } from "@/components/editor/base-canvas";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  const [isAiSidebarOpen, setIsAiSidebarOpen] = React.useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = React.useState(false);
  const projectActions = useProjectActions({ activeProjectId });
  const allProjects = [...ownedProjects, ...sharedProjects];
  const activeProject = allProjects.find(
    (project) => project.id === activeProjectId
  );
  const isWorkspace = Boolean(activeProject);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-base">
      <EditorNavbar
        isAiSidebarOpen={isAiSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        projectName={activeProject?.name}
        showWorkspaceActions={isWorkspace}
        onAiSidebarToggle={() => setIsAiSidebarOpen((isOpen) => !isOpen)}
        onShareClick={() => setIsShareDialogOpen(true)}
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
      {activeProject ? (
        <main className="relative flex min-h-0 flex-1 overflow-hidden bg-base">
          <section className="min-w-0 flex-1 bg-base">
            <BaseCanvas roomId={activeProject.id} />
          </section>

          <aside
            aria-hidden={!isAiSidebarOpen}
            className={cn(
              "absolute bottom-0 right-0 top-0 z-20 hidden w-80 overflow-hidden border-l bg-surface shadow-2xl transition-[opacity,transform,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform lg:block",
              isAiSidebarOpen
                ? "translate-x-0 border-surface-border opacity-100"
                : "pointer-events-none translate-x-full border-transparent opacity-0"
            )}
          >
            <div className="flex h-full w-80 flex-col">
              <div className="flex h-14 shrink-0 items-center border-b border-surface-border px-4">
                <h2 className="text-sm font-semibold text-copy-primary">
                  AI Assistant
                </h2>
              </div>
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <p className="text-sm leading-6 text-copy-secondary">
                  Future AI chat controls will appear here.
                </p>
              </div>
            </div>
          </aside>
        </main>
      ) : (
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
              onClick={projectActions.openCreateDialog}
            >
              <Plus className="h-5 w-5" />
              New Project
            </Button>
          </div>
        </main>
      )}
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
      <ShareDialog
        isOpen={isShareDialogOpen}
        project={activeProject ?? null}
        onOpenChange={setIsShareDialogOpen}
      />
    </div>
  );
}
