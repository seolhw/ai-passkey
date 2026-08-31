import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Copy, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { copyLibraryToResume, listLibraryItems } from "#/lib/library-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/library/")({
  component: LibraryPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
  loader: async () => {
    const items = await listLibraryItems();
    return { items };
  },
});

type LibraryTag = { k: string; v: string };

type LibraryItem = {
  id: number;
  title: string;
  industry: string | null;
  tags: LibraryTag[];
  content: string;
  featured: boolean;
};

/** 筛选维度（固定受控枚举）；经验沿用岗位 JD 的区间口径 */
const DEGREE_OPTIONS = ["大专", "本科", "硕士", "博士"] as const;
const EXPERIENCE_OPTIONS = [
  "应届",
  "1-3年",
  "3-5年",
  "5-10年",
  "10年以上",
] as const;

function LibraryPage() {
  const { items } = Route.useLoaderData();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copyingId, setCopyingId] = useState<number | null>(null);
  // 多选筛选：默认全选
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([
    ...DEGREE_OPTIONS,
  ]);
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>([
    ...EXPERIENCE_OPTIONS,
  ]);

  const handleCopy = async (item: LibraryItem) => {
    setCopyingId(item.id);
    const resume = await copyLibraryToResume({ data: { id: item.id } });
    setCopyingId(null);
    if (!resume) return;
    await router.navigate({
      to: "/console/resumes/$resumeId",
      params: { resumeId: String(resume.id) },
    });
  };

  const toggle =
    (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    (value: string) => {
      setter((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
    };

  const tagList = (item: LibraryItem) =>
    (item.tags ?? []).map((t) => `${t.k}: ${t.v}`);

  const tagValue = (item: LibraryItem, k: string) =>
    item.tags?.find((t) => t.k === k)?.v;

  /** 筛选逻辑：学历命中任一选中项，且经验命中任一选中项 */
  const filteredItems = items.filter((item) => {
    const degree = tagValue(item, "学历");
    const exp = tagValue(item, "经验");
    const degreeOk =
      !degree ||
      selectedDegrees.length === 0 ||
      selectedDegrees.includes(degree);
    const expOk =
      !exp ||
      selectedExperiences.length === 0 ||
      selectedExperiences.includes(exp);
    return degreeOk && expOk;
  });

  return (
    <main className="page-wrap px-4 pb-16 pt-10">
      <header className="mb-8">
        <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
          优质简历参考
        </h1>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          精选通过 AI
          大厂筛选的真实简历（做了化名处理），可一键复制到编辑器再个性化修改
        </p>
      </header>

      {/* 标签筛选：学历 / 经验，多选，默认全选 */}
      <div className="island-shell mb-6 rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <FilterGroup
            label="学历"
            options={DEGREE_OPTIONS}
            selected={selectedDegrees}
            onToggle={toggle(setSelectedDegrees)}
          />
          <FilterGroup
            label="经验"
            options={EXPERIENCE_OPTIONS}
            selected={selectedExperiences}
            onToggle={toggle(setSelectedExperiences)}
          />
        </div>
        <p className="mt-3 text-xs text-(--sea-ink-soft)">
          当前显示{" "}
          <span className="font-medium text-(--sea-ink)">
            {filteredItems.length}
          </span>{" "}
          条 / 共 {items.length} 条
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <Sparkles className="mx-auto mb-3 size-10 text-(--sea-ink-soft)" />
          <p className="text-sm text-(--sea-ink-soft)">
            没有匹配当前筛选条件的简历，请调整「学历」「经验」选择
          </p>
        </section>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isOpen = expandedId === item.id;
            return (
              <section key={item.id} className="group flex flex-col">
                {/* 一张 A4 纸 */}
                <div
                  className={`library-paper relative w-full overflow-hidden rounded-[3px] border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_14px_34px_-14px_rgba(15,23,42,0.28)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_22px_44px_-14px_rgba(15,23,42,0.35)] dark:border-zinc-600 ${
                    isOpen ? "max-h-[75vh] overflow-y-auto" : "aspect-[210/297]"
                  }`}
                >
                  <div className="py-8">
                    <div className="px-8">
                      <div
                        className="library-paper-content"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: 渲染已消毒的简历 HTML 内容
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                  </div>
                  {!isOpen && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-white/55 to-white" />
                  )}

                  {/* 底部浮层：hover 滑入 */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full rounded-t-md border-t border-white/15 bg-zinc-900/95 p-4 opacity-0 shadow-[0_-10px_28px_rgba(0,0,0,0.3)] backdrop-blur-sm transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-80">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-sm font-semibold text-white">
                        {item.title}
                      </h2>
                      {item.featured && (
                        <span className="inline-flex h-5 shrink-0 items-center rounded-full bg-(--lagoon-deep) px-2 text-[11px] font-medium text-white">
                          精选
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-300">
                      {item.industry || "通用"}
                    </p>
                    {tagList(item).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tagList(item).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : item.id)}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-white/25 px-3 text-xs font-medium text-zinc-100 transition hover:bg-white/10"
                      >
                        {isOpen ? (
                          <>
                            <EyeOff className="size-3.5" /> 收起
                          </>
                        ) : (
                          <>
                            <Eye className="size-3.5" /> 展开全文
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCopy(item)}
                        disabled={copyingId === item.id}
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md bg-(--lagoon-deep) px-3 text-xs font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {copyingId === item.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                        复制到编辑器
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* 纸张内简历排版：白纸黑字，不随主题变化 */}
      <style>{`
        .library-paper-content {
          font-size: 11px;
          line-height: 1.6;
          color: #27272a;
        }
        .library-paper-content h1 {
          text-align: center;
          font-size: 1.8em;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin: 0 0 0.25em;
        }
        .library-paper-content h1 + p {
          text-align: center;
        }
        .library-paper-content h2 {
          font-size: 1.2em;
          font-weight: 700;
          letter-spacing: 0.06em;
          margin: 0.9em 0 0.3em;
          padding-bottom: 0.15em;
          border-bottom: 1px solid #d4d4d8;
        }
        .library-paper-content h3 {
          font-size: 1.06em;
          font-weight: 700;
          margin: 0.55em 0 0.2em;
        }
        .library-paper-content p {
          margin: 0.3em 0;
        }
        .library-paper-content ul,
        .library-paper-content ol {
          margin: 0.25em 0;
          padding-left: 1.4em;
        }
        .library-paper-content ul {
          list-style: disc;
        }
        .library-paper-content ol {
          list-style: decimal;
        }
        .library-paper-content li {
          margin: 0.15em 0;
        }
        .library-paper-content a {
          color: #0f766e;
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}

/** 筛选标签组：单维度多选 chip */
function FilterGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const allSelected = options.every((o) => selected.includes(o));
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 shrink-0 text-sm font-semibold text-(--sea-ink)">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() =>
            allSelected
              ? options.forEach((o) => {
                  if (selected.includes(o)) onToggle(o);
                })
              : options.forEach((o) => {
                  if (!selected.includes(o)) onToggle(o);
                })
          }
          className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition ${
            allSelected
              ? "border-(--lagoon-deep) bg-(--lagoon-deep)/10 text-(--lagoon-deep)"
              : "border-input text-(--sea-ink-soft) hover:bg-accent"
          }`}
        >
          全选
        </button>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition ${
                active
                  ? "border-(--lagoon-deep) bg-(--lagoon-deep) text-white"
                  : "border-input text-(--sea-ink-soft) hover:bg-accent"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
