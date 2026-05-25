import { Position, getSmoothStepPath } from "@xyflow/react";

import {
  CANVAS_NODE_ORIGIN,
  CANVAS_SHAPE_DEFAULT_SIZES,
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
} from "@/types/canvas";
import type { CanvasEdge, CanvasNode, CanvasNodeShape } from "@/types/canvas";

export type CanvasExportFormat = "png" | "pdf";

export type CanvasExportResult =
  | {
      status: "downloaded";
    }
  | {
      status: "empty";
    };

type CanvasExportOptions = {
  edges: CanvasEdge[];
  format: CanvasExportFormat;
  nodes: CanvasNode[];
  projectName: string;
};

type ExportTheme = {
  background: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
};

type NodeRect = {
  bottom: number;
  centerX: number;
  centerY: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

type DiagramSvg = {
  height: number;
  svg: string;
  width: number;
};

type RasterizedDiagram = {
  dataUrl: string;
  height: number;
  width: number;
};

const EXPORT_PADDING = 56;
const EXPORT_NODE_BORDER_WIDTH = 1.5;
const EXPORT_EDGE_STROKE_WIDTH = 2.25;
const EXPORT_MAX_RASTER_DIMENSION = 8192;
const EXPORT_DEFAULT_PDF_WIDTH = 841.89;
const EXPORT_DEFAULT_PDF_HEIGHT = 595.28;
const EXPORT_PDF_PADDING = 36;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export async function exportCanvasDiagram({
  edges,
  format,
  nodes,
  projectName,
}: CanvasExportOptions): Promise<CanvasExportResult> {
  const visibleNodes = nodes.filter((node) => !node.hidden);

  if (visibleNodes.length === 0) {
    return {
      status: "empty",
    };
  }

  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = edges.filter(
    (edge) =>
      !edge.hidden &&
      visibleNodeIds.has(edge.source) &&
      visibleNodeIds.has(edge.target)
  );
  const diagram = buildDiagramSvg({
    edges: visibleEdges,
    nodes: visibleNodes,
    theme: readExportTheme(),
  });
  const filenameBase = createCanvasExportFilename(projectName);

  if (format === "png") {
    const pngImage = await rasterizeSvg(diagram, "image/png");

    downloadDataUrl(pngImage.dataUrl, `${filenameBase}.png`);

    return {
      status: "downloaded",
    };
  }

  const jpegImage = await rasterizeSvg(diagram, "image/jpeg", 0.95);
  const pdfBytes = createPdfWithJpeg({
    imageBytes: dataUrlToBytes(jpegImage.dataUrl),
    imageHeight: jpegImage.height,
    imageWidth: jpegImage.width,
  });

  downloadBlob(
    new Blob([pdfBytes], { type: "application/pdf" }),
    `${filenameBase}.pdf`
  );

  return {
    status: "downloaded",
  };
}

function buildDiagramSvg({
  edges,
  nodes,
  theme,
}: {
  edges: CanvasEdge[];
  nodes: CanvasNode[];
  theme: ExportTheme;
}): DiagramSvg {
  const nodeRects = new Map(nodes.map((node) => [node.id, getNodeRect(node)]));
  const bounds = getDiagramBounds([...nodeRects.values()]);
  const viewBoxX = bounds.left - EXPORT_PADDING;
  const viewBoxY = bounds.top - EXPORT_PADDING;
  const width = Math.max(1, bounds.right - bounds.left + EXPORT_PADDING * 2);
  const height = Math.max(1, bounds.bottom - bounds.top + EXPORT_PADDING * 2);
  const edgeMarkup = edges
    .map((edge) => renderEdge({ edge, nodeRects, theme }))
    .filter(Boolean)
    .join("");
  const nodeMarkup = nodes
    .map((node) => renderNode({ node, rect: nodeRects.get(node.id), theme }))
    .join("");
  const svg = `<svg xmlns="${SVG_NAMESPACE}" width="${width}" height="${height}" viewBox="${viewBoxX} ${viewBoxY} ${width} ${height}">
<defs>
<marker id="canvas-export-arrow" markerHeight="18" markerUnits="userSpaceOnUse" markerWidth="18" orient="auto" refX="16" refY="9">
<path d="M 4 3 L 16 9 L 4 15 Z" fill="${escapeAttribute(theme.textSecondary)}"/>
</marker>
</defs>
<rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="${escapeAttribute(theme.background)}"/>
<g>${edgeMarkup}</g>
<g>${nodeMarkup}</g>
</svg>`;

  return {
    height,
    svg,
    width,
  };
}

function renderNode({
  node,
  rect,
  theme,
}: {
  node: CanvasNode;
  rect: NodeRect | undefined;
  theme: ExportTheme;
}) {
  if (!rect) {
    return "";
  }

  const nodeColor =
    NODE_COLORS.find((color) => color.id === node.data.color) ??
    DEFAULT_NODE_COLOR;
  const label = node.data.label.trim().length > 0 ? node.data.label : "Label";
  const labelOpacity = node.data.label.trim().length > 0 ? 1 : 0.55;
  const shape = renderNodeShape({
    fill: nodeColor.fill,
    rect,
    shape: node.data.shape,
    stroke: theme.border,
  });
  const textClipId = `canvas-export-node-label-${sanitizeSvgId(node.id)}`;

  return `<g>
${shape}
<clipPath id="${textClipId}">
<rect x="${rect.left + 12}" y="${rect.top + 8}" width="${Math.max(1, rect.width - 24)}" height="${Math.max(1, rect.height - 16)}"/>
</clipPath>
<text clip-path="url(#${textClipId})" x="${rect.centerX}" y="${rect.centerY}" fill="${escapeAttribute(nodeColor.text)}" fill-opacity="${labelOpacity}" font-family="Arial, sans-serif" font-size="14" font-weight="500" dominant-baseline="middle" text-anchor="middle">${escapeText(label)}</text>
</g>`;
}

function renderNodeShape({
  fill,
  rect,
  shape,
  stroke,
}: {
  fill: string;
  rect: NodeRect;
  shape: CanvasNodeShape;
  stroke: string;
}) {
  const escapedFill = escapeAttribute(fill);
  const escapedStroke = escapeAttribute(stroke);

  if (shape === "rectangle") {
    return `<rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" rx="12" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}"/>`;
  }

  if (shape === "pill") {
    return `<rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" rx="${rect.height / 2}" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}"/>`;
  }

  if (shape === "circle") {
    return `<ellipse cx="${rect.centerX}" cy="${rect.centerY}" rx="${rect.width / 2}" ry="${rect.height / 2}" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}"/>`;
  }

  if (shape === "diamond") {
    return `<polygon points="${rect.centerX},${rect.top + 2} ${rect.right - 2},${rect.centerY} ${rect.centerX},${rect.bottom - 2} ${rect.left + 2},${rect.centerY}" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}" stroke-linejoin="round"/>`;
  }

  if (shape === "hexagon") {
    return `<polygon points="${rect.left + rect.width * 0.25},${rect.top + 3} ${rect.left + rect.width * 0.75},${rect.top + 3} ${rect.right - 2},${rect.centerY} ${rect.left + rect.width * 0.75},${rect.bottom - 3} ${rect.left + rect.width * 0.25},${rect.bottom - 3} ${rect.left + 2},${rect.centerY}" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}" stroke-linejoin="round"/>`;
  }

  return `<path d="M ${rect.left + rect.width * 0.08} ${rect.top + rect.height * 0.18} C ${rect.left + rect.width * 0.08} ${rect.top + rect.height * 0.08} ${rect.left + rect.width * 0.92} ${rect.top + rect.height * 0.08} ${rect.left + rect.width * 0.92} ${rect.top + rect.height * 0.18} L ${rect.left + rect.width * 0.92} ${rect.top + rect.height * 0.82} C ${rect.left + rect.width * 0.92} ${rect.top + rect.height * 0.92} ${rect.left + rect.width * 0.08} ${rect.top + rect.height * 0.92} ${rect.left + rect.width * 0.08} ${rect.top + rect.height * 0.82} Z" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}" stroke-linejoin="round"/>
<ellipse cx="${rect.centerX}" cy="${rect.top + rect.height * 0.18}" rx="${rect.width * 0.42}" ry="${rect.height * 0.1}" fill="${escapedFill}" stroke="${escapedStroke}" stroke-width="${EXPORT_NODE_BORDER_WIDTH}"/>`;
}

function renderEdge({
  edge,
  nodeRects,
  theme,
}: {
  edge: CanvasEdge;
  nodeRects: Map<string, NodeRect>;
  theme: ExportTheme;
}) {
  const sourceRect = nodeRects.get(edge.source);
  const targetRect = nodeRects.get(edge.target);

  if (!sourceRect || !targetRect) {
    return "";
  }

  const sourceEndpoint = getEdgeEndpoint(sourceRect, edge.sourceHandle, targetRect);
  const targetEndpoint = getEdgeEndpoint(targetRect, edge.targetHandle, sourceRect);
  const [path, labelX, labelY] = getSmoothStepPath({
    sourcePosition: sourceEndpoint.position,
    sourceX: sourceEndpoint.x,
    sourceY: sourceEndpoint.y,
    targetPosition: targetEndpoint.position,
    targetX: targetEndpoint.x,
    targetY: targetEndpoint.y,
    borderRadius: 6,
    offset: 24,
  });
  const label = edge.data?.label?.trim() ?? "";
  const labelMarkup =
    label.length > 0
      ? `<g>
<rect x="${labelX - getEdgeLabelWidth(label) / 2}" y="${labelY - 12}" width="${getEdgeLabelWidth(label)}" height="24" rx="12" fill="${escapeAttribute(theme.background)}" stroke="${escapeAttribute(theme.border)}" stroke-width="1"/>
<text x="${labelX}" y="${labelY}" fill="${escapeAttribute(theme.textPrimary)}" font-family="Arial, sans-serif" font-size="12" font-weight="500" dominant-baseline="middle" text-anchor="middle">${escapeText(label)}</text>
</g>`
      : "";

  return `<g>
<path d="${escapeAttribute(path)}" fill="none" marker-end="url(#canvas-export-arrow)" stroke="${escapeAttribute(theme.textSecondary)}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.65" stroke-width="${EXPORT_EDGE_STROKE_WIDTH}"/>
${labelMarkup}
</g>`;
}

function getNodeRect(node: CanvasNode): NodeRect {
  const width =
    normalizeSize(node.measured?.width) ??
    normalizeSize(node.width) ??
    normalizeSize(node.initialWidth) ??
    normalizeSize(node.style?.width) ??
    CANVAS_SHAPE_DEFAULT_SIZES[node.data.shape].width;
  const height =
    normalizeSize(node.measured?.height) ??
    normalizeSize(node.height) ??
    normalizeSize(node.initialHeight) ??
    normalizeSize(node.style?.height) ??
    CANVAS_SHAPE_DEFAULT_SIZES[node.data.shape].height;
  const origin = node.origin ?? CANVAS_NODE_ORIGIN;
  const left = node.position.x - width * origin[0];
  const top = node.position.y - height * origin[1];

  return {
    bottom: top + height,
    centerX: left + width / 2,
    centerY: top + height / 2,
    height,
    left,
    right: left + width,
    top,
    width,
  };
}

function getDiagramBounds(rects: NodeRect[]) {
  return rects.reduce(
    (bounds, rect) => ({
      bottom: Math.max(bounds.bottom, rect.bottom),
      left: Math.min(bounds.left, rect.left),
      right: Math.max(bounds.right, rect.right),
      top: Math.min(bounds.top, rect.top),
    }),
    {
      bottom: Number.NEGATIVE_INFINITY,
      left: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
    }
  );
}

function getEdgeEndpoint(
  rect: NodeRect,
  handleId: string | null | undefined,
  oppositeRect: NodeRect
) {
  const resolvedHandle = resolveHandleId(handleId, rect, oppositeRect);

  if (resolvedHandle === "top") {
    return {
      position: Position.Top,
      x: rect.centerX,
      y: rect.top,
    };
  }

  if (resolvedHandle === "right") {
    return {
      position: Position.Right,
      x: rect.right,
      y: rect.centerY,
    };
  }

  if (resolvedHandle === "bottom") {
    return {
      position: Position.Bottom,
      x: rect.centerX,
      y: rect.bottom,
    };
  }

  return {
    position: Position.Left,
    x: rect.left,
    y: rect.centerY,
  };
}

function resolveHandleId(
  handleId: string | null | undefined,
  rect: NodeRect,
  oppositeRect: NodeRect
) {
  if (
    handleId === "top" ||
    handleId === "right" ||
    handleId === "bottom" ||
    handleId === "left"
  ) {
    return handleId;
  }

  const horizontalDistance = oppositeRect.centerX - rect.centerX;
  const verticalDistance = oppositeRect.centerY - rect.centerY;

  if (Math.abs(horizontalDistance) >= Math.abs(verticalDistance)) {
    return horizontalDistance >= 0 ? "right" : "left";
  }

  return verticalDistance >= 0 ? "bottom" : "top";
}

function getEdgeLabelWidth(label: string) {
  return Math.min(224, Math.max(40, label.length * 7 + 24));
}

function normalizeSize(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
}

function readExportTheme(): ExportTheme {
  const styles = window.getComputedStyle(document.documentElement);
  const readToken = (token: string, fallback: string) =>
    styles.getPropertyValue(token).trim() || fallback;

  return {
    background: readToken("--bg-base", "black"),
    border: readToken("--border-subtle", "currentColor"),
    textPrimary: readToken("--text-primary", "white"),
    textSecondary: readToken("--text-secondary", "white"),
  };
}

async function rasterizeSvg(
  diagram: DiagramSvg,
  mimeType: "image/jpeg" | "image/png",
  quality?: number
): Promise<RasterizedDiagram> {
  const image = await loadSvgImage(diagram.svg);
  const scale = getRasterScale(diagram.width, diagram.height);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas export is not available in this browser.");
  }

  canvas.width = Math.max(1, Math.round(diagram.width * scale));
  canvas.height = Math.max(1, Math.round(diagram.height * scale));
  context.scale(scale, scale);
  context.drawImage(image, 0, 0, diagram.width, diagram.height);

  return {
    dataUrl: canvas.toDataURL(mimeType, quality),
    height: canvas.height,
    width: canvas.width,
  };
}

function loadSvgImage(svg: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const blobUrl = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    );

    image.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("The canvas export image could not be created."));
    };
    image.src = blobUrl;
  });
}

function getRasterScale(width: number, height: number) {
  return Math.min(
    2,
    EXPORT_MAX_RASTER_DIMENSION / Math.max(width, 1),
    EXPORT_MAX_RASTER_DIMENSION / Math.max(height, 1)
  );
}

function createPdfWithJpeg({
  imageBytes,
  imageHeight,
  imageWidth,
}: {
  imageBytes: Uint8Array;
  imageHeight: number;
  imageWidth: number;
}) {
  const pageSize = getPdfPageSize({ imageHeight, imageWidth });
  const availableWidth = pageSize.width - EXPORT_PDF_PADDING * 2;
  const availableHeight = pageSize.height - EXPORT_PDF_PADDING * 2;
  const imageScale = Math.min(
    availableWidth / imageWidth,
    availableHeight / imageHeight
  );
  const drawWidth = imageWidth * imageScale;
  const drawHeight = imageHeight * imageScale;
  const drawX = (pageSize.width - drawWidth) / 2;
  const drawY = (pageSize.height - drawHeight) / 2;
  const content = `q
${formatPdfNumber(drawWidth)} 0 0 ${formatPdfNumber(drawHeight)} ${formatPdfNumber(drawX)} ${formatPdfNumber(drawY)} cm
/Im0 Do
Q`;
  const objects = [
    encodeAscii("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
    encodeAscii(
      "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    ),
    encodeAscii(
      `3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageSize.width)} ${formatPdfNumber(pageSize.height)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>
endobj
`
    ),
    joinBytes([
      encodeAscii(
        `4 0 obj
<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>
stream
`
      ),
      imageBytes,
      encodeAscii("\nendstream\nendobj\n"),
    ]),
    encodeAscii(
      `5 0 obj
<< /Length ${content.length} >>
stream
${content}
endstream
endobj
`
    ),
  ];
  const header = encodeAscii("%PDF-1.4\n");
  const offsets = [0];
  let offset = header.length;

  for (const object of objects) {
    offsets.push(offset);
    offset += object.length;
  }

  const xrefOffset = offset;
  const xref = encodeAscii(
    `xref
0 ${objects.length + 1}
0000000000 65535 f 
${offsets
  .slice(1)
  .map((objectOffset) => `${objectOffset.toString().padStart(10, "0")} 00000 n `)
  .join("\n")}
trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`
  );

  return joinBytes([header, ...objects, xref]);
}

function getPdfPageSize({
  imageHeight,
  imageWidth,
}: {
  imageHeight: number;
  imageWidth: number;
}) {
  const imageAspectRatio = imageWidth / Math.max(1, imageHeight);
  const contentHeightForFullWidth =
    (EXPORT_DEFAULT_PDF_WIDTH - EXPORT_PDF_PADDING * 2) /
      Math.max(imageAspectRatio, 0.1) +
    EXPORT_PDF_PADDING * 2;
  const height = clamp(
    contentHeightForFullWidth,
    EXPORT_DEFAULT_PDF_WIDTH / 2.6,
    EXPORT_DEFAULT_PDF_HEIGHT
  );

  return {
    height,
    width: EXPORT_DEFAULT_PDF_WIDTH,
  };
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",", 2)[1];

  if (!base64) {
    throw new Error("The exported image data is invalid.");
  }

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");

  link.href = dataUrl;
  link.download = filename;
  link.click();
}

function downloadBlob(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
}

function createCanvasExportFilename(projectName: string) {
  const safeProjectName = projectName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ");

  return `${safeProjectName || "canvas"}-canvas`;
}

function formatPdfNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function joinBytes(chunks: Uint8Array[]) {
  const totalLength = chunks.reduce((length, chunk) => length + chunk.length, 0);
  const bytes = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }

  return bytes;
}

function encodeAscii(value: string) {
  return new TextEncoder().encode(value);
}

function sanitizeSvgId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return escapeText(value).replace(/"/g, "&quot;");
}
