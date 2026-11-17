import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workflows } from "@/db/schema";

export const listWorkflows = async (orgId: string) => {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt));
};

export const getWorkflow = async (orgId: string, workflowId: string) => {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.orgId, orgId), eq(workflows.id, workflowId)));

  return workflow;
};

export const createWorkflow = async (orgId: string, name: string) => {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name })
    .returning();

  return workflow;
};

export const deleteWorkflow = async (orgId: string, workflowId: string) => {
  const [workflow] = await db
    .delete(workflows)
    .where(and(eq(workflows.orgId, orgId), eq(workflows.id, workflowId)))
    .returning();

  return workflow;
};
