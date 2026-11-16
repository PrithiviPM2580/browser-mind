"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createWorkflow } from "./data";

export const createWorkflowAction = async (name: string) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new Error("No active organization found");
  }

  const workflow = await createWorkflow(orgId, name);

  revalidatePath("/workflows", "layout");
  redirect(`/workflows/${workflow.id}`);
};
