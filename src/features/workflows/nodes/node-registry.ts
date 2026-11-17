import type { Node } from "@xyflow/react";
import { GlobeIcon, type LucideIcon, MousePointerIcon } from "lucide-react";

export type StepNodeKind = "trigger" | "action";

export type NodeNames = "start" | "open-url";

export type NodeField = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
};

export type NodeDefinition = {
  type: NodeNames;
  kind: StepNodeKind;
  label: string;
  icon: LucideIcon;
  accent: string;
  fields: NodeField[];
};

export const nodeRegistry = {
  start: {
    type: "start",
    kind: "trigger",
    label: "Start",
    icon: MousePointerIcon,
    accent: "bg-blue-500 text-white",
    fields: [],
  },
  "open-url": {
    type: "open-url",
    kind: "action",
    label: "Open URL",
    icon: GlobeIcon,
    accent: "bg-emerald-500 text-white",
    fields: [
      {
        key: "url",
        label: "URL",
        placeholder: "https://example.com",
        required: true,
      },
    ],
  },
} satisfies Record<NodeNames, NodeDefinition>;

export type NodeType = keyof typeof nodeRegistry;

export type StepNodeData = {
  type: NodeType;
  kind: StepNodeKind;
  title: string;
  values: Record<string, string>;
};

export type StepNodeType = Node<StepNodeData, "step">;

export type ActionNodeType = {
  [K in NodeType]: (typeof nodeRegistry)[K]["kind"] extends "action"
    ? K
    : never;
}[NodeType];
