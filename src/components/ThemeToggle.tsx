import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";

const MODE_ICONS: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  auto: Monitor,
};

const MODE_LABELS: Record<ThemeMode, string> = {
  light: "浅色",
  dark: "深色",
  auto: "跟随系统",
};

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "auto";
  }

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "auto") {
    return stored;
  }

  return "auto";
}

function applyThemeMode(mode: ThemeMode) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);

  if (mode === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", mode);
  }

  document.documentElement.style.colorScheme = resolved;
}

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "auto",
  auto: "light",
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const initialMode = getInitialMode();
    setMode(initialMode);
    applyThemeMode(initialMode);
  }, []);

  useEffect(() => {
    if (mode !== "auto") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemeMode("auto");

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [mode]);

  function cycleMode() {
    const nextMode = NEXT_MODE[mode];
    setMode(nextMode);
    applyThemeMode(nextMode);
    window.localStorage.setItem("theme", nextMode);
  }

  const ModeIcon = MODE_ICONS[mode];
  const label = `主题模式：${MODE_LABELS[mode]}，点击切换`;

  return (
    <button
      type="button"
      onClick={cycleMode}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-md border border-[var(--line)] bg-transparent text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
    >
      <ModeIcon className="size-4" />
    </button>
  );
}
