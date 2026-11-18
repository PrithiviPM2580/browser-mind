import { Stagehand } from "@browserbasehq/stagehand";
import { logger, metadata, task } from "@trigger.dev/sdk";
import toposort from "toposort";
import { interpolate, type NodeOutputs } from "@/lib/interpolate";
import { getWorkflow } from "../data";
import { nodeExecutors } from "../nodes/node-executor";

export type RunStep = {
  nodeId: string;
  status: "pending" | "running" | "done" | "failed";
};

export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: { workflowId: string; orgId: string }) => {
    const workflow = await getWorkflow(orgId, workflowId);

    if (!workflow?.graph) {
      throw new Error("Workflow graph not found");
    }

    const { nodes, edges } = workflow.graph;

    const byId = new Map(nodes.map((n) => [n.id, n]));

    const connected = new Set(edges.flatMap((e) => [e.source, e.target]));

    const order = toposort
      .array(
        nodes.map((n) => n.id),
        edges.map((e) => [e.source, e.target]),
      )
      .filter((id) => connected.has(id));

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length });

    const steps: RunStep[] = order.map((nodeId) => ({
      nodeId,
      status: "pending",
    }));
    metadata.set("steps", steps);

    let stagehand: Stagehand | undefined;
    const getStagehand = async () => {
      if (stagehand) return stagehand;
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY!,
        model: "google/gemini-2.5-flash",
        disablePino: true,
      });
      await stagehand.init();
      return stagehand;
    };

    const outputs: NodeOutputs = {};

    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const step = steps[i];
      const node = byId.get(id)!;

      logger.log(`Running step: ${node?.data.title}`);
      const executor = nodeExecutors[node.data.type];
      if (!executor) continue;
      step.status = "running";
      metadata.set("steps", steps);
      await metadata.flush();
      const values = Object.fromEntries(
        Object.entries(node.data.values).map(([key, text]) => [
          key,
          interpolate({ text, outputs }),
        ]),
      );
      try {
        outputs[id] = await executor({ values, getStagehand });
      } catch (error) {
        step.status = "failed";
        metadata.set("steps", steps);
        await metadata.flush();
        await stagehand?.close();
        throw error;
      }

      step.status = "done";
      metadata.set("steps", steps);
    }
    await stagehand?.close();

    return { steps };
  },
});
