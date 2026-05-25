"use client";

import * as React from "react";

import {
  getCanvasStateHash,
  type CanvasState,
} from "@/lib/canvas-state";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

type UseCanvasAutosaveOptions = {
  edges: CanvasEdge[];
  enabled: boolean;
  initialSavedHash?: string | null;
  manualSaveRequestId?: number | null;
  nodes: CanvasNode[];
  projectId: string;
};

const AUTOSAVE_DEBOUNCE_MS = 1200;
const AUTOSAVE_RETRY_DELAYS_MS = [1500, 3500] as const;
const SAVED_CONFIRMATION_MS = 1600;

export function useCanvasAutosave({
  edges,
  enabled,
  initialSavedHash = null,
  manualSaveRequestId = null,
  nodes,
  projectId,
}: UseCanvasAutosaveOptions) {
  const [status, setStatus] = React.useState<CanvasSaveStatus>("idle");
  const latestStateRef = React.useRef<CanvasState>({ edges, nodes });
  const latestHashRef = React.useRef(getCanvasStateHash({ edges, nodes }));
  const lastSavedHashRef = React.useRef<string | null>(null);
  const debounceTimeoutRef = React.useRef<number | null>(null);
  const retryTimeoutRef = React.useRef<number | null>(null);
  const savedConfirmationTimeoutRef = React.useRef<number | null>(null);
  const isSavingRef = React.useRef(false);
  const hasStartedRef = React.useRef(false);
  const lastManualSaveRequestIdRef = React.useRef<number | null>(null);
  const runSaveRef = React.useRef<
    (attempt: number, options?: SaveRunOptions) => void
  >(() => {});

  React.useEffect(() => {
    latestStateRef.current = {
      edges,
      nodes,
    };
    latestHashRef.current = getCanvasStateHash(latestStateRef.current);
  }, [edges, nodes]);

  React.useEffect(() => {
    return () => {
      clearTimer(debounceTimeoutRef);
      clearTimer(retryTimeoutRef);
      clearTimer(savedConfirmationTimeoutRef);
    };
  }, []);

  const runSave = React.useCallback(
    async (attempt: number, options: SaveRunOptions = {}) => {
      clearTimer(retryTimeoutRef);

      if (isSavingRef.current) {
        return;
      }

      const hashToSave = latestHashRef.current;

      if (!options.force && hashToSave === lastSavedHashRef.current) {
        clearTimer(savedConfirmationTimeoutRef);
        setStatus("idle");
        return;
      }

      isSavingRef.current = true;
      clearTimer(savedConfirmationTimeoutRef);
      setStatus("saving");

      let didSave = false;

      try {
        const response = await fetch(`/api/projects/${projectId}/canvas`, {
          body: JSON.stringify(latestStateRef.current),
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
        });

        if (!response.ok) {
          throw new Error("Canvas save failed.");
        }

        lastSavedHashRef.current = hashToSave;
        didSave = true;
        showSavedConfirmation(savedConfirmationTimeoutRef, setStatus);
      } catch {
        clearTimer(savedConfirmationTimeoutRef);
        setStatus("error");

        const retryDelay = AUTOSAVE_RETRY_DELAYS_MS[attempt];

        if (retryDelay !== undefined) {
          retryTimeoutRef.current = window.setTimeout(() => {
            runSaveRef.current(attempt + 1, options);
          }, retryDelay);
        }
      } finally {
        isSavingRef.current = false;

        if (didSave && latestHashRef.current !== lastSavedHashRef.current) {
          debounceTimeoutRef.current = window.setTimeout(() => {
            runSaveRef.current(0);
          }, 250);
        }
      }
    },
    [projectId]
  );

  React.useEffect(() => {
    runSaveRef.current = (attempt: number, options?: SaveRunOptions) => {
      void runSave(attempt, options);
    };
  }, [runSave]);

  React.useEffect(() => {
    if (!enabled) {
      hasStartedRef.current = false;
      clearTimer(debounceTimeoutRef);
      clearTimer(retryTimeoutRef);
      return;
    }

    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      lastSavedHashRef.current = initialSavedHash ?? latestHashRef.current;
      clearTimer(savedConfirmationTimeoutRef);
      setStatus("idle");
      return;
    }

    if (latestHashRef.current === lastSavedHashRef.current) {
      clearTimer(savedConfirmationTimeoutRef);
      setStatus("idle");
      return;
    }

    clearTimer(debounceTimeoutRef);
    clearTimer(retryTimeoutRef);

    debounceTimeoutRef.current = window.setTimeout(() => {
      void runSave(0);
    }, AUTOSAVE_DEBOUNCE_MS);
  }, [enabled, edges, initialSavedHash, nodes, runSave]);

  React.useEffect(() => {
    if (!enabled || manualSaveRequestId === null) {
      return;
    }

    if (manualSaveRequestId === lastManualSaveRequestIdRef.current) {
      return;
    }

    lastManualSaveRequestIdRef.current = manualSaveRequestId;
    clearTimer(debounceTimeoutRef);
    clearTimer(retryTimeoutRef);
    void runSave(0, { force: true });
  }, [enabled, manualSaveRequestId, runSave]);

  return {
    status,
  };
}

type SaveRunOptions = {
  force?: boolean;
};

function showSavedConfirmation(
  timerRef: React.MutableRefObject<number | null>,
  setStatus: React.Dispatch<React.SetStateAction<CanvasSaveStatus>>
) {
  clearTimer(timerRef);
  setStatus("saved");

  timerRef.current = window.setTimeout(() => {
    setStatus("idle");
    timerRef.current = null;
  }, SAVED_CONFIRMATION_MS);
}

function clearTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current === null) {
    return;
  }

  window.clearTimeout(timerRef.current);
  timerRef.current = null;
}
