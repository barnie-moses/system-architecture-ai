"use client";

import * as React from "react";
import { UserButton, useAuth } from "@clerk/nextjs";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useCanRedo,
  useCanUndo,
  useErrorListener,
  useMyPresence,
  useOthers,
  useRedo,
  useUndo,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  ConnectionMode,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  NodeResizer,
  NodeToolbar,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react";
import type {
  DefaultEdgeOptions,
  EdgeProps,
  EdgeTypes,
  NodeProps,
  NodeTypes,
} from "@xyflow/react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Maximize2,
  Minus,
  Pill,
  Plus,
  RectangleHorizontal,
  Redo2,
  Undo2,
} from "lucide-react";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  useCanvasAutosave,
  type CanvasSaveStatus,
} from "@/hooks/use-canvas-autosave";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import {
  exportCanvasDiagram,
  type CanvasExportFormat,
} from "@/lib/canvas-export";
import { getCanvasStateHash, parseCanvasState } from "@/lib/canvas-state";
import { cn } from "@/lib/utils";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_ORIGIN,
  CANVAS_NODE_SHAPES,
  CANVAS_NODE_TYPE,
  CANVAS_SHAPE_DEFAULT_SIZES,
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
} from "@/types/canvas";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { CanvasNodeShape, CanvasNodeSize } from "@/types/canvas";
import type { CanvasTemplate } from "@/components/editor/starter-templates";

type BaseCanvasProps = {
  exportRequest: CanvasExportRequest | null;
  isTemplatesModalOpen: boolean;
  manualSaveRequest: CanvasSaveRequest | null;
  projectName: string;
  roomId: string;
  onSaveStatusChange: (status: CanvasSaveStatus) => void;
  onTemplatesModalOpenChange: (isOpen: boolean) => void;
};

export type CanvasExportRequest = {
  format: CanvasExportFormat;
  id: number;
};

export type CanvasSaveRequest = {
  id: number;
};

type CanvasErrorBoundaryProps = {
  children: React.ReactNode;
};

type CanvasErrorBoundaryState = {
  errorMessage: string | null;
};

type ShapeDragPayload = {
  shape: CanvasNodeShape;
  size: CanvasNodeSize;
};

type ShapeDragPreviewState = ShapeDragPayload & {
  cursor: {
    x: number;
    y: number;
  };
};

type ShapeToolbarItem = {
  shape: CanvasNodeShape;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type CollaboratorPresence = {
  connectionId: number;
  id: string;
  info: {
    avatarUrl: string | null;
    cursorColor: string;
    displayName: string;
  };
  presence: {
    cursor: {
      x: number;
      y: number;
    } | null;
    thinking: boolean;
  };
};

const SHAPE_DRAG_MIME_TYPE = "application/x-system-architecture-shape";
const MAX_VISIBLE_COLLABORATORS = 5;

const SHAPE_TOOLBAR_ITEMS: ShapeToolbarItem[] = [
  {
    shape: "rectangle",
    label: "Rectangle",
    icon: RectangleHorizontal,
  },
  {
    shape: "diamond",
    label: "Diamond",
    icon: Diamond,
  },
  {
    shape: "circle",
    label: "Circle",
    icon: Circle,
  },
  {
    shape: "pill",
    label: "Pill",
    icon: Pill,
  },
  {
    shape: "cylinder",
    label: "Cylinder",
    icon: Database,
  },
  {
    shape: "hexagon",
    label: "Hexagon",
    icon: Hexagon,
  },
];

const CANVAS_NODE_TYPES = {
  [CANVAS_NODE_TYPE]: CanvasNodeRenderer,
} satisfies NodeTypes;

const CANVAS_EDGE_TYPES = {
  [CANVAS_EDGE_TYPE]: CanvasEdgeRenderer,
} satisfies EdgeTypes;

const REACT_FLOW_PRO_OPTIONS = {
  hideAttribution: true,
};

const CANVAS_NODE_MIN_SIZES: Record<CanvasNodeShape, CanvasNodeSize> = {
  rectangle: {
    width: 120,
    height: 72,
  },
  diamond: {
    width: 96,
    height: 96,
  },
  circle: {
    width: 88,
    height: 88,
  },
  pill: {
    width: 128,
    height: 64,
  },
  cylinder: {
    width: 112,
    height: 80,
  },
  hexagon: {
    width: 112,
    height: 72,
  },
};

const CANVAS_NODE_LABEL_PLACEHOLDER = "Label";
const CANVAS_EDGE_LABEL_PLACEHOLDER = "Label";
const CANVAS_VIEWPORT_ANIMATION_MS = 160;
const CANVAS_NODE_SELECTION_COLOR = "var(--text-secondary)";
const CANVAS_NODE_HANDLE_BASE_CLASSNAME =
  "!z-10 !h-2.5 !w-2.5 !border-2 !border-base !bg-copy-primary transition-opacity";
const CANVAS_DEFAULT_EDGE_OPTIONS = {
  type: CANVAS_EDGE_TYPE,
  data: {
    label: "",
  },
  interactionWidth: 28,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--text-secondary)",
    width: 18,
    height: 18,
    strokeWidth: 1.8,
  },
  style: {
    stroke: "var(--text-secondary)",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2.25,
  },
} satisfies DefaultEdgeOptions;

const CANVAS_NODE_CONNECTION_POINTS = [
  {
    id: "top",
    position: Position.Top,
  },
  {
    id: "right",
    position: Position.Right,
  },
  {
    id: "bottom",
    position: Position.Bottom,
  },
  {
    id: "left",
    position: Position.Left,
  },
] as const;

type CanvasConnectionPoint = (typeof CANVAS_NODE_CONNECTION_POINTS)[number];

type CanvasEdgeEditingContextValue = {
  editingEdgeId: string | null;
  setEditingEdgeId: React.Dispatch<React.SetStateAction<string | null>>;
};

const CanvasEdgeEditingContext =
  React.createContext<CanvasEdgeEditingContextValue | null>(null);

export function BaseCanvas({
  exportRequest,
  isTemplatesModalOpen,
  manualSaveRequest,
  projectName,
  roomId,
  onSaveStatusChange,
  onTemplatesModalOpenChange,
}: BaseCanvasProps) {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            thinking: false,
          }}
        >
          <ClientSideSuspense fallback={<CanvasLoadingState />}>
            {() => (
              <CanvasConnectionFallback>
                <ReactFlowProvider>
                  <SyncedReactFlowCanvas
                    key={roomId}
                    exportRequest={exportRequest}
                    isTemplatesModalOpen={isTemplatesModalOpen}
                    manualSaveRequest={manualSaveRequest}
                    projectName={projectName}
                    roomId={roomId}
                    onSaveStatusChange={onSaveStatusChange}
                    onTemplatesModalOpenChange={onTemplatesModalOpenChange}
                  />
                </ReactFlowProvider>
              </CanvasConnectionFallback>
            )}
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}

class CanvasErrorBoundary extends React.Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): CanvasErrorBoundaryState {
    return {
      errorMessage:
        error instanceof Error
          ? error.message
          : "The collaborative canvas could not connect.",
    };
  }

  render() {
    if (this.state.errorMessage) {
      return <CanvasErrorState message={this.state.errorMessage} />;
    }

    return this.props.children;
  }
}

function CanvasConnectionFallback({
  children,
}: {
  children: React.ReactNode;
}) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  useErrorListener(
    React.useCallback((error) => {
      setErrorMessage(
        error.message || "The collaborative canvas could not connect."
      );
    }, [])
  );

  if (errorMessage) {
    return <CanvasErrorState message={errorMessage} />;
  }

  return children;
}

function SyncedReactFlowCanvas({
  exportRequest,
  isTemplatesModalOpen,
  manualSaveRequest,
  projectName,
  roomId,
  onSaveStatusChange,
  onTemplatesModalOpenChange,
}: Pick<
  BaseCanvasProps,
  | "exportRequest"
  | "isTemplatesModalOpen"
  | "manualSaveRequest"
  | "projectName"
  | "roomId"
  | "onSaveStatusChange"
  | "onTemplatesModalOpenChange"
>) {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();
  const [, updateMyPresence] = useMyPresence();
  const nodeCounterRef = React.useRef(0);
  const [editingEdgeId, setEditingEdgeId] = React.useState<string | null>(null);
  const [exportMessage, setExportMessage] = React.useState<string | null>(null);
  const [isInitialCanvasLoadComplete, setIsInitialCanvasLoadComplete] =
    React.useState(false);
  const [autosaveBaselineHash, setAutosaveBaselineHash] = React.useState<
    string | null
  >(null);
  const [dragPreview, setDragPreview] =
    React.useState<ShapeDragPreviewState | null>(null);
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: {
        initial: [],
      },
      edges: {
        initial: [],
      },
    });
  const canvasEdges = React.useMemo(
    () => edges.map(normalizeCanvasEdge),
    [edges]
  );
  const { status: saveStatus } = useCanvasAutosave({
    edges: canvasEdges,
    enabled: isInitialCanvasLoadComplete,
    initialSavedHash: autosaveBaselineHash,
    manualSaveRequestId: manualSaveRequest?.id ?? null,
    nodes,
    projectId: roomId,
  });
  const updateDragPreviewCursor = React.useCallback(
    (cursor: ShapeDragPreviewState["cursor"]) => {
      setDragPreview((currentPreview) => {
        if (!currentPreview) {
          return null;
        }

        return {
          ...currentPreview,
          cursor,
        };
      });
    },
    []
  );
  const clearDragPreview = React.useCallback(() => {
    setDragPreview(null);
  }, []);
  const handleZoomOut = React.useCallback(() => {
    void reactFlow.zoomOut({ duration: CANVAS_VIEWPORT_ANIMATION_MS });
  }, [reactFlow]);
  const handleFitView = React.useCallback(() => {
    void reactFlow.fitView({
      duration: CANVAS_VIEWPORT_ANIMATION_MS,
      padding: 0.2,
    });
  }, [reactFlow]);
  const handleZoomIn = React.useCallback(() => {
    void reactFlow.zoomIn({ duration: CANVAS_VIEWPORT_ANIMATION_MS });
  }, [reactFlow]);
  const handleUndo = React.useCallback(() => {
    if (!canUndo) {
      return;
    }

    undo();
  }, [canUndo, undo]);
  const handleRedo = React.useCallback(() => {
    if (!canRedo) {
      return;
    }

    redo();
  }, [canRedo, redo]);
  const handleTemplateImport = React.useCallback(
    (template: CanvasTemplate) => {
      const importedTemplate = cloneCanvasTemplate(template);

      reactFlow.addNodes(importedTemplate.nodes);
      reactFlow.addEdges(importedTemplate.edges);

      window.requestAnimationFrame(() => {
        void reactFlow.fitView({
          duration: CANVAS_VIEWPORT_ANIMATION_MS,
          padding: 0.2,
        });
      });
    },
    [reactFlow]
  );
  const handleShapeDragStart = React.useCallback(
    (payload: ShapeDragPayload, cursor: ShapeDragPreviewState["cursor"]) => {
      setDragPreview({
        ...payload,
        cursor,
      });
    },
    []
  );
  const updateLiveCursor = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();

      updateMyPresence({
        cursor: {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        },
      });
    },
    [updateMyPresence]
  );
  const clearLiveCursor = React.useCallback(() => {
    updateMyPresence({
      cursor: null,
    });
  }, [updateMyPresence]);

  React.useEffect(() => {
    let isCurrent = true;

    const loadSavedCanvas = async () => {
      if (nodes.length > 0 || canvasEdges.length > 0) {
        setAutosaveBaselineHash(null);
        setIsInitialCanvasLoadComplete(true);
        return;
      }

      try {
        const response = await fetch(`/api/projects/${roomId}/canvas`);

        if (!response.ok) {
          throw new Error("Canvas load failed.");
        }

        const body = (await response.json()) as unknown;
        const canvasState = parseLoadedCanvasState(body);

        if (!isCurrent) {
          return;
        }

        if (!canvasState.ok) {
          throw new Error(canvasState.error);
        }

        const loadedEdges = canvasState.state.edges.map(normalizeCanvasEdge);
        const baselineHash = getCanvasStateHash({
          edges: loadedEdges,
          nodes: canvasState.state.nodes,
        });

        setAutosaveBaselineHash(baselineHash);

        if (
          canvasState.state.nodes.length > 0 ||
          canvasState.state.edges.length > 0
        ) {
          const currentNodes = reactFlow.getNodes();
          const currentEdges = reactFlow.getEdges();

          if (currentNodes.length === 0 && currentEdges.length === 0) {
            reactFlow.addNodes(canvasState.state.nodes);
            reactFlow.addEdges(loadedEdges);

            window.requestAnimationFrame(() => {
              void reactFlow.fitView({
                duration: CANVAS_VIEWPORT_ANIMATION_MS,
                padding: 0.2,
              });
            });
          }
        }
      } catch {
        if (isCurrent) {
          setAutosaveBaselineHash(null);
        }
      } finally {
        if (isCurrent) {
          setIsInitialCanvasLoadComplete(true);
        }
      }
    };

    if (!isInitialCanvasLoadComplete) {
      void loadSavedCanvas();
    }

    return () => {
      isCurrent = false;
    };
  }, [
    canvasEdges,
    isInitialCanvasLoadComplete,
    nodes,
    reactFlow,
    roomId,
  ]);

  React.useEffect(() => {
    onSaveStatusChange(saveStatus);
  }, [onSaveStatusChange, saveStatus]);

  React.useEffect(() => {
    if (!exportRequest) {
      return;
    }

    let isCurrent = true;

    const runExport = async () => {
      try {
        setExportMessage(null);

        const result = await exportCanvasDiagram({
          edges: reactFlow.getEdges().map(normalizeCanvasEdge),
          format: exportRequest.format,
          nodes: reactFlow.getNodes(),
          projectName,
        });

        if (!isCurrent) {
          return;
        }

        if (result.status === "empty") {
          setExportMessage("There is nothing to export.");
        }
      } catch {
        if (isCurrent) {
          setExportMessage("The canvas could not be exported.");
        }
      }
    };

    void runExport();

    return () => {
      isCurrent = false;
    };
  }, [exportRequest, projectName, reactFlow]);

  React.useEffect(() => {
    if (!exportMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setExportMessage(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [exportMessage]);

  useKeyboardShortcuts({
    reactFlow,
    onRedo: handleRedo,
    onUndo: handleUndo,
  });

  React.useEffect(() => {
    if (!dragPreview) {
      return;
    }

    const handleWindowDragOver = (event: DragEvent) => {
      if (event.clientX === 0 && event.clientY === 0) {
        return;
      }

      updateDragPreviewCursor({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", clearDragPreview);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", clearDragPreview);
    };
  }, [clearDragPreview, dragPreview, updateDragPreviewCursor]);

  const handleCanvasDragOver = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME_TYPE)) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    []
  );
  const handleCanvasDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      const payload = readShapeDragPayload(event.dataTransfer);

      if (!payload) {
        return;
      }

      event.preventDefault();
      clearDragPreview();

      nodeCounterRef.current += 1;

      const position = getDropNodePosition({
        bounds: event.currentTarget.getBoundingClientRect(),
        pointer: {
          x: event.clientX,
          y: event.clientY,
        },
        reactFlow,
        size: payload.size,
      });
      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`,
        type: CANVAS_NODE_TYPE,
        origin: CANVAS_NODE_ORIGIN,
        position,
        width: payload.size.width,
        height: payload.size.height,
        initialWidth: payload.size.width,
        initialHeight: payload.size.height,
        style: {
          width: payload.size.width,
          height: payload.size.height,
        },
        data: {
          label: "",
          color: DEFAULT_NODE_COLOR.id,
          shape: payload.shape,
        },
      };

      reactFlow.addNodes(newNode);
    },
    [clearDragPreview, reactFlow]
  );

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <CanvasEdgeEditingContext.Provider
        value={{
          editingEdgeId,
          setEditingEdgeId,
        }}
      >
        <ReactFlow<CanvasNode, CanvasEdge>
          className="bg-base"
          connectionMode={ConnectionMode.Loose}
          defaultEdgeOptions={CANVAS_DEFAULT_EDGE_OPTIONS}
          edgeTypes={CANVAS_EDGE_TYPES}
          edges={canvasEdges}
          fitView
          nodeTypes={CANVAS_NODE_TYPES}
          nodes={nodes}
          onConnect={onConnect}
          onDelete={onDelete}
          onEdgeDoubleClick={(event, edge) => {
            event.preventDefault();
            setEditingEdgeId(edge.id);
          }}
          onEdgesChange={onEdgesChange}
          onMouseLeave={clearLiveCursor}
          onMouseMove={updateLiveCursor}
          onNodesChange={onNodesChange}
          proOptions={REACT_FLOW_PRO_OPTIONS}
        >
          <Background
            color="var(--border-subtle)"
            gap={24}
            size={1}
            variant={BackgroundVariant.Dots}
          />
        </ReactFlow>
      </CanvasEdgeEditingContext.Provider>
      <PresenceAvatarGroup />
      <LiveCursorLayer />
      <ShapePanel
        onShapeDragEnd={clearDragPreview}
        onShapeDragMove={updateDragPreviewCursor}
        onShapeDragStart={handleShapeDragStart}
      />
      <CanvasControlBar
        canRedo={canRedo}
        canUndo={canUndo}
        onFitView={handleFitView}
        onRedo={handleRedo}
        onUndo={handleUndo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />
      {exportMessage ? <CanvasExportMessage message={exportMessage} /> : null}
      <StarterTemplatesModal
        isOpen={isTemplatesModalOpen}
        onImport={handleTemplateImport}
        onOpenChange={onTemplatesModalOpenChange}
      />
      {dragPreview ? <ShapeDragPreview preview={dragPreview} /> : null}
    </div>
  );
}

function PresenceAvatarGroup() {
  const { userId } = useAuth();
  const others = useOthers();
  const collaborators = React.useMemo(
    () =>
      others.filter((participant) =>
        userId ? participant.id !== userId : true
      ),
    [others, userId]
  );
  const visibleCollaborators = collaborators.slice(
    0,
    MAX_VISIBLE_COLLABORATORS
  );
  const overflowCount = collaborators.length - visibleCollaborators.length;

  return (
    <div className="pointer-events-auto absolute right-5 top-5 z-20 flex items-center rounded-full border border-surface-border bg-surface/95 px-2 py-1.5 shadow-2xl backdrop-blur">
      {visibleCollaborators.length > 0 ? (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {visibleCollaborators.map((participant) => (
              <CollaboratorAvatar
                key={participant.connectionId}
                participant={participant}
              />
            ))}
          </div>
          {overflowCount > 0 ? (
            <CollaboratorOverflow count={overflowCount} />
          ) : null}
          <div className="mx-2 h-6 w-px bg-surface-border" />
        </div>
      ) : null}
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-surface-border-subtle bg-elevated shadow-[0_0_0_1px_var(--bg-base)]">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
              userButtonAvatarBox: "h-8 w-8",
              userButtonTrigger: "h-8 w-8",
            },
          }}
        />
      </div>
    </div>
  );
}

function CollaboratorAvatar({
  participant,
}: {
  participant: CollaboratorPresence;
}) {
  const displayName = participant.info.displayName;
  const initials = getInitials(displayName);

  return (
    <div
      aria-label={displayName}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-border-subtle bg-elevated text-xs font-semibold text-copy-primary shadow-[0_0_0_1px_var(--bg-base)]"
      title={displayName}
    >
      {participant.info.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={displayName}
          className="h-full w-full object-cover"
          src={participant.info.avatarUrl}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

function CollaboratorOverflow({ count }: { count: number }) {
  return (
    <div className="-ml-2 flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-surface-border-subtle bg-subtle px-2 text-xs font-semibold text-copy-secondary shadow-[0_0_0_1px_var(--bg-base)]">
      +{count}
    </div>
  );
}

function LiveCursorLayer() {
  const { userId } = useAuth();
  const others = useOthers();
  const participants = React.useMemo(
    () =>
      others.filter(
        (participant) =>
          participant.presence.cursor &&
          (userId ? participant.id !== userId : true)
      ),
    [others, userId]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {participants.map((participant) =>
        participant.presence.cursor ? (
          <LiveCursor
            key={participant.connectionId}
            participant={participant}
          />
        ) : null
      )}
    </div>
  );
}

function LiveCursor({
  participant,
}: {
  participant: CollaboratorPresence;
}) {
  const cursor = participant.presence.cursor;

  if (!cursor) {
    return null;
  }

  return (
    <div
      className="absolute flex items-start"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: "translate(-1px, -1px)",
      }}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 drop-shadow-lg"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          d="M3 2.5 16.5 9 10.6 10.9 8.4 16.5 3 2.5Z"
          fill={participant.info.cursorColor}
          stroke="var(--bg-base)"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
      <span
        className="ml-1 mt-3 max-w-44 truncate rounded-xl px-2 py-1 text-xs font-semibold text-copy-primary shadow-lg"
        style={{
          backgroundColor: participant.info.cursorColor,
          color: "var(--bg-base)",
        }}
      >
        {participant.info.displayName}
      </span>
    </div>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

function CanvasEdgeRenderer({
  data,
  id,
  interactionWidth,
  markerEnd,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  style,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<CanvasEdge>) {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const editingContext = React.useContext(CanvasEdgeEditingContext);
  const isEditing = editingContext?.editingEdgeId === id;
  const label = data?.label ?? "";
  const labelTextLength = Math.max(
    isEditing ? CANVAS_EDGE_LABEL_PLACEHOLDER.length : 0,
    label.length,
    1
  );
  const shouldShowLabel = isEditing || isHovered || selected || label.length > 0;
  const isActive = isEditing || isHovered || selected;
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
    borderRadius: 6,
    offset: 24,
  });

  React.useEffect(() => {
    if (!isEditing) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const stopEdgeLabelInteraction = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
    },
    []
  );
  const finishEditing = React.useCallback(() => {
    editingContext?.setEditingEdgeId(null);
  }, [editingContext]);
  const handleLabelChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      reactFlow.updateEdgeData(id, {
        label: event.target.value,
      });
    },
    [id, reactFlow]
  );
  const handleLabelKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation();

      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        finishEditing();
        inputRef.current?.blur();
      }
    },
    [finishEditing]
  );

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <BaseEdge
        className="transition-[stroke-opacity,stroke] duration-150"
        interactionWidth={interactionWidth ?? CANVAS_DEFAULT_EDGE_OPTIONS.interactionWidth}
        markerEnd={markerEnd}
        path={edgePath}
        style={{
          ...style,
          stroke: isActive ? "var(--text-primary)" : "var(--text-secondary)",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeOpacity: isActive ? 0.95 : 0.5,
          strokeWidth: 2.25,
        }}
      />
      {shouldShowLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan nowheel absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: labelX,
              pointerEvents: "all",
              top: labelY,
            }}
            onClick={stopEdgeLabelInteraction}
            onDoubleClick={(event) => {
              stopEdgeLabelInteraction(event);
              editingContext?.setEditingEdgeId(id);
            }}
            onMouseDown={stopEdgeLabelInteraction}
            onPointerDown={stopEdgeLabelInteraction}
            onWheel={stopEdgeLabelInteraction}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                aria-label="Edge label"
                className="h-7 max-w-56 rounded-xl border border-surface-border bg-surface/95 px-2.5 text-center text-xs font-medium text-copy-primary shadow-lg outline-none backdrop-blur placeholder:text-copy-muted focus:border-brand focus:ring-3 focus:ring-ring/40"
                placeholder={CANVAS_EDGE_LABEL_PLACEHOLDER}
                style={{
                  width: `${labelTextLength + 1}ch`,
                }}
                value={label}
                onBlur={finishEditing}
                onChange={handleLabelChange}
                onKeyDown={handleLabelKeyDown}
              />
            ) : (
              <span
                className={cn(
                  "block max-w-56 rounded-xl border border-surface-border bg-surface/90 px-2.5 py-1 text-center text-xs font-medium shadow-lg backdrop-blur",
                  label.length > 0
                    ? "text-copy-primary"
                    : "text-copy-muted opacity-70"
                )}
                style={{
                  minWidth: `${labelTextLength + 1}ch`,
                }}
              >
                {label.length > 0 ? label : CANVAS_EDGE_LABEL_PLACEHOLDER}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </g>
  );
}

function ShapePanel({
  onShapeDragEnd,
  onShapeDragMove,
  onShapeDragStart,
}: {
  onShapeDragEnd: () => void;
  onShapeDragMove: (cursor: ShapeDragPreviewState["cursor"]) => void;
  onShapeDragStart: (
    payload: ShapeDragPayload,
    cursor: ShapeDragPreviewState["cursor"]
  ) => void;
}) {
  return (
    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-surface-border bg-surface/95 p-2 shadow-2xl backdrop-blur">
      {SHAPE_TOOLBAR_ITEMS.map((item) => (
        <ShapeButton
          key={item.shape}
          item={item}
          onShapeDragEnd={onShapeDragEnd}
          onShapeDragMove={onShapeDragMove}
          onShapeDragStart={onShapeDragStart}
        />
      ))}
    </div>
  );
}

function CanvasControlBar({
  canRedo,
  canUndo,
  onFitView,
  onRedo,
  onUndo,
  onZoomIn,
  onZoomOut,
}: {
  canRedo: boolean;
  canUndo: boolean;
  onFitView: () => void;
  onRedo: () => void;
  onUndo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div
      aria-label="Canvas controls"
      role="toolbar"
      className="absolute bottom-24 left-6 z-20 flex items-center rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur"
    >
      <div className="flex items-center gap-1" role="group" aria-label="Zoom">
        <CanvasControlButton label="Zoom out" onClick={onZoomOut}>
          <Minus className="h-4 w-4" />
        </CanvasControlButton>
        <CanvasControlButton label="Fit view" onClick={onFitView}>
          <Maximize2 className="h-4 w-4" />
        </CanvasControlButton>
        <CanvasControlButton label="Zoom in" onClick={onZoomIn}>
          <Plus className="h-4 w-4" />
        </CanvasControlButton>
      </div>
      <div className="mx-1.5 h-6 w-px bg-surface-border-subtle" />
      <div
        className="flex items-center gap-1"
        role="group"
        aria-label="History"
      >
        <CanvasControlButton
          disabled={!canUndo}
          label="Undo"
          onClick={onUndo}
        >
          <Undo2 className="h-4 w-4" />
        </CanvasControlButton>
        <CanvasControlButton
          disabled={!canRedo}
          label="Redo"
          onClick={onRedo}
        >
          <Redo2 className="h-4 w-4" />
        </CanvasControlButton>
      </div>
    </div>
  );
}

function CanvasControlButton({
  children,
  disabled = false,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-copy-secondary transition hover:bg-accent-dim hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:text-copy-faint disabled:opacity-45"
      disabled={disabled}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CanvasExportMessage({ message }: { message: string }) {
  return (
    <div
      className="pointer-events-none absolute right-5 top-20 z-30 rounded-xl border border-surface-border bg-surface/95 px-3 py-2 text-sm font-medium text-copy-secondary shadow-2xl backdrop-blur"
      role="status"
    >
      {message}
    </div>
  );
}

function ShapeButton({
  item,
  onShapeDragEnd,
  onShapeDragMove,
  onShapeDragStart,
}: {
  item: ShapeToolbarItem;
  onShapeDragEnd: () => void;
  onShapeDragMove: (cursor: ShapeDragPreviewState["cursor"]) => void;
  onShapeDragStart: (
    payload: ShapeDragPayload,
    cursor: ShapeDragPreviewState["cursor"]
  ) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      aria-label={item.label}
      className="flex h-11 w-11 cursor-grab items-center justify-center rounded-full border border-surface-border bg-elevated text-copy-secondary transition hover:border-brand hover:bg-accent-dim hover:text-brand focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
      draggable
      title={item.label}
      onDragStart={(event) => {
        const payload: ShapeDragPayload = {
          shape: item.shape,
          size: CANVAS_SHAPE_DEFAULT_SIZES[item.shape],
        };
        const transparentDragImage = document.createElement("canvas");
        transparentDragImage.width = 1;
        transparentDragImage.height = 1;

        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setDragImage(transparentDragImage, 0, 0);
        event.dataTransfer.setData(
          SHAPE_DRAG_MIME_TYPE,
          JSON.stringify(payload)
        );
        event.dataTransfer.setData("text/plain", item.shape);
        onShapeDragStart(payload, {
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onDrag={(event) => {
        if (event.clientX === 0 && event.clientY === 0) {
          return;
        }

        onShapeDragMove({
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onDragEnd={() => {
        onShapeDragEnd();
      }}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function ShapeDragPreview({
  preview,
}: {
  preview: ShapeDragPreviewState;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-70 shadow-2xl"
      style={{
        height: preview.size.height,
        left: preview.cursor.x,
        top: preview.cursor.y,
        width: preview.size.width,
      }}
    >
      <CanvasNodeShapeVisual
        height={preview.size.height}
        label=""
        nodeColor={DEFAULT_NODE_COLOR}
        selected={false}
        shape={preview.shape}
        width={preview.size.width}
      />
    </div>
  );
}

function CanvasNodeRenderer({
  data,
  height,
  id,
  selected,
  width,
}: NodeProps<CanvasNode>) {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const nodeColor =
    NODE_COLORS.find((color) => color.id === data.color) ?? DEFAULT_NODE_COLOR;
  const nodeWidth = width ?? "100%";
  const nodeHeight = height ?? "100%";
  const nodeMinSize = CANVAS_NODE_MIN_SIZES[data.shape];
  const areConnectionHandlesVisible = selected || isHovered;
  const hasLabel = data.label.trim().length > 0;

  React.useEffect(() => {
    if (!isEditing) {
      return;
    }

    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, [isEditing]);

  const handleLabelChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      reactFlow.updateNodeData(id, {
        label: event.target.value,
      });
    },
    [id, reactFlow]
  );
  const handleLabelKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      event.stopPropagation();

      if (event.key === "Escape") {
        event.preventDefault();
        setIsEditing(false);
        textareaRef.current?.blur();
      }
    },
    []
  );
  const stopCanvasTextInteraction = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
    },
    []
  );
  const stopCanvasToolbarInteraction = React.useCallback(
    (event: React.SyntheticEvent) => {
      event.stopPropagation();
    },
    []
  );
  const handleNodeColorSelect = React.useCallback(
    (colorId: (typeof NODE_COLORS)[number]["id"]) => {
      reactFlow.updateNodeData(id, {
        color: colorId,
      });
    },
    [id, reactFlow]
  );

  return (
    <div
      className="relative h-full min-h-16 w-full min-w-24"
      style={{
        height: nodeHeight,
        width: nodeWidth,
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <CanvasNodeColorToolbar
        activeColorId={nodeColor.id}
        isVisible={selected}
        onColorSelect={handleNodeColorSelect}
        onToolbarInteraction={stopCanvasToolbarInteraction}
      />
      <NodeResizer
        autoScale
        color={CANVAS_NODE_SELECTION_COLOR}
        handleClassName="z-30"
        handleStyle={{
          backgroundColor: "var(--bg-elevated)",
          borderColor: CANVAS_NODE_SELECTION_COLOR,
          height: 8,
          opacity: 0.9,
          width: 8,
        }}
        isVisible={selected}
        lineClassName="z-30"
        lineStyle={{
          borderColor: CANVAS_NODE_SELECTION_COLOR,
          opacity: 0.55,
        }}
        minHeight={nodeMinSize.height}
        minWidth={nodeMinSize.width}
      />
      <CanvasNodeConnectionHandles
        shape={data.shape}
        visible={areConnectionHandlesVisible}
      />
      <CanvasNodeShapeVisual
        height={nodeHeight}
        label={
          isEditing
            ? ""
            : hasLabel
              ? data.label
              : CANVAS_NODE_LABEL_PLACEHOLDER
        }
        mutedLabel={!hasLabel}
        nodeColor={nodeColor}
        selected={selected}
        shape={data.shape}
        width={nodeWidth}
      />
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-3 py-2">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            aria-label="Node label"
            className="nodrag nopan nowheel pointer-events-auto h-10 max-h-full w-full resize-none overflow-hidden border-0 bg-transparent px-4 py-2 text-center text-sm font-medium text-copy-primary outline-none placeholder:text-copy-muted focus-visible:ring-0"
            placeholder={CANVAS_NODE_LABEL_PLACEHOLDER}
            rows={1}
            value={data.label}
            onBlur={() => setIsEditing(false)}
            onChange={handleLabelChange}
            onClick={stopCanvasTextInteraction}
            onDoubleClick={stopCanvasTextInteraction}
            onKeyDown={handleLabelKeyDown}
            onMouseDown={stopCanvasTextInteraction}
            onPointerDown={stopCanvasTextInteraction}
          />
        ) : (
          <div
            aria-label="Edit node label"
            className="pointer-events-auto h-8 w-full max-w-full"
            role="button"
            tabIndex={-1}
            onDoubleClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIsEditing(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CanvasNodeColorToolbar({
  activeColorId,
  isVisible,
  onColorSelect,
  onToolbarInteraction,
}: {
  activeColorId: (typeof NODE_COLORS)[number]["id"];
  isVisible: boolean;
  onColorSelect: (colorId: (typeof NODE_COLORS)[number]["id"]) => void;
  onToolbarInteraction: (event: React.SyntheticEvent) => void;
}) {
  return (
    <NodeToolbar
      align="center"
      className="nodrag nopan nowheel rounded-full border border-surface-border bg-surface/95 p-1.5 shadow-2xl backdrop-blur"
      isVisible={isVisible}
      offset={12}
      position={Position.Top}
      onClick={onToolbarInteraction}
      onDoubleClick={onToolbarInteraction}
      onMouseDown={onToolbarInteraction}
      onPointerDown={onToolbarInteraction}
      onWheel={onToolbarInteraction}
    >
      <div className="flex items-center gap-1">
        {NODE_COLORS.map((color) => {
          const isActive = color.id === activeColorId;

          return (
            <button
              key={color.id}
              type="button"
              aria-label={`Use ${color.id} node color`}
              aria-pressed={isActive}
              className={cn(
                "h-6 w-6 rounded-full border p-0.5 transition-[border-color,box-shadow,transform] duration-150 hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive ? "scale-105" : ""
              )}
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: isActive ? color.text : "var(--border-subtle)",
                boxShadow: isActive
                  ? `0 0 0 1px ${color.text}, 0 0 8px ${color.text}`
                  : undefined,
              }}
              title={`${color.id} node color`}
              onClick={(event) => {
                onToolbarInteraction(event);
                onColorSelect(color.id);
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.boxShadow = isActive
                  ? `0 0 0 1px ${color.text}, 0 0 8px ${color.text}`
                  : `0 0 7px ${color.text}`;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.boxShadow = isActive
                  ? `0 0 0 1px ${color.text}, 0 0 8px ${color.text}`
                  : "";
              }}
              onPointerDown={onToolbarInteraction}
            >
              <span
                aria-hidden="true"
                className="block h-full w-full rounded-full border"
                style={{
                  backgroundColor: color.fill,
                  borderColor: color.text,
                }}
              />
            </button>
          );
        })}
      </div>
    </NodeToolbar>
  );
}

function CanvasNodeConnectionHandles({
  shape,
  visible,
}: {
  shape: CanvasNodeShape;
  visible: boolean;
}) {
  return (
    <>
      {CANVAS_NODE_CONNECTION_POINTS.map((point) => (
        <Handle
          key={point.id}
          className={cn(
            CANVAS_NODE_HANDLE_BASE_CLASSNAME,
            visible
              ? "!pointer-events-auto !opacity-100"
              : "!pointer-events-none !opacity-0"
          )}
          id={point.id}
          isConnectable={visible}
          position={point.position}
          style={getCanvasNodeHandleStyle(shape, point)}
          type="source"
        />
      ))}
    </>
  );
}

function getCanvasNodeHandleStyle(
  shape: CanvasNodeShape,
  point: CanvasConnectionPoint
): React.CSSProperties | undefined {
  if (shape === "cylinder") {
    if (point.id === "top") {
      return {
        top: "8%",
      };
    }

    if (point.id === "right") {
      return {
        right: "8%",
      };
    }

    if (point.id === "bottom") {
      return {
        bottom: "8%",
      };
    }

    return {
      left: "8%",
    };
  }

  if (shape === "hexagon") {
    if (point.id === "top") {
      return {
        top: "3%",
      };
    }

    if (point.id === "right") {
      return {
        right: "2%",
      };
    }

    if (point.id === "bottom") {
      return {
        bottom: "3%",
      };
    }

    return {
      left: "2%",
    };
  }

  return undefined;
}

function CanvasNodeShapeVisual({
  height,
  label,
  mutedLabel = false,
  nodeColor,
  selected,
  shape,
  width,
}: {
  height: number | string;
  label: string;
  mutedLabel?: boolean;
  nodeColor: (typeof NODE_COLORS)[number];
  selected: boolean;
  shape: CanvasNodeShape;
  width: number | string;
}) {
  const borderColor = selected
    ? CANVAS_NODE_SELECTION_COLOR
    : "var(--border-subtle)";
  const ringClass = selected ? "ring-2 ring-copy-secondary/40" : "";
  const content = (
    <span
      className={cn(
        "relative z-10 max-w-full truncate px-4 text-center text-sm font-medium",
        mutedLabel ? "opacity-55" : ""
      )}
    >
      {label}
    </span>
  );

  if (shape === "rectangle" || shape === "pill" || shape === "circle") {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center border shadow-lg",
          shape === "rectangle" ? "rounded-xl" : "rounded-full",
          ringClass
        )}
        style={{
          backgroundColor: nodeColor.fill,
          borderColor,
          color: nodeColor.text,
          height,
          width,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center drop-shadow-lg",
        ringClass
      )}
      style={{
        color: nodeColor.text,
        height,
        width,
      }}
    >
      <ShapeSvg shape={shape} fill={nodeColor.fill} stroke={borderColor} />
      {content}
    </div>
  );
}

function ShapeSvg({
  fill,
  shape,
  stroke,
}: {
  fill: string;
  shape: Extract<CanvasNodeShape, "cylinder" | "diamond" | "hexagon">;
  stroke: string;
}) {
  if (shape === "diamond") {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polygon
          fill={fill}
          points="50,2 98,50 50,98 2,50"
          stroke={stroke}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  if (shape === "hexagon") {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full overflow-visible"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <polygon
          fill={fill}
          points="25,3 75,3 98,50 75,97 25,97 2,50"
          stroke={stroke}
          strokeLinejoin="round"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full overflow-visible"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <path
        d="M 8 18 C 8 8 92 8 92 18 L 92 82 C 92 92 8 92 8 82 Z"
        fill={fill}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <ellipse
        cx="50"
        cy="18"
        fill={fill}
        rx="42"
        ry="10"
        stroke={stroke}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function getDropNodePosition({
  bounds,
  pointer,
  reactFlow,
  size,
}: {
  bounds: DOMRect;
  pointer: {
    x: number;
    y: number;
  };
  reactFlow: ReturnType<typeof useReactFlow<CanvasNode, CanvasEdge>>;
  size: CanvasNodeSize;
}) {
  const { zoom } = reactFlow.getViewport();
  const displayedHalfWidth = (size.width * zoom) / 2;
  const displayedHalfHeight = (size.height * zoom) / 2;
  const minScreenX = bounds.left + displayedHalfWidth;
  const minScreenY = bounds.top + displayedHalfHeight;
  const maxScreenX = bounds.right - displayedHalfWidth;
  const maxScreenY = bounds.bottom - displayedHalfHeight;
  const clampedScreenX = clamp(
    pointer.x,
    Math.min(minScreenX, maxScreenX),
    Math.max(minScreenX, maxScreenX)
  );
  const clampedScreenY = clamp(
    pointer.y,
    Math.min(minScreenY, maxScreenY),
    Math.max(minScreenY, maxScreenY)
  );

  return reactFlow.screenToFlowPosition({
    x: clampedScreenX,
    y: clampedScreenY,
  });
}

function normalizeCanvasEdge(edge: CanvasEdge): CanvasEdge {
  const label =
    typeof edge.data?.label === "string"
      ? edge.data.label
      : typeof edge.label === "string"
        ? edge.label
        : "";

  return {
    ...edge,
    type: CANVAS_EDGE_TYPE,
    interactionWidth:
      edge.interactionWidth ?? CANVAS_DEFAULT_EDGE_OPTIONS.interactionWidth,
    markerEnd: edge.markerEnd ?? CANVAS_DEFAULT_EDGE_OPTIONS.markerEnd,
    style: edge.style ?? CANVAS_DEFAULT_EDGE_OPTIONS.style,
    data: {
      label,
    },
  };
}

function parseLoadedCanvasState(value: unknown) {
  if (!isRecord(value) || !("canvas" in value)) {
    return {
      ok: false as const,
      error: "Canvas response is invalid.",
    };
  }

  return parseCanvasState(value.canvas);
}

function cloneCanvasTemplate(template: CanvasTemplate): {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
} {
  const importId = `${template.id}-${Date.now()}`;
  const nodeIdMap = new Map(
    template.nodes.map((node) => [node.id, `${importId}-${node.id}`])
  );
  const nodes = template.nodes.map((node) => ({
    ...node,
    id: nodeIdMap.get(node.id) ?? `${importId}-${node.id}`,
    selected: false,
    data: {
      ...node.data,
    },
    position: {
      ...node.position,
    },
    style: node.style
      ? {
          ...node.style,
        }
      : undefined,
  }));
  const edges = template.edges.map((edge) => ({
    ...edge,
    id: `${importId}-${edge.id}`,
    selected: false,
    source: nodeIdMap.get(edge.source) ?? edge.source,
    target: nodeIdMap.get(edge.target) ?? edge.target,
    data: {
      label: edge.data?.label ?? "",
    },
  }));

  return {
    nodes,
    edges,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readShapeDragPayload(
  dataTransfer: DataTransfer
): ShapeDragPayload | null {
  const rawPayload = dataTransfer.getData(SHAPE_DRAG_MIME_TYPE);

  if (!rawPayload) {
    return null;
  }

  try {
    const parsedPayload: unknown = JSON.parse(rawPayload);

    if (!isShapeDragPayload(parsedPayload)) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

function isShapeDragPayload(value: unknown): value is ShapeDragPayload {
  if (!isRecord(value)) {
    return false;
  }

  const { shape, size } = value;

  return (
    isCanvasNodeShape(shape) &&
    isRecord(size) &&
    typeof size.width === "number" &&
    Number.isFinite(size.width) &&
    typeof size.height === "number" &&
    Number.isFinite(size.height)
  );
}

function isCanvasNodeShape(value: unknown): value is CanvasNodeShape {
  return (
    typeof value === "string" &&
    CANVAS_NODE_SHAPES.includes(value as CanvasNodeShape)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base text-sm text-copy-muted">
      Loading canvas...
    </div>
  );
}

function CanvasErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base px-6 text-center">
      <div className="max-w-md">
        <h2 className="text-sm font-semibold text-copy-primary">
          Canvas connection failed
        </h2>
        <p className="mt-2 text-sm leading-6 text-copy-secondary">{message}</p>
      </div>
    </div>
  );
}
