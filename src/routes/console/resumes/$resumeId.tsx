import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/resumes/$resumeId")({
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  component: () => <Outlet />,
});
