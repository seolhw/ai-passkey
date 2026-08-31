import { createServerFn } from "@tanstack/react-start";
import { env } from "#/env";
import { auth } from "#/lib/auth";

/** 服务端获取当前登录用户 session */
export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getRequest } = await import("@tanstack/react-start/server");
    const request = getRequest();
    return await auth.api.getSession({ headers: request.headers });
  },
);

/** 服务端获取当前登录用户，未登录返回 null */
export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession();
    return session?.user ?? null;
  },
);

/** GitHub 社交登录是否已配置（未配置时前端隐藏 GitHub 按钮） */
export const isGithubEnabled = createServerFn({ method: "GET" }).handler(
  async () => Boolean(env.GITHUB_CLIENT_ID),
);
