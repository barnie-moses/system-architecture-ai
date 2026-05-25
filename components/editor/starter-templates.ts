import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_ORIGIN,
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

export type CanvasTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
};

function colorId(id: CanvasNodeColorId): CanvasNodeColorId {
  return NODE_COLORS.some((color) => color.id === id)
    ? id
    : DEFAULT_NODE_COLOR.id;
}

function templateNode({
  color,
  id,
  label,
  shape,
  x,
  y,
}: {
  color: CanvasNodeColorId;
  id: string;
  label: string;
  shape: CanvasNodeShape;
  x: number;
  y: number;
}): CanvasNode {
  const size = CANVAS_SHAPE_DEFAULT_SIZES[shape];

  return {
    id,
    type: CANVAS_NODE_TYPE,
    origin: CANVAS_NODE_ORIGIN,
    position: {
      x,
      y,
    },
    width: size.width,
    height: size.height,
    initialWidth: size.width,
    initialHeight: size.height,
    style: {
      width: size.width,
      height: size.height,
    },
    data: {
      label,
      color: colorId(color),
      shape,
    },
  };
}

function templateEdge({
  id,
  label = "",
  source,
  sourceHandle = "right",
  target,
  targetHandle = "left",
}: {
  id: string;
  label?: string;
  source: string;
  sourceHandle?: string;
  target: string;
  targetHandle?: string;
}): CanvasEdge {
  return {
    id,
    type: CANVAS_EDGE_TYPE,
    source,
    sourceHandle,
    target,
    targetHandle,
    data: {
      label,
    },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices-platform",
    name: "Microservices Platform",
    description:
      "A service-oriented web platform with an API gateway, isolated services, shared messaging, and independent data stores.",
    nodes: [
      templateNode({
        id: "client-app",
        label: "Client App",
        shape: "pill",
        color: "blue",
        x: 0,
        y: 0,
      }),
      templateNode({
        id: "api-gateway",
        label: "API Gateway",
        shape: "hexagon",
        color: "teal",
        x: 220,
        y: 0,
      }),
      templateNode({
        id: "auth-service",
        label: "Auth Service",
        shape: "rectangle",
        color: "purple",
        x: 440,
        y: -120,
      }),
      templateNode({
        id: "orders-service",
        label: "Orders Service",
        shape: "rectangle",
        color: "orange",
        x: 440,
        y: 0,
      }),
      templateNode({
        id: "billing-service",
        label: "Billing Service",
        shape: "rectangle",
        color: "pink",
        x: 440,
        y: 120,
      }),
      templateNode({
        id: "event-bus",
        label: "Event Bus",
        shape: "diamond",
        color: "green",
        x: 650,
        y: 0,
      }),
      templateNode({
        id: "service-db",
        label: "Service DBs",
        shape: "cylinder",
        color: "neutral",
        x: 650,
        y: 160,
      }),
    ],
    edges: [
      templateEdge({
        id: "client-to-gateway",
        source: "client-app",
        target: "api-gateway",
      }),
      templateEdge({
        id: "gateway-to-auth",
        source: "api-gateway",
        sourceHandle: "top",
        target: "auth-service",
      }),
      templateEdge({
        id: "gateway-to-orders",
        source: "api-gateway",
        target: "orders-service",
      }),
      templateEdge({
        id: "gateway-to-billing",
        source: "api-gateway",
        sourceHandle: "bottom",
        target: "billing-service",
      }),
      templateEdge({
        id: "orders-to-bus",
        source: "orders-service",
        target: "event-bus",
      }),
      templateEdge({
        id: "billing-to-bus",
        source: "billing-service",
        target: "event-bus",
      }),
      templateEdge({
        id: "services-to-db",
        source: "orders-service",
        sourceHandle: "bottom",
        target: "service-db",
        targetHandle: "top",
      }),
    ],
  },
  {
    id: "ci-cd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "A delivery pipeline from source control through build, test, artifact publishing, deployment, and runtime monitoring.",
    nodes: [
      templateNode({
        id: "repo",
        label: "Git Repo",
        shape: "rectangle",
        color: "blue",
        x: 0,
        y: 0,
      }),
      templateNode({
        id: "ci-runner",
        label: "CI Runner",
        shape: "hexagon",
        color: "teal",
        x: 200,
        y: 0,
      }),
      templateNode({
        id: "test-suite",
        label: "Test Suite",
        shape: "diamond",
        color: "purple",
        x: 400,
        y: -100,
      }),
      templateNode({
        id: "build-step",
        label: "Build Image",
        shape: "rectangle",
        color: "orange",
        x: 400,
        y: 100,
      }),
      templateNode({
        id: "artifact-registry",
        label: "Artifact Registry",
        shape: "cylinder",
        color: "green",
        x: 610,
        y: 100,
      }),
      templateNode({
        id: "deploy",
        label: "Deploy",
        shape: "pill",
        color: "pink",
        x: 810,
        y: 0,
      }),
      templateNode({
        id: "production",
        label: "Production",
        shape: "rectangle",
        color: "red",
        x: 1010,
        y: 0,
      }),
      templateNode({
        id: "monitoring",
        label: "Monitoring",
        shape: "circle",
        color: "neutral",
        x: 1010,
        y: 150,
      }),
    ],
    edges: [
      templateEdge({
        id: "repo-to-ci",
        source: "repo",
        target: "ci-runner",
      }),
      templateEdge({
        id: "ci-to-tests",
        source: "ci-runner",
        sourceHandle: "top",
        target: "test-suite",
      }),
      templateEdge({
        id: "ci-to-build",
        source: "ci-runner",
        sourceHandle: "bottom",
        target: "build-step",
      }),
      templateEdge({
        id: "build-to-registry",
        source: "build-step",
        target: "artifact-registry",
      }),
      templateEdge({
        id: "registry-to-deploy",
        source: "artifact-registry",
        target: "deploy",
      }),
      templateEdge({
        id: "tests-to-deploy",
        source: "test-suite",
        target: "deploy",
      }),
      templateEdge({
        id: "deploy-to-prod",
        source: "deploy",
        target: "production",
      }),
      templateEdge({
        id: "prod-to-monitoring",
        source: "production",
        sourceHandle: "bottom",
        target: "monitoring",
        targetHandle: "top",
      }),
    ],
  },
  {
    id: "event-driven-system",
    name: "Event-Driven System",
    description:
      "A decoupled event architecture with producers, a broker, stream processing, consumers, projections, and notification fan-out.",
    nodes: [
      templateNode({
        id: "web-app",
        label: "Web App",
        shape: "pill",
        color: "blue",
        x: 0,
        y: -90,
      }),
      templateNode({
        id: "api",
        label: "Command API",
        shape: "hexagon",
        color: "teal",
        x: 220,
        y: -90,
      }),
      templateNode({
        id: "event-broker",
        label: "Event Broker",
        shape: "diamond",
        color: "orange",
        x: 460,
        y: 0,
      }),
      templateNode({
        id: "stream-worker",
        label: "Stream Worker",
        shape: "rectangle",
        color: "purple",
        x: 700,
        y: -120,
      }),
      templateNode({
        id: "notification-worker",
        label: "Notifications",
        shape: "rectangle",
        color: "pink",
        x: 700,
        y: 40,
      }),
      templateNode({
        id: "read-model",
        label: "Read Model",
        shape: "cylinder",
        color: "green",
        x: 930,
        y: -120,
      }),
      templateNode({
        id: "analytics",
        label: "Analytics",
        shape: "circle",
        color: "red",
        x: 930,
        y: 80,
      }),
    ],
    edges: [
      templateEdge({
        id: "web-to-api",
        source: "web-app",
        target: "api",
      }),
      templateEdge({
        id: "api-to-broker",
        source: "api",
        target: "event-broker",
      }),
      templateEdge({
        id: "broker-to-stream",
        source: "event-broker",
        sourceHandle: "top",
        target: "stream-worker",
      }),
      templateEdge({
        id: "broker-to-notifications",
        source: "event-broker",
        target: "notification-worker",
      }),
      templateEdge({
        id: "stream-to-read-model",
        source: "stream-worker",
        target: "read-model",
      }),
      templateEdge({
        id: "notifications-to-analytics",
        source: "notification-worker",
        target: "analytics",
      }),
      templateEdge({
        id: "broker-to-analytics",
        source: "event-broker",
        sourceHandle: "bottom",
        target: "analytics",
        targetHandle: "left",
      }),
    ],
  },
];
