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
    width: 176,
    height: 96,
  },
  diamond: {
    width: 152,
    height: 152,
  },
  circle: {
    width: 128,
    height: 128,
  },
  pill: {
    width: 176,
    height: 80,
  },
  cylinder: {
    width: 152,
    height: 112,
  },
  hexagon: {
    width: 168,
    height: 104,
  },
};

export type CanvasNodeData = {
  label: string;
  color: CanvasNodeColorId;
  shape: CanvasNodeShape;
};

export type CanvasEdgeData = Record<string, never>;

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;

export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>;
