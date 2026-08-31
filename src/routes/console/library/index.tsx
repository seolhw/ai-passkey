import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import DetailModal from "#/components/DetailModal";
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
  tags: LibraryTag[] | null;
  content: string;
  featured: boolean;
};

/** 筛选维度展示顺序：学历、经验优先，其余（技能/方向等）靠后 */
const TAG_KEY_ORDER = ["学历", "经验", "技能"];

/** 从所有简历中按 key 聚合出可选标签值（保留数据中实际出现的顺序，维度按 TAG_KEY_ORDER 排序） */
function buildTagGroups(items: LibraryItem[]) {
  const map = new Map<string, string[]>();
  for (const item of items) {
    for (const t of item.tags ?? []) {
      const arr = map.get(t.k) ?? [];
      if (!arr.includes(t.v)) arr.push(t.v);
      map.set(t.k, arr);
    }
  }
  const rank = (k: string) => {
    const i = TAG_KEY_ORDER.indexOf(k);
    return i === -1 ? TAG_KEY_ORDER.length : i;
  };
  return Array.from(map.entries()).sort((a, b) => rank(a[0]) - rank(b[0]));
}

function LibraryPage() {
  const { items } = Route.useLoaderData();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const [viewing, setViewing] = useState<LibraryItem | null>(null);
  // 筛选区折叠状态，默认收起
  const [filterOpen, setFilterOpen] = useState(false);
  // 通用多选筛选：selectedTags[k] = 选中的值；未记录的 k 表示该维度「全选」
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>(
    {},
  );

  const tagGroups = buildTagGroups(items);

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

  /** 切换某维度的单个值 */
  const toggleValue = (k: string) => (v: string) => {
    setSelectedTags((prev) => {
      const all: string[] | undefined = tagGroups.find(
        ([key]) => key === k,
      )?.[1];
      const base = prev[k] ?? all ?? [];
      const next = base.includes(v)
        ? base.filter((x) => x !== v)
        : [...base, v];
      // 选中了全部值等价于「全选」，删除键即可
      if (all && next.length === all.length) {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      }
      return { ...prev, [k]: next };
    });
  };

  /** 某维度：全选 <=> 清空 */
  const toggleGroupSelectAll = (k: string) => {
    setSelectedTags((prev) => {
      const copy = { ...prev };
      if (copy[k] === undefined) {
        copy[k] = []; // 清空
      } else {
        delete copy[k]; // 全选
      }
      return copy;
    });
  };

  
  /** 筛选逻辑：每个维度内命中任一选中值（维度间 AND，缺失该维度的简历视为通过） */
  const filteredItems = items.filter((item) => {
    for (const [k] of tagGroups) {
      const selected = selectedTags[k];
      if (selected === undefined) continue; // 全选
      const itemVals = (item.tags ?? [])
        .filter((t) => t.k === k)
        .map((t) => t.v);
      if (itemVals.length === 0) continue; // 该简历无此维度标签，不排除
      if (!itemVals.some((v) => selected.includes(v))) return false;
    }
    return true;
  });

  // 当前有具体选中值的筛选维度数（用于折叠态标题栏展示）
  const activeFilterCount = Object.entries(selectedTags).filter(
    ([, vals]) => (vals?.length ?? 0) > 0,
  ).length;

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

      {/* 标签筛选：多维度多选，默认全选；筛选区默认折叠 */}
      <div className="island-shell mb-6 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left"
        >
          <span className="flex items-center gap-2">
            <Filter className="size-4 text-(--sea-ink-soft)" />
            <span className="text-sm font-semibold text-(--sea-ink)">
              筛选标签
            </span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 items-center rounded-full bg-(--lagoon-deep) px-2 text-[11px] font-medium text-white">
                {activeFilterCount} 项生效
              </span>
            )}
          </span>
          <span className="flex items-center gap-3">
            <span className="text-xs text-(--sea-ink-soft)">
              当前显示{" "}
              <span className="font-medium text-(--sea-ink)">
                {filteredItems.length}
              </span>{" "}
              / {items.length} 条
            </span>
            <span className="text-(--sea-ink-soft)">
              {filterOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </span>
          </span>
        </button>
        {filterOpen && (
          <div className="border-t border-(--line) px-5 py-4">
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {tagGroups.map(([k, values]) => {
                  const selected = selectedTags[k]; // undefined = 全选
                  return (
                    <FilterGroup
                      key={k}
                      label={k}
                      options={values}
                      selected={selected}
                      onToggle={toggleValue(k)}
                      onToggleAll={() => toggleGroupSelectAll(k)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <section className="island-shell rounded-2xl px-6 py-14 text-center">
          <Sparkles className="mx-auto mb-3 size-10 text-(--sea-ink-soft)" />
          <p className="text-sm text-(--sea-ink-soft)">
            没有匹配当前筛选条件的简历，请调整标签选择
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
                  className={`library-paper relative w-full rounded-[3px] border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_14px_34px_-14px_rgba(15,23,42,0.28)] transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.1),0_22px_44px_-14px_rgba(15,23,42,0.35)] dark:border-zinc-600 ${
                    isOpen
                      ? "max-h-[75vh] overflow-y-auto overflow-x-hidden"
                      : "aspect-[210/297] overflow-hidden"
                  }`}
                >
                  {/* 右上角固定操作条：详情 / 展开全文 / 复制 */}
                  <div className="sticky top-2 z-10 flex justify-end gap-2 px-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewing(item)}
                      title="查看详情"
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-(--lagoon-deep) px-2.5 text-xs font-medium text-white backdrop-blur transition hover:opacity-90"
                    >
                      详情
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isOpen ? null : item.id)}
                      title={isOpen ? "收起" : "展开全文"}
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800"
                    >
                      {isOpen ? (<><EyeOff className="size-3.5" /> 收起</>) : (<><Eye className="size-3.5" /> 展开全文</>)}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopy(item)}
                      disabled={copyingId === item.id}
                      title="复制到我的简历"
                      className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-800/80 px-2.5 text-xs font-medium text-white backdrop-blur transition hover:bg-zinc-800 disabled:opacity-60"
                    >
                      {copyingId === item.id ? (<Loader2 className="size-3.5 animate-spin" />) : (<Copy className="size-3.5" />)}
                      复制
                    </button>
                  </div>

                  <div className="py-10">
                    <div className="px-8">
                      <div
                        className="library-paper-content"
                        style={{ fontSize: "14px" }}
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: 渲染已消毒的简历 HTML 内容
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </div>
                  </div>
                  {!isOpen && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-white/55 to-white" />
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
      {/* 优质简历详情弹窗 */}
      <DetailModal
        open={viewing != null}
        onClose={() => setViewing(null)}
        title={viewing ? `简历 · ${viewing.title}` : "简历详情"}
      >
        {viewing && (
          <div className="mx-auto w-full max-w-[780px]">
            <div className="library-paper min-h-[297mm] overflow-hidden rounded-[2px] border border-zinc-200 bg-white shadow-sm">
              <div className="p-8">
                <div className="library-paper-content" style={{ fontSize: "14px" }}>
                  <h1 className="mb-4 text-center text-[1.6em] font-bold tracking-widest">{viewing.title}</h1>
                  <div dangerouslySetInnerHTML={{ __html: viewing.content }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailModal>
    </main>
  );
}

/** 筛选标签组：单维度多选 chip；selected=undefined 表示该维度全选 */
function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  onToggleAll,
}: {
  label: string;
  options: string[];
  selected: string[] | undefined;
  onToggle: (value: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected = selected === undefined;
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="w-9 shrink-0 text-sm font-semibold text-(--sea-ink)">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={onToggleAll}
          className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition ${
            allSelected
              ? "border-(--lagoon-deep) bg-(--lagoon-deep)/10 text-(--lagoon-deep)"
              : "border-input text-(--sea-ink-soft) hover:bg-accent"
          }`}
        >
          {allSelected ? "清空" : "全选"}
        </button>
        {options.map((opt) => {
          const active = allSelected || selected?.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition ${
                active
                  ? "border-(--lagoon-deep) bg-(--lagoon-deep)/10 text-(--lagoon-deep)"
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
