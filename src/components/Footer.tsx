import { Link } from "@tanstack/react-router";
import { AI_COMPANIES } from "@/constants/models";
import BrandLogo from "./BrandLogo";

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
            <p className="m-0 flex items-center gap-2 text-sm font-bold tracking-tight text-(--sea-ink)">
              <BrandLogo className="size-8" />
              跨界简历
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-(--sea-ink-soft) no-underline transition hover:text-(--sea-ink)"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-(--line) pt-6 text-xs text-(--sea-ink-soft)">
          <p className="m-0">
            跨界简历 · 面向 {AI_COMPANIES.slice(0, 3).join("、")} 等国内 AI
            公司求职者的简历工作台
          </p>
          <p className="m-0 flex items-center gap-3">
            <span>&copy; {year} 北京明日创界科技有限公司</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-(--sea-ink)"
            >
              京ICP备2024067515号
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
