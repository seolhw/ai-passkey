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
    // 本地 dev 与生产均跑在 Cloudflare workerd 上，使用同一套 D1 绑定，
    // 本地 D1 数据由 wrangler 模拟（.wrangler/state/v3/d1/）。
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});

export default config;
