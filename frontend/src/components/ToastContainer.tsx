import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Undo2 } from 'lucide-react'
import { useToast } from '../store/toast'
import type { Toast } from '../store/toast'

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useToast((s) => s.dismissToast)

  useEffect(() => {
    if (!toast.durationMs) return
    const timer = setTimeout(() => {
      dismissToast(toast.id)
    }, toast.durationMs)
    return () => clearTimeout(timer)
  }, [toast.id, toast.durationMs, dismissToast])

  const icons = {
    success: <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />,
    error: <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />,
    warning: <AlertTriangle size={18} className="shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />,
    info: <Info size={18} className="shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />,
  }

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className="animate-pop pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white p-3.5 text-slate-900 shadow-lg shadow-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/40"
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{toast.message}</p>
        )}
      </div>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick()
            dismissToast(toast.id)
          }}
          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
        >
          <Undo2 size={12} aria-hidden="true" />
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToast((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 p-2 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
