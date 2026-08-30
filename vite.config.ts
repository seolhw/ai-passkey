import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	build: {
		// 最大应用 chunk（advisor 660KB / gzip 193KB）为聊天功能核心且已路由级懒加载，
		// 故将阈值从默认 500 调整到 700 避免误报。
		chunkSizeWarningLimit: 700,
	},
	plugins: [
		devtools(),
		// 本地 dev 使用 Node SSR（better-sqlite3 原生模块无法在 workerd 中加载），
		// 生产构建才接入 Cloudflare workerd。
		...(process.env.NODE_ENV === "production"
			? [cloudflare({ viteEnvironment: { name: "ssr" } })]
			: []),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
	],
});

export default config;
