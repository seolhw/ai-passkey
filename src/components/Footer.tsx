import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/resumes", label: "我的简历" },
  { to: "/companies", label: "招聘简章" },
  { to: "/library", label: "简历大厅" },
  { to: "/advisor", label: "AI 顾问" },
  { to: "/about", label: "关于" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer mt-20 px-4 pb-12 pt-10">
      <div className="page-wrap">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="m-0 flex items-center gap-2 text-sm font-bold tracking-tight text-[var(--sea-ink)]">
              <span className="btn-gradient flex size-6 items-center justify-center rounded-md">
                <Sparkles className="size-3.5" />
              </span>
              跨界简历
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              给 AI 求职者的简历工作台：上传简历，AI 按目标岗位 JD
              逐条打磨，版本管理随时回滚。
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="m-0 mt-8 border-t border-[var(--line)] pt-6 text-xs text-[var(--sea-ink-soft)]">
          &copy; {year} 跨界简历 · 面向字节 / OpenAI / Anthropic / DeepSeek
          求职者
        </p>
      </div>
    </footer>
  );
}
