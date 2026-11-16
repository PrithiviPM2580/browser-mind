import { TaskChooseOrganization } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <TaskChooseOrganization redirectUrlComplete="/" />
    </Suspense>
  );
}
