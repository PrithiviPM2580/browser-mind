import { SearchXIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
  return (
    <Empty className="min-h-svh border-none">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Workflow not found</EmptyTitle>
        <EmptyDescription>
          The workflow you are looking for does not exist or has been deleted.
        </EmptyDescription>
        <EmptyContent>
          <Button render={<Link href="/">Go back to workflows</Link>} />
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
