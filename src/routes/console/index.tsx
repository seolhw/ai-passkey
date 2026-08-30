import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/console/")({
  loader: () => {
    throw redirect({ to: "/console/resumes" });
  },
  component: () => null,
});
