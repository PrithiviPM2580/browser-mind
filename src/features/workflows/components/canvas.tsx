"use client";

import {
  addEdge,
  type ColorMode,
  type Connection,
  ConnectionLineType,
  Controls,
  type Edge,
  type NodeTypes,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import type { StepNodeType } from "@/features/workflows/nodes/node-registry";
import { StepNode } from "./step-node";

import "@xyflow/react/dist/style.css";

const nodeTypes: NodeTypes = { step: StepNode };

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
  },
  {
    id: "open-url",
    type: "step",
    position: { x: 300, y: 0 },
    data: {
      type: "open-url",
      kind: "action",
      title: "Open URL",
      values: { url: "https://example.com" },
    },
  },
];

const initialEdges: Edge[] = [];

export const Canvas = () => {
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const color: ColorMode =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div className="size-full">
      {" "}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        color={color}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "var(--border)" }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "var(--border)" },
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-connectionline-stroke-width": 2,
          } as React.CSSProperties
        }
        maxZoom={1}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
};
