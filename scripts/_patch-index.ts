import { readFileSync, writeFileSync } from "node:fs";
const path = "D:/ai-passkey/src/routes/index.tsx";
let c = readFileSync(path, "utf8");

// 把「开始修改简历」主 CTA 改为进入 /console
const oldBlock = `<Link
            to="/console/resumes/new"
            className="btn-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold no-underline"
          >
            开始修改简历`;
const newBlock = `<Link
            to="/console"
            className="btn-gradient inline-flex h-11 items-center gap-2 rounded-lg px-6 text-sm font-semibold no-underline"
          >
            开始修改简历`;
if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  console.log("start-cta.patched -> /console");
} else {
  console.log("start-cta.NOT.FOUND");
}

writeFileSync(path, c, "utf8");
console.log("done");
