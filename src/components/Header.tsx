import { Link } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="page-wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-3 sm:py-4">
				<h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
					>
						<span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
						跨界简历
					</Link>
				</h2>

				<div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
					<Link
						to="/resumes"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						我的简历
					</Link>
					<Link
						to="/companies"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						招聘简章
					</Link>
					<Link
						to="/library"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						简历大厅
					</Link>
					<Link
						to="/advisor"
						className="nav-link"
						activeProps={{ className: "nav-link is-active" }}
					>
						AI 顾问
					</Link>
				</div>

				<div className="ml-auto flex items-center gap-1.5 sm:gap-2">
					{isPending ? (
						<div className="h-8 w-8 animate-pulse rounded-full bg-[var(--line)]" />
					) : session?.user ? (
						<div className="flex items-center gap-2">
							<span className="hidden text-sm text-[var(--sea-ink-soft)] sm:block">
								{session.user.name || session.user.email}
							</span>
							<button
								type="button"
								onClick={() => {
									void authClient.signOut().then(() => {
										window.location.href = "/";
									});
								}}
								className="h-8 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 text-xs font-medium text-[var(--sea-ink)] transition hover:bg-[var(--link-bg-hover)]"
							>
								退出
							</button>
						</div>
					) : (
						<Link
							to="/login"
							className="h-8 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 text-xs font-medium text-[var(--sea-ink)] no-underline transition hover:bg-[var(--link-bg-hover)]"
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
