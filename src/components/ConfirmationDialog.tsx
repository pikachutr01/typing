import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

type ConfirmationDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative flex w-full max-w-sm flex-col rounded-2xl bg-slate-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-950 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-100/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-900/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
