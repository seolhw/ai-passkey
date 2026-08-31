import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { createJob } from "#/lib/company-api";
import { getSessionUser } from "#/lib/session";

export const Route = createFileRoute("/console/companies/new")({
  component: NewJobPage,
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) throw redirect({ href: "/?auth=login" });
  },
});

function NewJobPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [jobType, setJobType] = useState("full_time");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [tags, setTags] = useState("");
  const [cities, setCities] = useState("");
  const [jd, setJd] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!companyName.trim() || !title.trim() || !jd.trim()) {
      setError("公司名、岗位名称和 JD 内容为必填");
      return;
    }
    setError("");
    setSaving(true);
    const job = await createJob({
      data: {
        companyName: companyName.trim(),
        title: title.trim(),
        jd: jd.trim(),
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        jobType: jobType || undefined,
        experience: experience || undefined,
        education: education || undefined,
        tags: tags
          ? tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
        cities: cities
          ? cities.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      },
    });
    setSaving(false);
    if (!job) {
      setError("保存失败，请重试");
      return;
    }
    await router.navigate({ to: "/console/companies" });
  };

  return (
    <main className="page-wrap max-w-2xl px-4 pb-16 pt-10">
      <header className="mb-6">
        <Link
          to="/console/companies"
          className="mb-4 inline-flex h-9 items-center gap-1 rounded-md border border-input px-3 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent"
        >
          <ArrowLeft className="size-4" /> 返回
        </Link>
        <p className="island-kicker mb-1">招聘简章</p>
        <h1 className="display-title text-2xl font-bold text-(--sea-ink)">
          手动添加岗位
        </h1>
        <p className="mt-1 text-sm text-(--sea-ink-soft)">
          添加自己关注的岗位 JD，之后可在目标岗位选择中使用
        </p>
      </header>

      <form
        className="island-shell grid gap-4 rounded-2xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            公司名 *
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="如：OpenAI"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            岗位名称 *
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="如：AI 产品经理"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            最低年薪（万元）
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="如：30"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            最高年薪（万元）
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="如：70"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            岗位类型
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="full_time">社招</option>
              <option value="intern">实习</option>
              <option value="campus">校招</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            经验要求
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">不限</option>
              <option>应届</option>
              <option>1-3年</option>
              <option>3-5年</option>
              <option>5-10年</option>
              <option>10年以上</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            学历要求
            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">不限</option>
              <option>大专</option>
              <option>本科</option>
              <option>硕士</option>
              <option>博士</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            技能标签
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="逗号分隔，如：PyTorch, RAG"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
            工作城市
            <input
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              placeholder="逗号分隔，如：北京, 上海"
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
          JD 内容 *
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={10}
            className="rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            placeholder={"岗位职责…\n任职要求…\n加分项…"}
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-(--sea-ink)">
          来源链接
          <input
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            placeholder="https://…（可选）"
          />
        </label>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-500/10">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-(--lagoon-deep) px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          保存岗位
        </button>
      </form>
    </main>
  );
}
