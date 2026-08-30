import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { authClient } from "#/lib/auth-client";
import { getSession } from "#/lib/session";

export const Route = createFileRoute("/login")({
	component: LoginPage,
	beforeLoad: async () => {
		const session = await getSession();
		if (session?.user) {
			throw redirect({ to: "/resumes" });
		}
	},
});

function LoginPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

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
		window.location.href = "/resumes";
	};

	return (
		<main className="page-wrap flex min-h-[70vh] items-center justify-center px-4 py-14">
			<section className="island-shell w-full max-w-md rounded-[1.5rem] px-6 py-8 sm:px-8">
				<p className="island-kicker mb-2">跨界简历</p>
				<h1 className="display-title mb-1 text-2xl font-bold text-[var(--sea-ink)]">
					{isSignUp ? "创建账号" : "欢迎回来"}
				</h1>
				<p className="mb-6 text-sm text-[var(--sea-ink-soft)]">
					{isSignUp
						? "注册后即可上传简历，开启 AI 通关之旅"
						: "登录以管理你的简历"}
				</p>

				<form onSubmit={handleSubmit} className="grid gap-4">
					{isSignUp && (
						<div className="grid gap-2">
							<label
								htmlFor="name"
								className="text-sm font-medium leading-none"
							>
								昵称
							</label>
							<input
								id="name"
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
						<label htmlFor="email" className="text-sm font-medium leading-none">
							邮箱
						</label>
						<input
							id="email"
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
							htmlFor="password"
							className="text-sm font-medium leading-none"
						>
							密码
						</label>
						<input
							id="password"
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
						<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all outline-none hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
					>
						{loading ? "请稍候…" : isSignUp ? "创建账号" : "登录"}
					</button>
				</form>

				<div className="mt-4 text-center">
					<button
						type="button"
						onClick={() => {
							setIsSignUp(!isSignUp);
							setError("");
						}}
						className="text-sm text-[var(--sea-ink-soft)] transition-colors hover:text-[var(--sea-ink)]"
					>
						{isSignUp ? "已有账号？去登录" : "没有账号？立即注册"}
					</button>
				</div>
			</section>
		</main>
	);
}
