"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorNavbarProps = React.ComponentProps<"header"> & {
  isAiSidebarOpen?: boolean;
  isSidebarOpen: boolean;
  projectName?: string;
  showWorkspaceActions?: boolean;
  onAiSidebarToggle?: () => void;
  onShareClick?: () => void;
  onSidebarToggle?: () => void;
};

export function EditorNavbar({
  isAiSidebarOpen = true,
  isSidebarOpen,
  projectName,
  showWorkspaceActions = false,
  onAiSidebarToggle,
  onShareClick,
  onSidebarToggle,
  className,
  ...props
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center border-b border-surface-border bg-surface px-3",
        className
      )}
      {...props}
    >
      <div className="flex shrink-0 items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            isSidebarOpen ? "Close project sidebar" : "Open project sidebar"
          }
          aria-pressed={isSidebarOpen}
          onClick={onSidebarToggle}
        >
          <SidebarIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-4">
        {projectName ? (
          <p className="truncate text-sm font-medium text-copy-primary">
            {projectName}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {showWorkspaceActions ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl border border-surface-border bg-base px-3 text-copy-secondary hover:bg-subtle hover:text-copy-primary"
              aria-label="Share workspace"
              onClick={onShareClick}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-2 rounded-xl bg-brand px-3 text-primary-foreground hover:bg-brand/80"
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-pressed={isAiSidebarOpen}
              onClick={onAiSidebarToggle}
            >
              <Sparkles className="h-4 w-4" />
              AI
            </Button>
          </>
        ) : null}
        <UserButton />
      </div>
    </header>
  );
}
