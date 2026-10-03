import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, Check, Download, ExternalLink } from 'lucide-react'
import { downloadIcsFile, getGoogleCalendarUrl } from '../lib/calendar'
import { cn, isPastIso } from '../lib/format'
import { useMarkRoundCalendarAdded } from '../hooks/queries'
import type { Round } from '../lib/types'

interface AddToCalendarButtonProps {
  round: Round
  size?: 'sm' | 'md'
  className?: string
}

export function AddToCalendarButton({
  round,
  size = 'sm',
  className,
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const markCalendarAdded = useMarkRoundCalendarAdded()

  const isAdded = Boolean(round.addedToCalendar)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleGoogleCalendar = () => {
    setIsOpen(false)
    if (!isAdded) {
      markCalendarAdded.mutate(round.id)
    }
    const url = getGoogleCalendarUrl(round)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadIcs = () => {
    setIsOpen(false)
    if (!isAdded) {
      markCalendarAdded.mutate(round.id)
    }
    downloadIcsFile(round)
  }

  // Past rounds can't be added to a calendar. Checked after all hooks so the
  // hook order stays stable when a round's start time passes while mounted.
  if (isPastIso(round.scheduledAt)) {
    return null
  }

  return (
    <div ref={menuRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={isAdded ? 'Added to calendar (click to re-sync)' : 'Add to calendar'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-colors',
          'hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-3 text-sm',
        )}
      >
        {isAdded ? (
          <Check size={size === 'sm' ? 14 : 16} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
        ) : (
          <CalendarPlus size={size === 'sm' ? 14 : 16} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
        )}
        <span>{isAdded ? 'In calendar' : 'Add to calendar'}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="animate-pop absolute left-0 z-30 mt-1.5 w-56 origin-top-left rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg shadow-slate-900/10 dark:shadow-black/50 focus:outline-none"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleGoogleCalendar}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-slate-500 dark:text-slate-400" />
              Google Calendar
            </span>
            <span className="text-2xs text-slate-500 dark:text-slate-400">Web</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleDownloadIcs}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800"
          >
            <span className="flex items-center gap-2">
              <Download size={14} className="text-slate-500 dark:text-slate-400" />
              Download .ics file
            </span>
            <span className="text-2xs text-slate-500 dark:text-slate-400">Apple / Outlook</span>
          </button>
        </div>
      )}
    </div>
  )
}
