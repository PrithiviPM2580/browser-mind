import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

type UserInfo = Liveblocks["UserMeta"]["info"];

export async function POST(request: Request) {
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let userIds: unknown;
  try {
    ({ userIds } = await request.json());
  } catch {
    return new Response("Invalid request body", { status: 400 });
  }

  if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "string")) {
    return new Response("Invalid userIds", { status: 400 });
  }

  const ids = userIds as string[];
  if (ids.length === 0) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    userId: ids,
    organizationId: [orgId],
    limit: ids.length,
  });

  const useById = new Map(users.map((user) => [user.id, user]));

  const resolved: (UserInfo | null)[] = ids.map((id) => {
    const user = useById.get(id);
    if (!user) {
      return null;
    }

    return {
      name:
        user.fullName ??
        user.username ??
        user.primaryEmailAddress?.emailAddress ??
        "Anonymous",
      avatar: user.imageUrl,
    };
  });

  return new Response(JSON.stringify(resolved), { status: 200 });
}
