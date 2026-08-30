import { useLocation, useRouter } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";
import { authClient } from "#/lib/auth-client";
import {
  authDialogOpen,
  closeAuthDialog,
  openAuthDialog,
} from "#/stores/auth-dialog";
import BrandLogo from "./BrandLogo";

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

  // 未登录访问受保护页被重定向到 `/?auth=login` 时自动打开弹窗
  useEffect(() => {
    if (location.searchStr.includes("auth=login")) {
      openAuthDialog();
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState(null, "", url.toString());
    }
  }, [location.searchStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
              {isSignUp ? "创建账号" : "欢迎回来"}
            </Dialog.Title>
            <Dialog.Description className="mt-1.5 text-sm text-(--sea-ink-soft)">
              {isSignUp
                ? "注册后即可上传简历，开启 AI 通关之旅"
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

            <div className="grid gap-2">
              <label
                htmlFor="auth-password"
                className="text-sm font-medium leading-none"
              >
                密码
              </label>
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
              {loading ? "请稍候…" : isSignUp ? "创建账号" : "登录"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-(--sea-ink-soft)">
            {isSignUp ? "已有账号？" : "没有账号？"}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="ml-1 font-semibold text-(--lagoon-deep) transition-colors hover:text-(--ai-violet-strong) hover:underline"
            >
              {isSignUp ? "去登录" : "立即注册"}
            </button>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
