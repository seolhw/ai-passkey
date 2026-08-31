import handler from "@tanstack/react-start/server-entry";
import { runFetchAll } from "./lib/jd-fetcher";

export default {
  /** 临时开发路由：/api/dev/fetch-all 后台触发抓取（验证完成后移除） */
  fetch: handler.fetch,
  /** Cron 定时抓取 AI 公司 JD（触发时间在 wrangler.jsonc 的 triggers.crons 配置） */
  async scheduled(event: ScheduledController, _env: Env, ctx: ExecutionContext) {
    // waitUntil 后台执行，请求立即返回，避免 cron 端点同步阻塞挂起
    ctx.waitUntil(
      runFetchAll().then((results) => {
        console.log(
          `[cron:${event.cron}] JD 抓取完成：${JSON.stringify(results)}`,
        );
      }),
    );
  },
};
