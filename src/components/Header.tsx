import { Link } from "@tanstack/react-router";
import { LayoutGrid, LogOut } from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { openAuthDialog } from "#/stores/auth-dialog";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";

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

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-(--line)" />
          ) : session?.user ? (
            <>
              <Link
                to="/console/resumes"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground no-underline transition hover:bg-primary/90"
              >
                <LayoutGrid className="size-3.5" />
                进入控制台
              </Link>
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
            <button
              type="button"
              onClick={openAuthDialog}
              className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground no-underline transition hover:bg-primary/90"
            >
              登录
            </button>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
