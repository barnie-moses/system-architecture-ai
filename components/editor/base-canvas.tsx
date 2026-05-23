"use client";

import * as React from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import type { NodeProps, NodeTypes } from "@xyflow/react";
import {
  Circle,
  Database,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_SHAPES,
  CANVAS_NODE_TYPE,
  CANVAS_SHAPE_DEFAULT_SIZES,
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
} from "@/types/canvas";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { CanvasNodeShape, CanvasNodeSize } from "@/types/canvas";

type BaseCanvasProps = {
  roomId: string;
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

type ShapeToolbarItem = {
  shape: CanvasNodeShape;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const SHAPE_DRAG_MIME_TYPE = "application/x-system-architecture-shape";

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

export function BaseCanvas({ roomId }: BaseCanvasProps) {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            isThinking: false,
          }}
        >
          <ClientSideSuspense fallback={<CanvasLoadingState />}>
            {() => (
              <CanvasConnectionFallback>
                <ReactFlowProvider>
                  <SyncedReactFlowCanvas />
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

function SyncedReactFlowCanvas() {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const nodeCounterRef = React.useRef(0);
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

      nodeCounterRef.current += 1;

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: CanvasNode = {
        id: `${payload.shape}-${Date.now()}-${nodeCounterRef.current}`,
        type: CANVAS_NODE_TYPE,
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
    [reactFlow]
  );

  return (
    <div
      className="relative h-full w-full"
      onDragOver={handleCanvasDragOver}
      onDrop={handleCanvasDrop}
    >
      <ReactFlow<CanvasNode, CanvasEdge>
        className="bg-base"
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: CANVAS_EDGE_TYPE,
        }}
        edges={edges}
        fitView
        nodeTypes={CANVAS_NODE_TYPES}
        nodes={nodes}
        onConnect={onConnect}
        onDelete={onDelete}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      >
        <MiniMap
          maskColor="var(--bg-base)"
          nodeColor="var(--bg-subtle)"
          nodeStrokeColor="var(--accent-primary)"
          pannable
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius)",
          }}
          zoomable
        />
        <Background
          color="var(--border-subtle)"
          gap={24}
          size={1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}

function ShapePanel() {
  return (
    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-surface-border bg-surface/95 p-2 shadow-2xl backdrop-blur">
      {SHAPE_TOOLBAR_ITEMS.map((item) => (
        <ShapeButton key={item.shape} item={item} />
      ))}
    </div>
  );
}

function ShapeButton({ item }: { item: ShapeToolbarItem }) {
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

        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData(
          SHAPE_DRAG_MIME_TYPE,
          JSON.stringify(payload)
        );
      }}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function CanvasNodeRenderer({
  data,
  height,
  selected,
  width,
}: NodeProps<CanvasNode>) {
  const nodeColor =
    NODE_COLORS.find((color) => color.id === data.color) ?? DEFAULT_NODE_COLOR;

  return (
    <div
      className={cn(
        "flex h-full min-h-16 w-full min-w-24 items-center justify-center rounded-xl border px-3 text-center text-sm font-medium shadow-lg",
        selected ? "ring-2 ring-brand/40" : ""
      )}
      style={{
        backgroundColor: nodeColor.fill,
        borderColor: selected
          ? "var(--accent-primary)"
          : "var(--border-subtle)",
        color: nodeColor.text,
        height: height ?? "100%",
        width: width ?? "100%",
      }}
    >
      <Handle
        className="!border-surface-border !bg-elevated"
        isConnectable
        position={Position.Top}
        type="target"
      />
      <span className="truncate">{data.label}</span>
      <Handle
        className="!border-surface-border !bg-elevated"
        isConnectable
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
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
