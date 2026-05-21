"use client";

import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorNavbarProps = React.ComponentProps<"header"> & {
  isSidebarOpen: boolean;
  onSidebarToggle?: () => void;
};

export function EditorNavbar({
  isSidebarOpen,
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

      <div className="flex min-w-0 flex-1 items-center justify-center" />

      <div className="flex shrink-0 items-center justify-end">
        <UserButton />
      </div>
    </header>
  );
}
