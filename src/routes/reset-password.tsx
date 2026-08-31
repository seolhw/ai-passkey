import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token,
    });
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message || "重置失败，链接可能已过期，请重新申请");
      return;
    }
    setDone(true);
  };

  return (
    <main className="page-wrap flex min-h-screen items-center justify-center px-4 py-14">
      <section className="island-shell w-full max-w-sm rounded-2xl p-6">
        <p className="island-kicker mb-1">重置密码</p>
        <h1 className="display-title mb-6 text-xl font-bold text-(--sea-ink)">
          设置新密码
        </h1>
        {!token ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
            链接无效或已过期，请重新发起密码重置。
          </div>
        ) : done ? (
          <div className="grid gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
              <CheckCircle2 className="size-4 shrink-0" />
              密码已重置成功，请使用新密码登录。
            </div>
            <a
              href="/?auth=login"
              className="btn-gradient inline-flex h-10 items-center justify-center rounded-md text-sm font-medium no-underline"
            >
              去登录
            </a>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
              新密码
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="至少 8 位"
                minLength={8}
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
              确认新密码
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                placeholder="再次输入新密码"
                minLength={8}
                required
              />
            </label>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn-gradient inline-flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  重置中…
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  确认重置
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
