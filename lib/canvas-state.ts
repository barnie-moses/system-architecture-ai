import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_ORIGIN,
  CANVAS_NODE_SHAPES,
  CANVAS_NODE_TYPE,
  CANVAS_SHAPE_DEFAULT_SIZES,
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
} from "@/types/canvas";
import type {
  CanvasEdge,
  CanvasNode,
  CanvasNodeColorId,
  CanvasNodeShape,
} from "@/types/canvas";

export const CANVAS_SNAPSHOT_VERSION = 1;

export type CanvasState = {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

export type StoredCanvasSnapshot = CanvasState & {
  savedAt: string;
  version: typeof CANVAS_SNAPSHOT_VERSION;
};

export type CanvasStateResult =
  | {
      ok: true;
      state: CanvasState;
    }
  | {
      ok: false;
      error: string;
    };

export const EMPTY_CANVAS_STATE: CanvasState = {
  nodes: [],
  edges: [],
};

const nodeColorIds = new Set<string>(NODE_COLORS.map((color) => color.id));
const nodeShapes = new Set<string>(CANVAS_NODE_SHAPES);

export function createStoredCanvasSnapshot(
  state: CanvasState
): StoredCanvasSnapshot {
  return {
    ...state,
    savedAt: new Date().toISOString(),
    version: CANVAS_SNAPSHOT_VERSION,
  };
}

export function getCanvasStateHash(state: CanvasState) {
  return JSON.stringify({
    edges: state.edges,
    nodes: state.nodes,
  });
}

export function parseCanvasState(value: unknown): CanvasStateResult {
  if (!isRecord(value)) {
    return { ok: false, error: "Canvas payload must be an object." };
  }

  if (!Array.isArray(value.nodes)) {
    return { ok: false, error: "Canvas nodes must be an array." };
  }

  if (!Array.isArray(value.edges)) {
    return { ok: false, error: "Canvas edges must be an array." };
  }

  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];

  for (const node of value.nodes) {
    const parsedNode = parseCanvasNode(node);

    if (!parsedNode.ok) {
      return parsedNode;
    }

    nodes.push(parsedNode.node);
  }

  for (const edge of value.edges) {
    const parsedEdge = parseCanvasEdge(edge);

    if (!parsedEdge.ok) {
      return parsedEdge;
    }

    edges.push(parsedEdge.edge);
  }

  return {
    ok: true,
    state: {
      edges,
      nodes,
    },
  };
}

function parseCanvasNode(
  value: unknown
):
  | {
      ok: true;
      node: CanvasNode;
    }
  | {
      ok: false;
      error: string;
    } {
  if (!isRecord(value)) {
    return { ok: false, error: "Canvas node must be an object." };
  }

  if (typeof value.id !== "string" || !value.id.trim()) {
    return { ok: false, error: "Canvas node ID is required." };
  }

  if (!isRecord(value.position)) {
    return { ok: false, error: "Canvas node position is required." };
  }

  if (!isFiniteNumber(value.position.x) || !isFiniteNumber(value.position.y)) {
    return { ok: false, error: "Canvas node position must be numeric." };
  }

  if (!isRecord(value.data)) {
    return { ok: false, error: "Canvas node data is required." };
  }

  const shape = parseNodeShape(value.data.shape);
  const color = parseNodeColor(value.data.color);
  const size = CANVAS_SHAPE_DEFAULT_SIZES[shape];
  const width = isFiniteNumber(value.width) ? value.width : size.width;
  const height = isFiniteNumber(value.height) ? value.height : size.height;

  return {
    ok: true,
    node: {
      id: value.id,
      type: CANVAS_NODE_TYPE,
      origin: CANVAS_NODE_ORIGIN,
      position: {
        x: value.position.x,
        y: value.position.y,
      },
      width,
      height,
      initialWidth: isFiniteNumber(value.initialWidth)
        ? value.initialWidth
        : width,
      initialHeight: isFiniteNumber(value.initialHeight)
        ? value.initialHeight
        : height,
      selected: false,
      style: {
        height,
        width,
      },
      data: {
        color,
        label: typeof value.data.label === "string" ? value.data.label : "",
        shape,
      },
    },
  };
}

function parseCanvasEdge(
  value: unknown
):
  | {
      ok: true;
      edge: CanvasEdge;
    }
  | {
      ok: false;
      error: string;
    } {
  if (!isRecord(value)) {
    return { ok: false, error: "Canvas edge must be an object." };
  }

  if (typeof value.id !== "string" || !value.id.trim()) {
    return { ok: false, error: "Canvas edge ID is required." };
  }

  if (typeof value.source !== "string" || !value.source.trim()) {
    return { ok: false, error: "Canvas edge source is required." };
  }

  if (typeof value.target !== "string" || !value.target.trim()) {
    return { ok: false, error: "Canvas edge target is required." };
  }

  const data = isRecord(value.data) ? value.data : {};
  const label =
    typeof data.label === "string"
      ? data.label
      : typeof value.label === "string"
        ? value.label
        : "";
  const edge: CanvasEdge = {
    id: value.id,
    source: value.source,
    target: value.target,
    type: CANVAS_EDGE_TYPE,
    selected: false,
    data: {
      label,
    },
  };

  if (typeof value.sourceHandle === "string") {
    edge.sourceHandle = value.sourceHandle;
  }

  if (typeof value.targetHandle === "string") {
    edge.targetHandle = value.targetHandle;
  }

  return {
    ok: true,
    edge,
  };
}

function parseNodeShape(value: unknown): CanvasNodeShape {
  return typeof value === "string" && nodeShapes.has(value)
    ? (value as CanvasNodeShape)
    : "rectangle";
}

function parseNodeColor(value: unknown): CanvasNodeColorId {
  return typeof value === "string" && nodeColorIds.has(value)
    ? (value as CanvasNodeColorId)
    : DEFAULT_NODE_COLOR.id;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
