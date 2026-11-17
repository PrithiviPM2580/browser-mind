import { auth } from "@clerk/nextjs/server";
import { ReactFlowProvider } from "@xyflow/react";
import { notFound } from "next/navigation";
import { Room } from "@/features/workflows/components/room";
import { WorkflowShell } from "@/features/workflows/components/workflow-shell";
import { getWorkflow } from "@/features/workflows/data";
import { liveblocks } from "@/lib/liveblock";

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { workflowId } = await params;
  const { orgId } = await auth();
  if (!orgId) notFound();

  const workflow = await getWorkflow(orgId, workflowId);
  if (!workflow) notFound();

  await liveblocks.getOrCreateRoom(workflowId, {
    organizationId: orgId,
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    metadata: {
      title: workflow.name,
    },
  });

  return (
    <Room roomId={workflowId}>
      <ReactFlowProvider>
        <WorkflowShell workflowId={workflowId} />
      </ReactFlowProvider>
    </Room>
  );
}
