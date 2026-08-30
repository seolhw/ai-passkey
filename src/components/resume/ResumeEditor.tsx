import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
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
				heading: { levels: [1, 2, 3] },
			}),
			Highlight,
			Placeholder.configure({ placeholder }),
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			TaskList,
			TaskItem.configure({ nested: true }),
		],
		content,
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"resume-editor-content prose prose-sm sm:prose max-w-none min-h-[40rem] px-5 py-4 outline-none focus:outline-none",
			},
		},
		onUpdate: ({ editor: e }) => {
			onChange?.(e.getHTML());
		},
	});

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
					? "bg-[var(--lagoon-deep)] text-white"
					: "text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
			}`}
		>
			{children}
		</button>
	);

	return (
		<div className="resume-editor overflow-hidden rounded-2xl border border-[var(--line)] bg-white dark:bg-[var(--surface-strong)]">
			<div className="flex flex-wrap items-center gap-1 border-b border-[var(--line)] px-3 py-2">
				{btn(
					editor.isActive("bold"),
					() => editor.chain().focus().toggleBold().run(),
					"加粗",
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
				<span className="mx-1 h-5 w-px bg-[var(--line)]" />
				{btn(
					editor.isActive("heading", { level: 1 }),
					() => editor.chain().focus().toggleHeading({ level: 1 }).run(),
					"一级标题",
					<Heading1 className="size-4" />,
				)}
				{btn(
					editor.isActive("heading", { level: 2 }),
					() => editor.chain().focus().toggleHeading({ level: 2 }).run(),
					"二级标题",
					<Heading2 className="size-4" />,
				)}
				{btn(
					editor.isActive("bulletList"),
					() => editor.chain().focus().toggleBulletList().run(),
					"无序列表",
					<List className="size-4" />,
				)}
				{btn(
					editor.isActive("orderedList"),
					() => editor.chain().focus().toggleOrderedList().run(),
					"有序列表",
					<ListOrdered className="size-4" />,
				)}
				{btn(
					editor.isActive("taskList"),
					() => editor.chain().focus().toggleTaskList().run(),
					"任务列表",
					<ListChecks className="size-4" />,
				)}
				{btn(
					editor.isActive("blockquote"),
					() => editor.chain().focus().toggleBlockquote().run(),
					"引用",
					<Quote className="size-4" />,
				)}
				{btn(
					editor.isActive("codeBlock"),
					() => editor.chain().focus().toggleCodeBlock().run(),
					"代码块",
					<Code className="size-4" />,
				)}
				<span className="mx-1 h-5 w-px bg-[var(--line)]" />
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
					"分割线",
					<Minus className="size-4" />,
				)}
				<span className="mx-1 h-5 w-px bg-[var(--line)]" />
				{btn(
					false,
					() => {
						const url = window.prompt("输入链接地址");
						if (url) editor.chain().focus().setLink({ href: url }).run();
					},
					"插入链接",
					<LinkIcon className="size-4" />,
				)}
				{btn(
					false,
					() => editor.chain().focus().clearNodes().unsetAllMarks().run(),
					"清除格式",
					<RemoveFormatting className="size-4" />,
				)}
				<span className="mx-1 h-5 w-px bg-[var(--line)]" />
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
			<EditorContent editor={editor} />
			<style>{`
        .resume-editor-content p { margin: 0.5em 0; }
        .resume-editor-content ul, .resume-editor-content ol { padding-left: 1.5em; }
        .resume-editor-content ul { list-style: disc; }
        .resume-editor-content ol { list-style: decimal; }
        .resume-editor-content h1 { font-size: 1.6em; font-weight: 700; margin: 0.8em 0 0.4em; }
        .resume-editor-content h2 { font-size: 1.3em; font-weight: 600; margin: 0.7em 0 0.4em; }
        .resume-editor-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.6em 0 0.3em; }
        .resume-editor-content a { color: var(--lagoon-deep); text-decoration: underline; }
        .resume-editor-content blockquote { border-left: 3px solid var(--lagoon); padding-left: 1em; color: var(--sea-ink-soft); }
        .resume-editor-content code { border: 1px solid var(--line); background: var(--surface); border-radius: 6px; padding: 1px 5px; }
        .resume-editor-content pre { background: #18181b; color: #f4f4f5; border-radius: 10px; padding: 1em; overflow-x: auto; }
        .resume-editor-content pre code { background: transparent; border: 0; color: inherit; }
        .resume-editor-content .is-empty::before {
          content: attr(data-placeholder);
          color: var(--sea-ink-soft);
          opacity: 0.6;
          float: left;
          height: 0;
          pointer-events: none;
        }
        .resume-editor-content ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .resume-editor-content ul[data-type="taskList"] li { display: flex; gap: 0.5em; align-items: flex-start; }
      `}</style>
		</div>
	);
}
