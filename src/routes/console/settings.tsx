import { createFileRoute, redirect } from "@tanstack/react-router";
import { AtSign, Check, Loader2, LogOut, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/settings")({
  component: SettingsPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
});

function SettingsPage() {
  const { data: session } = authClient.useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user.name) setName(session.user.name);
  }, [session]);

  const user = session?.user;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("昵称不能为空");
      return;
    }
    setError("");
    setSaving(true);
    const { error: updateError } = await authClient.updateUser({
      name: trimmed,
    });
    setSaving(false);
    if (updateError) {
      setError(updateError.message || "保存失败，请重试");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-8">
        <p className="island-kicker mb-1">账号</p>
        <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
          个人设置
        </h1>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          管理你的个人资料与账号状态
        </p>
      </header>

      <section className="island-shell mb-6 rounded-2xl p-5">
        <h2 className="mb-4 text-base font-semibold text-(--sea-ink)">
          基本信息
        </h2>
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-(--primary)/12 text-lg font-bold text-(--primary)">
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-(--sea-ink)">
              {user?.name || "未设置昵称"}
            </p>
            <p className="text-xs text-(--sea-ink-soft)">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            昵称
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="你的昵称"
              maxLength={30}
            />
          </label>
          <div className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            邮箱
            <div className="flex h-9 items-center gap-2 rounded-md border border-(--line) bg-(--surface) px-3 text-sm text-(--sea-ink-soft)">
              <AtSign className="size-4" />
              {user?.email}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : saved ? (
              <Check className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            {saving ? "保存中…" : saved ? "已保存" : "保存修改"}
          </button>
        </div>
      </section>

      <section className="island-shell rounded-2xl p-5">
        <h2 className="mb-2 text-base font-semibold text-(--sea-ink)">
          账号操作
        </h2>
        <p className="mb-4 text-sm text-(--sea-ink-soft)">
          退出后需要重新登录才能进入控制台
        </p>
        <button
          type="button"
          onClick={() => {
            void authClient.signOut().then(() => {
              window.location.href = "/";
            });
          }}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-6 text-sm font-medium text-destructive transition hover:bg-destructive/15 sm:w-auto"
        >
          <LogOut className="size-4" />
          退出登录
        </button>
      </section>
    </main>
  );
}
