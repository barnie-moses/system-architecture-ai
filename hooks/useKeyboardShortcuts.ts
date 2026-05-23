"use client";

import * as React from "react";
import type { ReactFlowInstance } from "@xyflow/react";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

type UseKeyboardShortcutsProps = {
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  onRedo: () => void;
  onUndo: () => void;
};

const CANVAS_KEYBOARD_ZOOM_DURATION_MS = 160;

export function useKeyboardShortcuts({
  reactFlow,
  onRedo,
  onUndo,
}: UseKeyboardShortcutsProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableEventTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const isPrimaryModifier = event.metaKey || event.ctrlKey;

      if (isPrimaryModifier && key === "z") {
        event.preventDefault();

        if (event.shiftKey) {
          onRedo();
          return;
        }

        onUndo();
        return;
      }

      if (isPrimaryModifier && key === "y") {
        event.preventDefault();
        onRedo();
        return;
      }

      if (isPrimaryModifier || event.altKey) {
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: CANVAS_KEYBOARD_ZOOM_DURATION_MS });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: CANVAS_KEYBOARD_ZOOM_DURATION_MS });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onRedo, onUndo, reactFlow]);
}

function isEditableEventTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const editableTarget = target.closest(
    "input, textarea, select, [contenteditable], [role='textbox']"
  );

  if (!(editableTarget instanceof HTMLElement)) {
    return false;
  }

  if (editableTarget instanceof HTMLInputElement) {
    return !editableTarget.readOnly && !editableTarget.disabled;
  }

  if (editableTarget instanceof HTMLTextAreaElement) {
    return !editableTarget.readOnly && !editableTarget.disabled;
  }

  return true;
}
