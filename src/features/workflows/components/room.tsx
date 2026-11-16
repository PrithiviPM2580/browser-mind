"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { Spinner } from "@/components/ui/spinner";

interface RoomProps {
  roomId: string;
  children: React.ReactNode;
}

export function Room({ roomId, children }: RoomProps) {
  return (
    <LiveblocksProvider throttle={16} authEndpoint="/api/liveblocks/auth">
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <div className="min-h-svh flex items-center justify-center">
              <Spinner className="size-6 text-muted-foreground" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
