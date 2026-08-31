import { useLocation, useRouter } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";
import { isGithubEnabled } from "#/lib/session";
import {
  authDialogOpen,
  closeAuthDialog,
  openAuthDialog,
} from "#/stores/auth-dialog";
import BrandLogo from "./BrandLogo";
import GithubIcon from "./GithubIcon";

export default function AuthDialog() {
  const open = useSelector(authDialogOpen, (s) => s);
  const router = useRouter();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [isForget, setIsForget] = useState(false);
  const [forgetSent, setForgetSent] = useState(false);

  // 未登录访问受保护页被重定向到 `/?auth=login` 时自动打开弹窗
  useEffect(() => {
    if (location.searchStr.includes("auth=login")) {
      openAuthDialog();
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState(null, "", url.toString());
    }
    // 检测 GitHub 社交登录是否配置，未配置时隐藏按钮
    void isGithubEnabled().then(setGithubEnabled);
  }, [location.searchStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isForget) {
      const { error: forgetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (forgetError) {
        setError(forgetError.message || "发送失败，请重试");
        setLoading(false);
        return;
      }
      setForgetSent(true);
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (result.error) {
        setError(result.error.message || "注册失败");
        setLoading(false);
        return;
      }
    } else {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "登录失败");
        setLoading(false);
        return;
      }
    }
    closeAuthDialog();
    void router.navigate({ to: "/console/resumes" });
  };

  const handleGitHub = async () => {
    setError("");
    setSocialLoading(true);
    // 首次授权会自动创建账号并登录；成功后浏览器跳转到 GitHub 授权页
    const { error: socialError } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/console/resumes",
    });
    if (socialError) {
      setSocialLoading(false);
      setError(socialError.message || "GitHub 登录失败，请重试");
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAuthDialog();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-(--line) bg-(--surface) p-6 shadow-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <BrandLogo className="size-10" />
            <Dialog.Title className="display-title mt-4 text-lg font-bold text-(--sea-ink)">
              {isSignUp ? "创建账号" : isForget ? "重置密码" : "欢迎回来"}
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-(--sea-ink-soft)">
              {isSignUp
                ? "注册后即可上传简历，开启 AI 通关之旅"
                : isForget
                  ? "输入注册邮箱，我们将发送重置密码的邮件"
                  : "登录以管理你的简历"}
            </Dialog.Description>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <label
                  htmlFor="auth-name"
                  className="text-sm font-medium leading-none"
                >
                  昵称
                </label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  placeholder="你的名字"
                  required
                />
              </div>
            )}

            {forgetSent ? (
              <div className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                重置邮件已发送，请查收邮箱并按邮件提示操作。
              </div>
            ) : (
              <div className="grid gap-2">
                <label
                  htmlFor="auth-email"
                  className="text-sm font-medium leading-none"
                >
                  邮箱
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}

            {!isForget && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="text-sm font-medium leading-none"
                  >
                    密码
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForget(true);
                        setError("");
                        setPassword("");
                      }}
                      className="text-xs font-medium text-(--lagoon-deep) transition-colors hover:text-(--ai-violet-strong) hover:underline"
                    >
                      忘记密码？
                    </button>
                  )}
                </div>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                  required
                  minLength={8}
                  placeholder="至少 8 位"
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
            >
              {loading
                ? "请稍候…"
                : isSignUp
                  ? "创建账号"
                  : isForget
                    ? forgetSent
                      ? "重新发送"
                      : "发送重置邮件"
                    : "登录"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-(--sea-ink-soft)">
            {isSignUp ? "已有账号？" : isForget ? "已想起密码？" : "没有账号？"}
            <button
              type="button"
              onClick={() => {
                if (isForget) {
                  setIsForget(false);
                } else {
                  setIsSignUp(!isSignUp);
                }
                setError("");
              }}
              className="ml-1 font-semibold text-(--lagoon-deep) transition-colors hover:text-(--ai-violet-strong) hover:underline"
            >
              {isSignUp || isForget ? "去登录" : "立即注册"}
            </button>
          </p>

          {githubEnabled && (
            <>
              <div className="relative my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-(--line)" />
                <span className="text-xs text-(--sea-ink-soft)">或</span>
                <span className="h-px flex-1 bg-(--line)" />
              </div>

              <button
                type="button"
                onClick={() => void handleGitHub()}
                disabled={socialLoading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-(--line) bg-(--surface-strong) text-sm font-medium text-(--sea-ink) transition hover:bg-(--link-bg-hover) disabled:pointer-events-none disabled:opacity-50"
              >
                <GithubIcon className="size-4" />
                {socialLoading
                  ? "正在跳转 GitHub…"
                  : isSignUp
                    ? "使用 GitHub 注册"
                    : "使用 GitHub 登录"}
              </button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
