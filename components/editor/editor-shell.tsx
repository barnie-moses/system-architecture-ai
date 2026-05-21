"use client";

import * as React from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";

export function EditorShell() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
      />
      <main className="flex flex-1 items-center justify-center bg-base px-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium text-brand">Editor</p>
          <h1 className="mt-3 text-2xl font-semibold text-copy-primary">
            Architecture workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-copy-secondary">
            Project creation, canvas editing, and collaboration controls will
            fill this protected workspace as the next feature specs land.
          </p>
        </div>
      </main>
    </div>
  );
}
