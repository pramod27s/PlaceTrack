import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../store/theme'
import { cn } from '../lib/format'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200',
        'border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900',
        'dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        className,
      )}
    >
      {theme === 'dark' ? (
        <Sun size={17} className="text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon size={17} className="text-slate-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  )
}
