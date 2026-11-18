import { getIncomers, useStore } from "@xyflow/react";
import { useMemo } from "react";

import {
  type NodeType,
  nodeRegistry,
  type StepNodeType,
} from "../nodes/node-registry";

export type UpstreamConnection = {
  token: string;
  label: string;
  nodeType: NodeType;
};

export const useUpstreamConnections = (): UpstreamConnection[] => {
  const nodes = useStore((s) => s.nodes) as StepNodeType[];
  const edges = useStore((s) => s.edges);
  const selected = nodes.find((n) => n.selected);

  return useMemo(() => {
    if (!selected) return [];

    // Breadth-first walk up the incoming edges, collecting every ancestor once.
    // Nearest ancestors come first, which reads well in a picker.
    const ancestors: StepNodeType[] = [];
    const seen = new Set<string>();
    const queue: StepNodeType[] = [selected];

    while (queue.length) {
      const current = queue.shift()!;
      for (const incomer of getIncomers(
        current,
        nodes,
        edges,
      ) as StepNodeType[]) {
        if (seen.has(incomer.id)) continue;
        seen.add(incomer.id);
        ancestors.push(incomer);
        queue.push(incomer);
      }
    }

    return ancestors.flatMap((node) =>
      nodeRegistry[node.data.type].outputs.map((output) => ({
        token: `{{ ${node.id}.${output.path} }}`,
        label: `${node.data.title} · ${output.label}`,
        nodeType: node.data.type,
      })),
    );
  }, [selected, nodes, edges]);
};
