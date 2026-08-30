import handler from "@tanstack/react-start/server-entry";
import { runFetchAll } from "./lib/jd-fetcher";

export default {
	fetch: handler.fetch,
	/** Cron 定时抓取 AI 公司 JD（触发时间在 wrangler.jsonc 的 triggers.crons 配置） */
	async scheduled(event: ScheduledController) {
		const results = await runFetchAll();
		console.log(`[cron:${event.cron}] JD 抓取完成：${JSON.stringify(results)}`);
	},
};
