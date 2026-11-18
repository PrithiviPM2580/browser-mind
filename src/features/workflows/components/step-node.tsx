import { Handle, type NodeProps, Position } from "@xyflow/react";
import { memo } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry";
import { cn } from "@/lib/utils";
import { useLatestRunSteps } from "./workflow-runs-provider";

const StepNodeComponent = ({ id, data, selected }: NodeProps<StepNodeType>) => {
  const { kind, type, title, values } = data;
  const def = nodeRegistry[type];
  const Icon = def.icon;
  const fields = def.fields.filter((field) => values[field.key]);

  const { steps, isLive } = useLatestRunSteps();
  const status = steps.find((step) => step.nodeId === id)?.status;
  const isRunning = status === "running" && isLive;
  const isFailed = status === "failed";

  const hasTarget = kind !== "trigger";
  return (
    <div
      className={cn(
        "min-w-50 max-w-80 rounded-(--radius) border-2 border-border bg-card text-card-foreground",
        isRunning && "border-blue-500",
        isFailed && "border-red-500",
        selected && "ring-2 ring-ring ring-offset-2 ring-offset-background",
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-100%,-50%)" }}
          className="h-3.5! w-1.5! min-w-0! rounded-l-xs! rounded-r-none! border-0! bg-border!"
        />
      )}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            def.accent,
          )}
        >
          {isRunning ? (
            <Spinner className="size-4" />
          ) : (
            <Icon className="size-4" />
          )}
        </div>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      {fields.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div className="flex flex-col gap-1.5 px-3 py-2.5">
            {fields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span className="shrink-0 text-muted-foreground">
                  {field.label}
                </span>
                <span className="truncate font-medium">
                  {values[field.key]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(100%,-50%)" }}
        className="h-3.5! w-1.5! min-w-0! rounded-l-none! rounded-r-xs! border-0! bg-border!"
      />
    </div>
  );
};

export const StepNode = memo(StepNodeComponent);
