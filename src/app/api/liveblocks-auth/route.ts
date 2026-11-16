import { auth, currentUser } from "@clerk/nextjs/server";
import { liveblocks } from "@/lib/liveblock";

export async function POST() {
  const { orgId, userId } = await auth();

  if (!orgId || !userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const user = await currentUser();

  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const { status, body } = await liveblocks.identifyUser(
    {
      userId,
      groupIds: [orgId],
      organizationId: orgId,
    },
    {
      userInfo: {
        name:
          user.fullName ??
          user.username ??
          user.emailAddresses[0]?.emailAddress ??
          "Anonymous",
        avatar: user.imageUrl,
      },
    },
  );

  return new Response(body, { status });
}
