import { useState } from 'react'
import { Check, ChevronDown, ChevronUp, Key, Sparkles } from 'lucide-react'
import { apiError } from '../lib/api'
import { Button, ErrorNote, Textarea } from './ui'
import { AiSettingsModal } from './AiSettingsModal'

/**
 * Collapsible "paste a notice and let AI fill the form" panel, shared by the
 * company and round dialogs. `onExtract` should fill the form and throw on failure.
 */
export function AiNoticePanel({
  heading,
  description,
  placeholder,
  onExtract,
}: {
  heading: string
  description: string
  placeholder: string
  onExtract: (text: string) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [text, setText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleExtract = async () => {
    if (!text.trim()) return
    setExtracting(true)
    setError('')
    setSuccess(false)
    try {
      await onExtract(text)
      setSuccess(true)
    } catch (err) {
      setError(apiError(err))
    } finally {
      setExtracting(false)
    }
  }

  const clear = () => {
    setText('')
    setError('')
    setSuccess(false)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Sparkles size={16} className="shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{heading}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {open ? 'Hide' : 'Paste text'}
          {open ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div className="mt-3 space-y-2.5 border-t border-slate-200 pt-3 dark:border-slate-700">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            aria-label={heading}
            rows={3}
          />

          {error && (
            <div className="space-y-2">
              <ErrorNote message={error} />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Key size={14} className="shrink-0 text-slate-500" aria-hidden="true" />
                  <span>Hit the shared limit? Use your own free Gemini API key.</span>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
                  <Key size={12} aria-hidden="true" />
                  Add API key
                </Button>
              </div>
            </div>
          )}

          {success && (
            <p role="status" className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <Check size={14} className="shrink-0" aria-hidden="true" />
              Details filled in below. Check them before saving.
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Anything not in the text stays blank.</span>
            <div className="flex items-center gap-1.5">
              {text && (
                <Button type="button" variant="ghost" size="sm" onClick={clear}>
                  Clear
                </Button>
              )}
              <Button type="button" size="sm" onClick={handleExtract} loading={extracting} disabled={!text.trim()}>
                {!extracting && <Sparkles size={13} aria-hidden="true" />}
                {extracting ? 'Reading…' : 'Fill form'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AiSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
