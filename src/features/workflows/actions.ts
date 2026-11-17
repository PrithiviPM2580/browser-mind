"use server";

import { auth } from "@clerk/nextjs/server";
import { runs, tasks } from "@trigger.dev/sdk";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { WorkflowGraph } from "@/db/schema";
import type { runWorkflowTask } from "@/features/workflows/tasks/run-workflow";
import { liveblocks } from "@/lib/liveblock";
import { createWorkflow, deleteWorkflow, saveWorkflowGraph } from "./data";

export const createWorkflowAction = async (name: string) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No active organization found");
  }

  const workflow = await createWorkflow(orgId, name);

  revalidatePath("/workflows", "layout");
  redirect(`/workflows/${workflow.id}`);
};

export const deleteWorkflowAction = async (workflowId: string) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No active organization found");
  }

  const workflow = await deleteWorkflow(orgId, workflowId);

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  await liveblocks.deleteRoom(workflowId);

  revalidatePath("/workflows", "layout");
  redirect("/");
};

export const runWorkflowAction = async ({
  workflowId,
  graph,
}: {
  workflowId: string;
  graph: WorkflowGraph;
}) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No active organization found");
  }

  await saveWorkflowGraph({ orgId, workflowId, graph });

  const handle = await tasks.trigger<typeof runWorkflowTask>(
    "run-workflow",
    { workflowId, orgId },
    { tags: [`workflow:${workflowId}`] },
  );

  return handle;
};

export const cancelWorkflowRunAction = async (runId: string) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No active organization found");
  }

  await runs.cancel(runId);
};
