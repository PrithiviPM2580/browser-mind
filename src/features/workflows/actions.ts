"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { liveblocks } from "@/lib/liveblock";
import { createWorkflow, deleteWorkflow } from "./data";

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
