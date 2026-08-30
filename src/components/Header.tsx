import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

const NAV_LINKS = [
  { to: "/resumes", label: "我的简历" },
  { to: "/companies", label: "招聘简章" },
  { to: "/library", label: "简历大厅" },
  { to: "/advisor", label: "AI 顾问" },
] as const;

export default function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) backdrop-blur-xl">
      <nav className="page-wrap flex h-14 items-center gap-6">
        <h2 className="m-0 shrink-0">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <BrandLogo className="size-8" />
            <span className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-(--sea-ink)">
                跨界简历
              </span>
              <span className="mt-0.5 text-[10px] font-medium tracking-wide text-(--sea-ink-soft)">
                AI 求职工作台
              </span>
            </span>
          </Link>
        </h2>

        <div className="hidden items-center gap-1 text-sm sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md px-3 py-1.5 text-(--sea-ink-soft) no-underline transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
              activeProps={{ className: "nav-link is-active" }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-(--line)" />
          ) : session?.user ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-(--sea-ink-soft) sm:block">
                {session.user.name || session.user.email}
              </span>
              <button
                type="button"
                onClick={() => {
                  void authClient.signOut().then(() => {
                    window.location.href = "/";
                  });
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--line) bg-transparent px-2.5 text-xs font-medium text-(--sea-ink-soft) transition hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
                title="退出登录"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground no-underline transition hover:bg-primary/90"
            >
              登录
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
