import { createFileRoute, redirect } from "@tanstack/react-router";
import { AtSign, BadgeCheck, Check, KeyRound, Loader2, LogOut, MailWarning, Save } from "lucide-react";
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

      <section className="island-shell mb-6 rounded-2xl p-5">
        <h2 className="mb-4 text-base font-semibold text-(--sea-ink)">
          邮箱验证
        </h2>
        {user && (
          <EmailVerifyCard email={user.email} verified={user.emailVerified} />
        )}
      </section>

      <section className="island-shell mb-6 rounded-2xl p-5">
        <h2 className="mb-4 text-base font-semibold text-(--sea-ink)">
          修改密码
        </h2>
        <ChangePasswordCard />
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

/** 邮箱验证卡片：未验证时支持发送验证码并验证，验证成功后自动刷新 session */
function EmailVerifyCard({
  email,
  verified,
}: {
  email: string;
  verified: boolean;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setSending(true);
    setError("");
    const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setSending(false);
    if (sendError) {
      setError(sendError.message || "验证码发送失败，请重试");
      return;
    }
    setSent(true);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError("");
    const { error: verifyError } = await authClient.emailOtp.verifyEmail({
      email,
      otp: code,
    });
    setVerifying(false);
    if (verifyError) setError(verifyError.message || "验证码错误，请重试");
    // 验证成功：better-auth 会自动刷新 session，此卡片随之更新为已验证
  };

  if (verified) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
        <BadgeCheck className="size-4 shrink-0" />
        邮箱已验证，可以正常创建简历。
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
        <MailWarning className="size-4 shrink-0" />
        邮箱尚未验证，验证后才能创建简历，保障你的简历数据安全。
      </div>
      {!sent ? (
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={sending}
          className="inline-flex h-9 w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-amber-800/10 px-4 text-xs font-medium text-amber-800 transition hover:bg-amber-800/20 disabled:pointer-events-none disabled:opacity-60 dark:bg-amber-200/10 dark:text-amber-200 dark:hover:bg-amber-200/20"
        >
          {sending ? "发送中…" : "发送验证码"}
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="输入验证码"
            maxLength={6}
            className="h-9 w-32 rounded-md border border-(--line) bg-transparent px-3 text-center text-sm tracking-widest outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <button
            type="button"
            onClick={() => void handleVerify()}
            disabled={verifying || code.length < 6}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {verifying ? "验证中…" : "验证"}
          </button>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
          {error}
        </div>
      )}
    </div>
  );
}

/** 修改密码卡片：校验当前密码后设置新密码 */
function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async () => {
    if (newPassword !== confirm) {
      setError("两次输入的新密码不一致");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: changeError } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    setSubmitting(false);
    if (changeError) {
      setError(changeError.message || "修改失败，请检查当前密码是否正确");
      return;
    }
    setSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
        当前密码
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          placeholder="输入当前密码"
          required
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
        新密码
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
        type="button"
        onClick={() => void handleChange()}
        disabled={submitting}
        className="inline-flex h-10 w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : saved ? (
          <Check className="size-4" />
        ) : (
          <KeyRound className="size-4" />
        )}
        {submitting ? "修改中…" : saved ? "已更新" : "确认修改"}
      </button>
    </div>
  );
}
