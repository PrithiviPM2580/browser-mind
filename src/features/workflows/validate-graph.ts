import toposort from "toposort";

import type { WorkflowGraph } from "@/db/schema";

export const validateGraph = ({ nodes, edges }: WorkflowGraph): string[] => {
  const problems: string[] = [];

  const triggers = nodes.filter((n) => n.data.kind === "trigger").length;

  if (triggers !== 1) {
    problems.push(
      `A workflow must have exactly one trigger node. Found ${triggers}.`,
    );
  }

  if (edges.length === 0) {
    problems.push("A workflow must have at least one edge.");
  } else {
    try {
      toposort(edges.map((e) => [e.source, e.target]));
    } catch {
      problems.push(
        "Workflow graph has a cycle. Please remove cycles to continue.",
      );
    }
  }

  return problems;
};
