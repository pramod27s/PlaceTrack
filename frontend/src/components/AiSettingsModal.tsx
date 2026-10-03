import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Modal, Button, Field, Input } from './ui'
import { GEMINI_API_KEY_STORAGE } from '../lib/api'

interface AiSettingsModalProps {
  open: boolean
  onClose: () => void
  onKeySaved?: () => void
}

function readStoredKey(): string | null {
  try {
    const stored = localStorage.getItem(GEMINI_API_KEY_STORAGE)
    return stored && stored.trim() ? stored.trim() : null
  } catch {
    return null
  }
}

function maskKey(key: string) {
  if (key.length <= 8) return '••••••••'
  return `${key.slice(0, 6)}••••••••${key.slice(-4)}`
}

/**
 * Lets the user store their own Gemini API key in this browser. The dialog
 * body mounts fresh on every open, so it always starts from the stored key.
 */
export function AiSettingsModal({ open, onClose, onKeySaved }: AiSettingsModalProps) {
  if (!open) return null
  return <AiSettingsDialog onClose={onClose} onKeySaved={onKeySaved} />
}

function AiSettingsDialog({ onClose, onKeySaved }: Omit<AiSettingsModalProps, 'open'>) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(readStoredKey)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e?: FormEvent) => {
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

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title="Gemini API key"
      description="Use your own free key for AI form filling instead of the shared one."
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            {savedKey && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
              >
                <Trash2 size={14} aria-hidden="true" />
                Remove key
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="button" disabled={!apiKey.trim()} onClick={() => handleSave()}>
              Save key
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Current status */}
        <div
          className={
            savedKey
              ? 'rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30'
              : 'rounded-lg border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/40'
          }
        >
          {savedKey ? (
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Using your key</p>
                <p className="mt-0.5 font-mono text-xs text-emerald-800 dark:text-emerald-300">{maskKey(savedKey)}</p>
                <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  AI requests now count against your own free quota.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Using the shared key</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Everyone shares one free quota, so requests can fail at busy times. Your own key avoids that.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          <Field label={savedKey ? 'Replace key' : 'API key'} htmlFor="gemini-key">
            <div className="relative">
              <Input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={savedKey ? 'Paste a new key' : 'AIzaSy…'}
                autoComplete="off"
                spellCheck={false}
                className="pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                aria-label={showKey ? 'Hide key' : 'Show key'}
                aria-pressed={showKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:hover:text-slate-300"
              >
                {showKey ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          </Field>

          {savedSuccess && (
            <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={14} aria-hidden="true" />
              Key saved. AI form filling will use it from now on.
            </p>
          )}
        </form>

        {/* How to get a key */}
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
              <Key size={14} aria-hidden="true" className="text-slate-500" />
              Get a free key
            </h4>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Google AI Studio <ExternalLink size={12} aria-hidden="true" />
            </a>
          </div>

          <ol className="mt-2.5 list-inside list-decimal space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            <li>Open Google AI Studio and sign in with your Google account.</li>
            <li>Click <span className="font-medium text-slate-800 dark:text-slate-200">Create API key</span>. It's free and needs no card.</li>
            <li>Paste the key above and click <span className="font-medium text-slate-800 dark:text-slate-200">Save key</span>.</li>
          </ol>
        </div>

        <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck size={14} className="mt-px shrink-0" aria-hidden="true" />
          The key is stored only in this browser and sent with AI requests. It is never saved in our database.
        </p>
      </div>
    </Modal>
  )
}
