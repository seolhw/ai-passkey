import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import { useState } from "react";
import ConfirmDialog from "#/components/ConfirmDialog";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Link as LinkIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

export default function ResumeEditor({
  content,
  placeholder = "开始撰写你的简历…",
  onChange,
}: {
  content: string;
  placeholder?: string;
  onChange?: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Markdown, // 支持 Markdown 语法输入（如 # 标题 / **加粗** / - 列表）
      Highlight,
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content,
    contentType: "html", // 现有内容为 HTML，用 HTML 解析；同时保留 Markdown 输入规则
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "resume-editor-content outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
  });

  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) return null;

  const btn = (
    active: boolean,
    onClick: () => void,
    label: string,
    children: React.ReactNode,
  ) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition ${
        active
          ? "bg-(--lagoon-deep) text-white"
          : "text-(--sea-ink-soft) hover:bg-(--link-bg-hover) hover:text-(--sea-ink)"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-[860px]">
      {/* 工具栏 */}
      <div className="mb-3 flex flex-wrap items-center gap-1 rounded-xl border border-(--line) bg-(--surface-strong) p-1.5 shadow-sm">
        {btn(
          editor.isActive("bold"),
          () => editor.chain().focus().toggleBold().run(),
          "加粗（Ctrl+B）",
          <Bold className="size-4" />,
        )}
        {btn(
          editor.isActive("italic"),
          () => editor.chain().focus().toggleItalic().run(),
          "斜体",
          <Italic className="size-4" />,
        )}
        {btn(
          editor.isActive("underline"),
          () => editor.chain().focus().toggleUnderline().run(),
          "下划线",
          <UnderlineIcon className="size-4" />,
        )}
        {btn(
          editor.isActive("strike"),
          () => editor.chain().focus().toggleStrike().run(),
          "删除线",
          <Strikethrough className="size-4" />,
        )}
        {btn(
          editor.isActive("highlight"),
          () => editor.chain().focus().toggleHighlight().run(),
          "高亮",
          <Highlighter className="size-4" />,
        )}
        <span className="mx-1 h-5 w-px bg-(--line)" />
        {btn(
          editor.isActive("heading", { level: 1 }),
          () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          "一级标题（Markdown：# 空格）",
          <Heading1 className="size-4" />,
        )}
        {btn(
          editor.isActive("heading", { level: 2 }),
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          "二级标题（Markdown：## 空格）",
          <Heading2 className="size-4" />,
        )}
        {btn(
          editor.isActive("bulletList"),
          () => editor.chain().focus().toggleBulletList().run(),
          "无序列表（Markdown：- 空格）",
          <List className="size-4" />,
        )}
        {btn(
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run(),
          "有序列表（Markdown：1. 空格）",
          <ListOrdered className="size-4" />,
        )}
        {btn(
          editor.isActive("taskList"),
          () => editor.chain().focus().toggleTaskList().run(),
          "任务列表（Markdown：- [ ] 空格）",
          <ListChecks className="size-4" />,
        )}
        {btn(
          editor.isActive("blockquote"),
          () => editor.chain().focus().toggleBlockquote().run(),
          "引用（Markdown：> 空格）",
          <Quote className="size-4" />,
        )}
        {btn(
          editor.isActive("codeBlock"),
          () => editor.chain().focus().toggleCodeBlock().run(),
          "代码块（Markdown：``` ）",
          <Code className="size-4" />,
        )}
        <span className="mx-1 h-5 w-px bg-(--line)" />
        {btn(
          editor.isActive({ textAlign: "left" }),
          () => editor.chain().focus().setTextAlign("left").run(),
          "左对齐",
          <AlignLeft className="size-4" />,
        )}
        {btn(
          editor.isActive({ textAlign: "center" }),
          () => editor.chain().focus().setTextAlign("center").run(),
          "居中",
          <AlignCenter className="size-4" />,
        )}
        {btn(
          editor.isActive({ textAlign: "right" }),
          () => editor.chain().focus().setTextAlign("right").run(),
          "右对齐",
          <AlignRight className="size-4" />,
        )}
        {btn(
          editor.isActive("horizontalRule"),
          () => editor.chain().focus().setHorizontalRule().run(),
          "分割线（Markdown：--- ）",
          <Minus className="size-4" />,
        )}
        <span className="mx-1 h-5 w-px bg-(--line)" />
        {btn(
          false,
          () => { setLinkUrl(""); setLinkOpen(true); },
          "插入链接",
          <LinkIcon className="size-4" />,
        )}
        {btn(
          false,
          () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
          "清除格式",
          <RemoveFormatting className="size-4" />,
        )}
        <span className="mx-1 h-5 w-px bg-(--line)" />
        {btn(
          false,
          () => editor.chain().focus().undo().run(),
          "撤销",
          <Undo2 className="size-4" />,
        )}
        {btn(
          false,
          () => editor.chain().focus().redo().run(),
          "重做",
          <Redo2 className="size-4" />,
        )}
      </div>

      {/* A4 真实纸张：固定 A4 宽 210mm，min-height 297mm，内容超一页按页(297mm)分页 */}
      <div className="resume-a4-paper library-paper overflow-hidden rounded-[2px] border border-zinc-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_14px_34px_-14px_rgba(15,23,42,0.28)] dark:border-zinc-600">
        <div className="px-[14mm] py-[14mm]">
          <EditorContent editor={editor} className="min-h-[269mm]" />
        </div>
      </div>

      <style>{`
        .resume-a4-paper {
          width: 210mm;
          min-height: 297mm;
          content-visibility: auto;
          background-image: repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(297mm - 1px),
            rgb(212 212 216 / 0.7) calc(297mm - 1px),
            rgb(212 212 216 / 0.7) 297mm
          );
        }
        .resume-a4-paper .ProseMirror {
          min-height: 269mm;
        }
        .resume-editor-content { font-size: 14px; line-height: 1.75; color: #27272a; }
        .resume-editor-content p { margin: 0.5em 0; }
        .resume-editor-content ul, .resume-editor-content ol { padding-left: 1.4em; }
        .resume-editor-content ul { list-style: disc; }
        .resume-editor-content ol { list-style: decimal; }
        .resume-editor-content h1 { font-size: 1.8em; font-weight: 700; margin: 1em 0 0.5em; }
        .resume-editor-content h2 { font-size: 1.45em; font-weight: 700; margin: 0.9em 0 0.4em; }
        .resume-editor-content h3 { font-size: 1.25em; font-weight: 700; margin: 0.7em 0 0.3em; }
        .resume-editor-content h4 { font-size: 1.1em; font-weight: 700; margin: 0.6em 0 0.3em; }
        .resume-editor-content a { color: var(--lagoon-deep); text-decoration: underline; }
        .resume-editor-content blockquote { border-left: 3px solid var(--lagoon); padding-left: 1em; color: var(--sea-ink-soft); margin: 0.6em 0; }
        .resume-editor-content code { border: 1px solid var(--line); background: #f4f4f5; border-radius: 4px; padding: 1px 5px; color: #18181b; font-size: 0.9em; }
        .resume-editor-content pre { background: #18181b; color: #f4f4f5; border-radius: 8px; padding: 0.9em; overflow-x: auto; margin: 0.6em 0; }
        .resume-editor-content pre code { background: transparent; border: 0; color: inherit; padding: 0; font-size: 0.95em; }
        .resume-editor-content .is-empty::before {
          content: attr(data-placeholder);
          color: #a1a1aa;
          float: left;
          height: 0;
          pointer-events: none;
        }
        .resume-editor-content ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .resume-editor-content ul[data-type="taskList"] li { display: flex; gap: 0.5em; align-items: flex-start; }
        .resume-editor-content hr { border: 0; border-top: 1px solid #d4d4d8; margin: 1em 0; }
      `}</style>
      <ConfirmDialog
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="插入链接"
        message="输入链接地址，将选中文本设为链接。"
        inputLabel="链接地址"
        inputValue={linkUrl}
        onInputChange={setLinkUrl}
        inputPlaceholder="https://…"
        confirmText="插入"
        onConfirm={() => { if (linkUrl.trim()) editor.chain().focus().setLink({ href: linkUrl.trim() }).run(); setLinkOpen(false); }}
      />
    </div>
  );
}
