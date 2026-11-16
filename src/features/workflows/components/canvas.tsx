"use client";

import { Cursors, useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  type ColorMode,
  ConnectionLineType,
  Controls,
  type Edge,
  type NodeTypes,
  ReactFlow,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import type { StepNodeType } from "@/features/workflows/nodes/node-registry";
import { StepNode } from "./step-node";
import "@xyflow/react/dist/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-flow/styles.css";

const nodeTypes: NodeTypes = { step: StepNode };

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
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

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    });

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDelete={onDelete}
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
        <Cursors />
      </ReactFlow>
    </div>
  );
};
