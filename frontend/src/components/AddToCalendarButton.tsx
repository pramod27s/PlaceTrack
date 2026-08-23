import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, Download, ExternalLink } from 'lucide-react'
import { downloadIcsFile, getGoogleCalendarUrl } from '../lib/calendar'
import { cn } from '../lib/format'
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
    const url = getGoogleCalendarUrl(round)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleDownloadIcs = () => {
    setIsOpen(false)
    downloadIcsFile(round)
  }

  return (
    <div ref={menuRef} className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Add to calendar"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
        )}
      >
        <CalendarPlus size={size === 'sm' ? 14 : 16} className="text-indigo-600 dark:text-indigo-400" />
        <span>Add to Calendar</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 z-30 mt-1.5 w-52 origin-top-right rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-lg shadow-slate-900/10 dark:shadow-black/50 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleGoogleCalendar}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={13} className="text-indigo-600 dark:text-indigo-400" />
              Google Calendar
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Web</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={handleDownloadIcs}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span className="flex items-center gap-2">
              <Download size={13} className="text-slate-500 dark:text-slate-400" />
              Download .ics file
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Apple / Outlook</span>
          </button>
        </div>
      )}
    </div>
  )
}
