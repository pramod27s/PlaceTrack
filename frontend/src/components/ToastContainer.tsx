import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Undo2 } from 'lucide-react'
import { useToast } from '../store/toast'
import type { Toast } from '../store/toast'
import { cn } from '../lib/format'

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
    success: <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={18} className="text-rose-500 shrink-0" />,
    warning: <AlertTriangle size={18} className="text-amber-500 shrink-0" />,
    info: <Info size={18} className="text-indigo-500 shrink-0" />,
  }

  const borderStyles = {
    success: 'border-emerald-200/80 bg-white/95 text-slate-900',
    error: 'border-rose-200/80 bg-white/95 text-slate-900',
    warning: 'border-amber-200/80 bg-white/95 text-slate-900',
    info: 'border-indigo-200/80 bg-white/95 text-slate-900',
  }

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl shadow-slate-950/10 backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-5',
        borderStyles[toast.type],
      )}
    >
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-tight text-slate-900">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs font-medium text-slate-500 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick()
            dismissToast(toast.id)
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200/60 hover:bg-indigo-100 transition-colors"
        >
          <Undo2 size={12} />
          {toast.action.label}
        </button>
      )}

      <button
        type="button"
        onClick={() => dismissToast(toast.id)}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <X size={14} />
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
