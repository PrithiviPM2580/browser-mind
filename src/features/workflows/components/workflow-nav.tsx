"use client";

import { PlusIcon, WorkflowIcon } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { WORKFLOWS } from "@/lib/constants";

export const WorkflowNav = () => {
  const { state } = useSidebar();
  const [activeWorkflow, setActiveWorkflow] = useState<string>(WORKFLOWS[0]);

  const workflowItems = WORKFLOWS.map((workflow) => (
    <SidebarMenuItem key={workflow}>
      <SidebarMenuButton
        isActive={workflow === activeWorkflow}
        onClick={() => setActiveWorkflow(workflow)}
      >
        <span>{workflow}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));

  if (state === "collapsed") {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger
                  render={
                    <SidebarMenuButton tooltip="Workflows">
                      <WorkflowIcon />
                      <span>Workflows</span>
                    </SidebarMenuButton>
                  }
                />
                <PopoverContent side="right" align="start" className="p-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <PlusIcon />
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator className="mx-0" />
                  <SidebarMenu className="gap-y-0.5">
                    {workflowItems}
                  </SidebarMenu>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction title="New workflow">
        <PlusIcon />
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">{workflowItems}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
