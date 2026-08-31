import { createFileRoute } from "@tanstack/react-router";
import { runFetchAll } from "#/lib/jd-fetcher";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/api/fetch-jobs")({
  server: {
    handlers: {
      POST: async () => {
        const user = await getSessionUser();
        if (!user) {
          return new Response(JSON.stringify({ error: "未登录" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        const results = await runFetchAll();
        return new Response(JSON.stringify(results), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
