"use client";

import { RotateCwIcon, TriangleAlertIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  return (
    <Empty className="min-h-svh border-none">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          {error.message || "We couldn't load this workflow. Please try again."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={reset}>
          <RotateCwIcon />
          Try Again
        </Button>
      </EmptyContent>
    </Empty>
  );
}
