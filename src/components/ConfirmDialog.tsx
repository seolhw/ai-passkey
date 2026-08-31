import { Loader2, X } from "lucide-react";
import { Dialog } from "radix-ui";

/**
 * 应用内确认对话框（替代浏览器原生 confirm / prompt）。
 * 传入 inputLabel 时显示一个输入框（如「插入链接」输入网址）。
 */
export default function ConfirmDialog({
  open,
  onClose,
  title = "确认操作",
  message,
  confirmText = "确定",
  cancelText = "取消",
  onConfirm,
  busy = false,
  inputLabel,
  inputValue,
  onInputChange,
  inputPlaceholder,
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  busy?: boolean;
  inputLabel?: string;
  inputValue?: string;
  onInputChange?: (v: string) => void;
  inputPlaceholder?: string;
  danger?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && !busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-(--line) bg-(--surface) p-6 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-semibold text-(--sea-ink)">
              {title}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex size-8 items-center justify-center rounded-md border border-(--line) text-(--sea-ink) transition hover:bg-accent disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </div>

          <Dialog.Description className="text-sm leading-relaxed text-(--sea-ink-soft)">
            {message}
          </Dialog.Description>

          {inputLabel && (
            <label className="mt-4 grid gap-1.5 text-sm font-medium text-(--sea-ink)">
              {inputLabel}
              <input
                value={inputValue}
                onChange={(e) => onInputChange?.(e.target.value)}
                autoFocus
                placeholder={inputPlaceholder}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm font-normal shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
              />
            </label>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="inline-flex h-9 items-center rounded-md border border-input px-4 text-sm font-medium text-(--sea-ink-soft) transition hover:bg-accent disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium text-white transition disabled:opacity-50 ${
                danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
              }`}
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {confirmText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
