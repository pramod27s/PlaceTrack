import { useState, useEffect } from 'react'
import {
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { Modal, Button, Input } from './ui'
import { GEMINI_API_KEY_STORAGE } from '../lib/api'

interface AiSettingsModalProps {
  open: boolean
  onClose: () => void
  onKeySaved?: () => void
}

export function AiSettingsModal({ open, onClose, onKeySaved }: AiSettingsModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(GEMINI_API_KEY_STORAGE)
      setSavedKey(stored && stored.trim() ? stored.trim() : null)
      setApiKey('')
      setShowKey(false)
      setSavedSuccess(false)
    }
  }, [open])

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = apiKey.trim()
    if (!trimmed) return

    localStorage.setItem(GEMINI_API_KEY_STORAGE, trimmed)
    setSavedKey(trimmed)
    setApiKey('')
    setSavedSuccess(true)
    onKeySaved?.()
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleRemove = () => {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE)
    setSavedKey(null)
    setApiKey('')
    setSavedSuccess(false)
    onKeySaved?.()
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Google Gemini AI Settings"
      description="Configure your own Google Gemini API key to bypass shared traffic and rate limits."
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            {savedKey && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
              >
                <Trash2 size={14} />
                Revert to Default
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!apiKey.trim()}
              onClick={() => handleSave()}
            >
              Save Key
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status Card */}
        {savedKey ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Custom Gemini API Key Active
                  </p>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-emerald-800/80 dark:text-emerald-400/80">
                  {maskKey(savedKey)}
                </p>
                <p className="mt-1 text-[11px] text-emerald-700/70 dark:text-emerald-400/60">
                  PlaceTrack is using your personal key with dedicated free-tier quota (15 RPM / 1,500 requests/day).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Using PlaceTrack Default Key
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  You are currently sharing the application’s global free-tier quota. Adding your own key guarantees instant access without server load bottlenecks.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {savedKey ? 'Update API Key' : 'Enter Gemini API Key'}
            </label>
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={savedKey ? 'Paste new API key to update...' : 'AIzaSy...'}
                className="pr-10 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                tabIndex={-1}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {savedSuccess && (
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              API Key saved successfully! All AI autofill actions will now use your key.
            </p>
          )}
        </form>

        {/* Instructions */}
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <Key size={14} className="text-indigo-600 dark:text-indigo-400" />
              How to get a free Gemini API key:
            </h4>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"
            >
              Google AI Studio <ExternalLink size={12} />
            </a>
          </div>

          <ol className="mt-2.5 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 list-decimal list-inside leading-relaxed">
            <li>Open Google AI Studio and sign in with your Google account.</li>
            <li>Click <strong>&quot;Create API key&quot;</strong> (free, no credit card required).</li>
            <li>Copy your key, paste it in the box above, and click <strong>Save Key</strong>.</li>
          </ol>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <ShieldCheck size={14} className="text-slate-400 shrink-0" />
          <span>
            Your API key is saved solely in your local browser and sent securely via request headers. It is never stored on our database.
          </span>
        </div>
      </div>
    </Modal>
  )
}
