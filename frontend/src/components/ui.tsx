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
  /** Shows a spinner and disables the button while an action is in flight. */
  loading?: boolean
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700',
  secondary:
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white',
  ghost:
    'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
  danger:
    'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700',
  outline:
    'bg-slate-900 dark:bg-slate-950 text-slate-200 border border-slate-700 dark:border-slate-800 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        'disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'md' && 'h-9 px-4 text-sm',
        size === 'lg' && 'h-10 px-5 text-sm',
        BUTTON_VARIANTS[variant],
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {children}
    </button>
  )
}

// ------------------------------------------------------------------ IconButton

/**
 * Square icon-only button. A `title` is shown as a styled tooltip (on hover
 * and keyboard focus) and doubles as the accessible label.
 */
export function IconButton({
  className,
  ref,
  title,
  ...props
}: ButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  const button = (
    <button
      ref={ref}
      aria-label={props['aria-label'] ?? title}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors',
        'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        className,
      )}
      {...props}
    />
  )
  if (!title) return button
  return <Tooltip label={title}>{button}</Tooltip>
}

// ---------------------------------------------------------------- FilterChip

/** A toggleable filter pill. Selected chips are dark; the rest are outlined. */
export function FilterChip({
  selected,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        selected
          ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// ------------------------------------------------------------------- Tooltip

/** A small label shown above its child on hover or keyboard focus. */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 -translate-x-1/2 whitespace-nowrap',
          'rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md dark:bg-slate-700',
          'opacity-0 transition-opacity delay-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100',
        )}
      >
        {label}
      </span>
    </span>
  )
}

// -------------------------------------------------------------------- Inputs

const FIELD_BASE =
  'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none ' +
  'focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-600 ' +
  'aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:ring-rose-500/20 dark:aria-[invalid=true]:border-rose-500/70'

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
  /** Validation message shown under the control; replaces the hint while present. */
  error?: string
  children: ReactNode
}

export function Field({ label, htmlFor, hint, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
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
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
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
        'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ------------------------------------------------------------------ Skeleton

/** A grey placeholder block shown while content loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800', className)} />
}

/** Placeholder for a page made of a header and a list of rows or cards. */
export function ListSkeleton({ rows = 4, label = 'Loading' }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
          >
            <Skeleton className="h-12 w-20 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="hidden h-8 w-24 sm:block" />
          </div>
        ))}
      </div>
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
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-500 dark:text-slate-400">
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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center sm:p-12">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
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
  const bodyRef = useRef<HTMLDivElement>(null)
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
    // Start on the first form field so users can type immediately; fall back to Close.
    const firstField = bodyRef.current?.querySelector<HTMLElement>(
      'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])',
    )
    ;(firstField ?? closeRef.current)?.focus()
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
          'animate-pop my-auto w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/20 dark:shadow-black/50 border border-slate-200 dark:border-slate-800',
          size === 'xl' ? 'max-w-4xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
        )}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            {displaySubtitle && <p id={descriptionId} className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{displaySubtitle}</p>}
          </div>
          <IconButton ref={closeRef} onClick={onClose} aria-label="Close dialog" type="button">
            <X size={18} />
          </IconButton>
        </div>
        <div ref={bodyRef} className="px-5 py-5 sm:px-6 text-slate-800 dark:text-slate-200">{children}</div>
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
  onRetry,
}: {
  message?: string
  children?: ReactNode
  /** When given, shows a Retry button next to the message. */
  onRetry?: () => void
}) {
  const content = children || message
  if (!content) return null
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/90 dark:bg-rose-950/40 px-3.5 py-2.5 text-sm font-medium text-rose-800 dark:text-rose-300 shadow-sm"
    >
      <span>{content}</span>
      {onRetry && (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
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
          <Button type="button" variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  )
}
