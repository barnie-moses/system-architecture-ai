import type { Edge, Node } from "@xyflow/react";

export const CANVAS_NODE_TYPE = "canvasNode";
export const CANVAS_EDGE_TYPE = "canvasEdge";

export const NODE_COLORS = [
  {
    id: "neutral",
    fill: "#1F1F1F",
    text: "#EDEDED",
  },
  {
    id: "blue",
    fill: "#10233D",
    text: "#52A8FF",
  },
  {
    id: "purple",
    fill: "#2E1938",
    text: "#BF7AF0",
  },
  {
    id: "orange",
    fill: "#331B00",
    text: "#FF990A",
  },
  {
    id: "red",
    fill: "#3C1618",
    text: "#FF6166",
  },
  {
    id: "pink",
    fill: "#3A1726",
    text: "#F75F8F",
  },
  {
    id: "green",
    fill: "#0F2E18",
    text: "#62C073",
  },
  {
    id: "teal",
    fill: "#062822",
    text: "#0AC7B4",
  },
] as const;

export const DEFAULT_NODE_COLOR = NODE_COLORS[0];

export type CanvasNodeColorId = (typeof NODE_COLORS)[number]["id"];

export const CANVAS_NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type CanvasNodeShape = (typeof CANVAS_NODE_SHAPES)[number];

export type CanvasNodeSize = {
  width: number;
  height: number;
};

export const CANVAS_SHAPE_DEFAULT_SIZES: Record<
  CanvasNodeShape,
  CanvasNodeSize
> = {
  rectangle: {
    width: 144,
    height: 80,
  },
  diamond: {
    width: 120,
    height: 120,
  },
  circle: {
    width: 104,
    height: 104,
  },
  pill: {
    width: 144,
    height: 64,
  },
  cylinder: {
    width: 124,
    height: 88,
  },
  hexagon: {
    width: 136,
    height: 84,
  },
};

export type CanvasNodeData = {
  label: string;
  color: CanvasNodeColorId;
  shape: CanvasNodeShape;
};

export type CanvasEdgeData = {
  label: string;
};

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;

export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>;
