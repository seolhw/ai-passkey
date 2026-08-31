import { X } from "lucide-react";
import { Dialog } from "radix-ui";

/**
 * 统一的「详情」弹窗：招聘简章 JD 详情、我的简历 详情 共用。
 * 触发按钮统一叫「详情」，弹窗头部/关闭/内容容器样式完全一致。
 */
export default function DetailModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "w-[min(94vw,900px)]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-[71] flex max-h-[92vh] ${maxWidth} -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-(--line) bg-(--surface) shadow-2xl`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-(--line) bg-(--surface-strong) px-4 py-3">
            <Dialog.Title className="truncate text-base font-semibold text-(--sea-ink)">
              {title}
            </Dialog.Title>
            <Dialog.Close
              asChild
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-(--line) bg-(--surface) text-(--sea-ink) transition hover:bg-accent"
            >
              <button type="button" aria-label="关闭" title="关闭">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description asChild>
            <div className="sr-only">{title}</div>
          </Dialog.Description>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
