import { useEffect, useId, useRef } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  Ref,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/format'

// ------------------------------------------------------------------- Button

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 active:from-indigo-700 active:to-indigo-700 text-white shadow-sm shadow-indigo-600/30 border border-indigo-500/30',
  secondary:
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600',
  ghost:
    'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white shadow-sm shadow-rose-600/25 border border-rose-500/30',
  outline:
    'bg-slate-900/90 dark:bg-slate-950/90 text-slate-200 border border-slate-700/90 dark:border-slate-800 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white hover:border-slate-600',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'min-h-8 px-3 py-1.5 text-xs',
        size === 'md' && 'min-h-9 px-4 py-2 text-sm',
        size === 'lg' && 'min-h-11 px-5 py-2.5 text-base font-semibold',
        BUTTON_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}

// ------------------------------------------------------------------ IconButton

export function IconButton({
  className,
  ref,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-all duration-150',
        'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        className,
      )}
      {...props}
    />
  )
}

// -------------------------------------------------------------------- Inputs

const FIELD_BASE =
  'w-full rounded-lg border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none ' +
  'focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-600'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_BASE, className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_BASE, 'resize-y leading-relaxed', className)} {...props} />
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(FIELD_BASE, 'cursor-pointer pr-8', className)} {...props}>
      {children}
    </select>
  )
}

interface FieldProps {
  label: string
  htmlFor?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, htmlFor, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}

// -------------------------------------------------------------------- Badge

export function Badge({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tracking-tight transition-colors',
        className,
      )}
    >
      {children}
    </span>
  )
}

// --------------------------------------------------------------------- Card

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100 transition-all',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ------------------------------------------------------------------- Spinner

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400',
        className,
      )}
    />
  )
}

export function LoadingState({
  label,
  message,
}: {
  label?: string
  message?: string
}) {
  const text = message || label || 'Loading…'
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400 dark:text-slate-500">
      <Spinner className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  )
}

// ---------------------------------------------------------------- EmptyState

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/60 p-8 text-center sm:p-12 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-950/60 dark:to-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-inner ring-1 ring-indigo-500/10 dark:ring-indigo-400/20">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// --------------------------------------------------------------------- Modal

interface ModalProps {
  open?: boolean
  onClose: () => void
  title: string
  description?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
}

export function Modal({
  open = true,
  onClose,
  title,
  description,
  subtitle,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const displaySubtitle = subtitle || description

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab') return

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 dark:bg-slate-950/80 p-4 backdrop-blur-sm sm:p-6 md:p-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={displaySubtitle ? descriptionId : undefined}
        className={cn(
          'animate-pop my-auto w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/20 dark:shadow-black/50 border border-slate-100 dark:border-slate-800',
          size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h2>
            {displaySubtitle && <p id={descriptionId} className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{displaySubtitle}</p>}
          </div>
          <IconButton ref={closeRef} onClick={onClose} aria-label="Close dialog" type="button">
            <X size={18} />
          </IconButton>
        </div>
        <div className="px-5 py-5 sm:px-6 text-slate-800 dark:text-slate-200">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 px-5 py-3.5 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------- Alert

export function ErrorNote({
  message,
  children,
}: {
  message?: string
  children?: ReactNode
}) {
  const content = children || message
  if (!content) return null
  return (
    <div className="rounded-lg border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs font-medium text-rose-800 dark:text-rose-300 shadow-sm">
      {content}
    </div>
  )
}

// ----------------------------------------------------------- ConfirmDialog

export function ConfirmDialog({
  open = true,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  loading,
}: {
  open?: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}) {
  const handleClose = onCancel || onClose || (() => {})
  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  )
}
