import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workflows } from "@/db/schema";

export const listWorkflows = async (orgId: string) => {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt));
};

export const createWorkflow = async (orgId: string, name: string) => {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name })
    .returning();

  return workflow;
};
