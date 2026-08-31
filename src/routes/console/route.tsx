import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import {
  Briefcase,
  FileText,
  Handshake,
  Library,
  LogOut,
  MailWarning,
  MessagesSquare,
  Settings,
} from "lucide-react";
import { authClient } from "#/lib/auth-client";
import { getSessionUser } from "#/lib/session";
import BrandLogo from "../../components/BrandLogo";

export const Route = createFileRoute("/console")({
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  component: ConsoleLayout,
});

const MENU = [
  { to: "/console/resumes", label: "我的简历", icon: FileText },
  { to: "/console/companies", label: "招聘简章", icon: Briefcase },
  { to: "/console/library", label: "简历大厅", icon: Library },
  { to: "/console/advisor", label: "求职顾问", icon: MessagesSquare },
  { to: "/console/settings", label: "个人设置", icon: Settings },
  { to: "/console/contact", label: "联系开发者", icon: Handshake },
] as const;

function ConsoleLayout() {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-dvh bg-(--background)">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-(--line) bg-(--surface) md:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-(--line) px-4">
          <Link
            to="/console/resumes"
            className="flex items-center gap-2 no-underline"
          >
            <BrandLogo className="size-8" />
            <span className="text-sm font-bold tracking-tight text-(--sea-ink)">
              跨界简历
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="grid gap-0.5">
            {MENU.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="console-nav-item"
                activeProps={{ className: "is-active" }}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="shrink-0 space-y-2 border-t border-(--line) p-3">
          <Link
            to="/console/settings"
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 no-underline transition hover:bg-(--link-bg-hover)"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--primary)/12 text-xs font-semibold text-(--primary)">
              {(session?.user.name || session?.user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-(--sea-ink)">
              {session?.user.name || session?.user.email}
            </span>
            <Settings className="size-3.5 shrink-0 text-(--sea-ink-soft)" />
          </Link>
          <button
            type="button"
            onClick={() => {
              void authClient.signOut().then(() => {
                window.location.href = "/";
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/15"
          >
            <LogOut className="size-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-60">
        {session?.user && !session.user.emailVerified && <VerifyEmailBanner />}
        <Outlet />
      </main>
    </div>
  );
}

/** 邮箱未验证时的提示横幅：验证功能在个人设置中完成 */
function VerifyEmailBanner() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-b border-amber-200/60 bg-amber-50 px-6 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
      <MailWarning className="size-4 shrink-0" />
      <span className="text-center">
        邮箱尚未验证，验证后即可创建简历，保障你的简历数据安全。
      </span>
      <Link
        to="/console/settings"
        className="shrink-0 rounded-md bg-amber-800/10 px-3 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-800/20 dark:bg-amber-200/10 dark:text-amber-200 dark:hover:bg-amber-200/20"
      >
        去验证
      </Link>
    </div>
  );
}
