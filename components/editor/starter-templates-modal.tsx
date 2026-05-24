"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DEFAULT_NODE_COLOR, NODE_COLORS } from "@/types/canvas";
import type { CanvasNode, CanvasNodeShape } from "@/types/canvas";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
} from "@/components/editor/starter-templates";

type StarterTemplatesModalProps = {
  isOpen: boolean;
  onImport: (template: CanvasTemplate) => void;
  onOpenChange: (isOpen: boolean) => void;
};

type PreviewNodeFrame = {
  centerX: number;
  centerY: number;
  height: number;
  node: CanvasNode;
  width: number;
};

const PREVIEW_WIDTH = 360;
const PREVIEW_HEIGHT = 170;
const PREVIEW_PADDING = 22;
const PREVIEW_NODE_FALLBACK_WIDTH = 128;
const PREVIEW_NODE_FALLBACK_HEIGHT = 72;

export function StarterTemplatesModal({
  isOpen,
  onImport,
  onOpenChange,
}: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(720px,calc(100vh-2rem))] overflow-hidden rounded-3xl border border-surface-border bg-elevated p-0 text-copy-primary shadow-2xl sm:max-w-4xl">
        <div className="space-y-4 p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-copy-primary">
              Starter templates
            </DialogTitle>
            <DialogDescription className="text-copy-muted">
              Import a pre-built system diagram into the current canvas.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="h-[min(520px,calc(100vh-13rem))] px-6 pb-6">
          <div className="grid gap-4 pb-1 md:grid-cols-2 xl:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onImport={(selectedTemplate) => {
                  onImport(selectedTemplate);
                  onOpenChange(false);
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({
  template,
  onImport,
}: {
  template: CanvasTemplate;
  onImport: (template: CanvasTemplate) => void;
}) {
  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface">
      <TemplatePreview template={template} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-copy-primary">
          {template.name}
        </h3>
        <p className="mt-2 min-h-16 text-sm leading-6 text-copy-muted">
          {template.description}
        </p>
        <Button
          type="button"
          className="mt-4 w-full"
          onClick={() => onImport(template)}
        >
          Import
        </Button>
      </div>
    </article>
  );
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const frames = React.useMemo(() => getPreviewNodeFrames(template), [template]);
  const frameById = React.useMemo(
    () => new Map(frames.map((frame) => [frame.node.id, frame])),
    [frames]
  );

  return (
    <div className="h-40 border-b border-surface-border bg-base">
      <svg
        aria-hidden="true"
        className="h-full w-full"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      >
        <g opacity="0.75">
          {template.edges.map((edge) => {
            const sourceFrame = frameById.get(edge.source);
            const targetFrame = frameById.get(edge.target);

            if (!sourceFrame || !targetFrame) {
              return null;
            }

            return (
              <line
                key={edge.id}
                stroke="var(--text-secondary)"
                strokeLinecap="round"
                strokeWidth="1.6"
                x1={sourceFrame.centerX}
                x2={targetFrame.centerX}
                y1={sourceFrame.centerY}
                y2={targetFrame.centerY}
              />
            );
          })}
        </g>

        {frames.map((frame) => (
          <PreviewNode key={frame.node.id} frame={frame} />
        ))}
      </svg>
    </div>
  );
}

function PreviewNode({ frame }: { frame: PreviewNodeFrame }) {
  const nodeColor =
    NODE_COLORS.find((color) => color.id === frame.node.data.color) ??
    DEFAULT_NODE_COLOR;
  const x = frame.centerX - frame.width / 2;
  const y = frame.centerY - frame.height / 2;
  const label = truncatePreviewLabel(frame.node.data.label);

  return (
    <g>
      <PreviewNodeShape
        fill={nodeColor.fill}
        height={frame.height}
        shape={frame.node.data.shape}
        stroke="var(--border-subtle)"
        width={frame.width}
        x={x}
        y={y}
      />
      <text
        dominantBaseline="middle"
        fill={nodeColor.text}
        fontSize="10"
        fontWeight="600"
        textAnchor="middle"
        x={frame.centerX}
        y={frame.centerY}
      >
        {label}
      </text>
    </g>
  );
}

function PreviewNodeShape({
  fill,
  height,
  shape,
  stroke,
  width,
  x,
  y,
}: {
  fill: string;
  height: number;
  shape: CanvasNodeShape;
  stroke: string;
  width: number;
  x: number;
  y: number;
}) {
  if (shape === "circle") {
    return (
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        fill={fill}
        rx={width / 2}
        ry={height / 2}
        stroke={stroke}
        strokeWidth="1.3"
      />
    );
  }

  if (shape === "rectangle" || shape === "pill") {
    return (
      <rect
        fill={fill}
        height={height}
        rx={shape === "pill" ? height / 2 : 8}
        stroke={stroke}
        strokeWidth="1.3"
        width={width}
        x={x}
        y={y}
      />
    );
  }

  if (shape === "diamond") {
    return (
      <polygon
        fill={fill}
        points={`${x + width / 2},${y} ${x + width},${y + height / 2} ${
          x + width / 2
        },${y + height} ${x},${y + height / 2}`}
        stroke={stroke}
        strokeWidth="1.3"
      />
    );
  }

  if (shape === "hexagon") {
    return (
      <polygon
        fill={fill}
        points={`${x + width * 0.25},${y} ${x + width * 0.75},${y} ${
          x + width
        },${y + height / 2} ${x + width * 0.75},${y + height} ${
          x + width * 0.25
        },${y + height} ${x},${y + height / 2}`}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    );
  }

  return (
    <g>
      <path
        d={`M ${x + width * 0.08} ${y + height * 0.2} C ${
          x + width * 0.08
        } ${y + height * 0.08} ${x + width * 0.92} ${y + height * 0.08} ${
          x + width * 0.92
        } ${y + height * 0.2} L ${x + width * 0.92} ${y + height * 0.8} C ${
          x + width * 0.92
        } ${y + height * 0.92} ${x + width * 0.08} ${y + height * 0.92} ${
          x + width * 0.08
        } ${y + height * 0.8} Z`}
        fill={fill}
        stroke={stroke}
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
      <ellipse
        cx={x + width / 2}
        cy={y + height * 0.2}
        fill={fill}
        rx={width * 0.42}
        ry={height * 0.11}
        stroke={stroke}
        strokeWidth="1.3"
      />
    </g>
  );
}

function getPreviewNodeFrames(template: CanvasTemplate): PreviewNodeFrame[] {
  const nodeFrames = template.nodes.map((node) => {
    const size = getNodeSize(node);

    return {
      node,
      width: size.width,
      height: size.height,
      minX: node.position.x - size.width / 2,
      minY: node.position.y - size.height / 2,
      maxX: node.position.x + size.width / 2,
      maxY: node.position.y + size.height / 2,
    };
  });

  if (nodeFrames.length === 0) {
    return [];
  }

  const minX = Math.min(...nodeFrames.map((frame) => frame.minX));
  const minY = Math.min(...nodeFrames.map((frame) => frame.minY));
  const maxX = Math.max(...nodeFrames.map((frame) => frame.maxX));
  const maxY = Math.max(...nodeFrames.map((frame) => frame.maxY));
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);
  const scale = Math.min(
    (PREVIEW_WIDTH - PREVIEW_PADDING * 2) / boundsWidth,
    (PREVIEW_HEIGHT - PREVIEW_PADDING * 2) / boundsHeight
  );
  const fittedWidth = boundsWidth * scale;
  const fittedHeight = boundsHeight * scale;
  const offsetX = (PREVIEW_WIDTH - fittedWidth) / 2;
  const offsetY = (PREVIEW_HEIGHT - fittedHeight) / 2;

  return nodeFrames.map((frame) => ({
    node: frame.node,
    width: frame.width * scale,
    height: frame.height * scale,
    centerX: offsetX + (frame.node.position.x - minX) * scale,
    centerY: offsetY + (frame.node.position.y - minY) * scale,
  }));
}

function getNodeSize(node: CanvasNode) {
  return {
    width:
      typeof node.width === "number" ? node.width : PREVIEW_NODE_FALLBACK_WIDTH,
    height:
      typeof node.height === "number"
        ? node.height
        : PREVIEW_NODE_FALLBACK_HEIGHT,
  };
}

function truncatePreviewLabel(label: string) {
  if (label.length <= 18) {
    return label;
  }

  return `${label.slice(0, 17)}...`;
}
