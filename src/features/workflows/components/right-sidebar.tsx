"use client";

import { useReactFlow, useStore } from "@xyflow/react";
import { MoreHorizontalIcon, PlayIcon, Trash2Icon } from "lucide-react";
import { useState, useTransition } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResizablePanel } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  type NodeField,
  type NodeType,
  nodeRegistry,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry";
import { cn } from "@/lib/utils";
import { deleteWorkflowAction, runWorkflowAction } from "../actions";
import { validateGraph } from "../validate-graph";

interface NodeIconProps {
  type: NodeType;
  className?: string;
}

export const NodeIcon = ({ type, className }: NodeIconProps) => {
  const def = nodeRegistry[type];
  const Icon = def.icon;
  return (
    <span
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-md",
        def.accent,
        className,
      )}
    >
      <Icon className="size-3.5" />
    </span>
  );
};

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Section = ({ title, icon, children }: SectionProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

interface FieldProps {
  field: NodeField;
  value: string;
  onChange: (value: string) => void;
}

export const Field = ({ field, value, onChange }: FieldProps) => {
  if (field.multiline) {
    return (
      <Textarea
        id={field.key}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <Input
      id={field.key}
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

interface InspectorProps {
  node: StepNodeType | undefined;
}

export const Inspector = ({ node }: InspectorProps) => {
  const { updateNodeData } = useReactFlow<StepNodeType>();

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground ">No Node Selected</p>
      </Section>
    );
  }

  const { type, title, values } = node.data;
  const def = nodeRegistry[type];

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {def.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties</p>
        ) : (
          def.fields.map((field) => (
            <div className="flex flex-col gap-1.5" key={field.key}>
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>
              <Field
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  updateNodeData(node.id, {
                    values: { ...values, [field.key]: value },
                  });
                }}
              />
            </div>
          ))
        )}
      </div>
    </Section>
  );
};

const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
];

const definations = Object.values(nodeRegistry);

export const Palette = () => {
  const { getNodes, getViewport, addNodes } = useReactFlow<StepNodeType>();

  const width = useStore((s) => s.width);
  const height = useStore((s) => s.height);

  const add = (type: NodeType) => {
    const def = nodeRegistry[type];
    const nodes = getNodes();

    if (
      def.kind === "trigger" &&
      nodes.some((n) => n.data.kind === "trigger")
    ) {
      toast.add({
        type: "error",
        title: "Trigger already exists",
        description: "Only one trigger node is allowed in a workflow",
      });
      return;
    }

    const count = nodes.filter((n) => n.data.type === type).length;
    const title = `${def.label} ${count + 1}`;

    const { x, y, zoom } = getViewport();
    const position = {
      x: (width / 2 - x) / zoom,
      y: (height / 2 - y) / zoom,
    };

    addNodes({
      id: crypto.randomUUID(),
      type: "step",
      position,
      data: { type, kind: def.kind, title, values: {} },
    });
  };

  return (
    <Section title="Toolbar">
      <Accordion
        defaultValue={sections.map((s) => s.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem
            key={section.kind}
            value={section.label}
            className="not-last:border-b-0"
          >
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definations
                .filter((def) => def.kind === section.kind)
                .map((def) => (
                  <Button
                    key={def.type}
                    variant="ghost"
                    onClick={() => add(def.type)}
                    className="justify-start gap-2.5 px-1.5 text-xs"
                  >
                    <NodeIcon type={def.type} />
                    {def.label}
                  </Button>
                ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
};

const ActionsMenu = ({ workflowId }: { workflowId: string }) => {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon" variant="ghost">
            <MoreHorizontalIcon />
          </Button>
        }
      />

      <DropdownMenuContent align="start" className="min-w-48">
        <DropdownMenuItem
          variant="destructive"
          className="text-xs [&_svg:not([class*='size-'])]:size-3.5"
          disabled={isPending}
          onSelect={(e) => {
            e.preventDefault();
            startTransition(async () => {
              await deleteWorkflowAction(workflowId);
            });
          }}
        >
          <Trash2Icon />
          Delete workflow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RunButton = ({ workflowId }: { workflowId: string }) => {
  const { getNodes, getEdges } = useReactFlow<StepNodeType>();
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={isPending}
      onClick={() => {
        const graph = { nodes: getNodes(), edges: getEdges() };
        const problems = validateGraph(graph);
        if (problems.length > 0) {
          toast.add({
            type: "error",
            title: "Workflow graph is invalid",
            description: problems.join(" "),
          });
          return;
        }

        startTransition(async () => {
          await runWorkflowAction({ workflowId, graph });
        });
      }}
    >
      <PlayIcon fill="primary" />
      Run
    </Button>
  );
};

export const RightSidebar = ({ workflowId }: { workflowId: string }) => {
  const [tab, setTab] = useState("toolbar");

  const selected = useStore((s) => s.nodes.find((n) => n.selected)) as
    | StepNodeType
    | undefined;

  const [prevSelected, setPrevSelected] = useState(selected?.id);
  if (selected && selected.id !== prevSelected) {
    setPrevSelected(selected.id);
    setTab("editor");
  }

  return (
    <ResizablePanel
      className="bg-background"
      defaultSize="16rem"
      minSize="14rem"
      maxSize="36rem"
      groupResizeBehavior="preserve-pixel-size"
    >
      <Tabs value={tab} onValueChange={setTab} className="size-full gap-0">
        <div className="flex items-center justify-between border-b border-border p-2">
          <ActionsMenu workflowId={workflowId} />
          <RunButton workflowId={workflowId} />
        </div>
        <TabsList className="m-2 w-fit bg-background">
          <TabsTrigger
            value="toolbar"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Toolbar
          </TabsTrigger>
          <TabsTrigger
            value="editor"
            className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
          >
            Editor
          </TabsTrigger>
        </TabsList>
        <TabsContent value="toolbar" className="flex min-h-0 flex-col">
          <Palette />
        </TabsContent>
        <TabsContent value="editor" className="flex min-h-0 flex-col">
          <Inspector node={selected} />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  );
};
