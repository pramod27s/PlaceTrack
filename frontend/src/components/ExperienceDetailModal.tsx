import { useState } from 'react'
import {
  Calendar,
  Copy,
  HelpCircle,
  Lightbulb,
  MapPin,
  MessageSquare,
  Shield,
  ThumbsUp,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import {
  DIFFICULTY_META,
  DRIVE_TYPE_META,
  VERDICT_META,
} from '../lib/constants'
import { formatDate } from '../lib/format'
import { useDeleteExperience, useHelpfulExperience } from '../hooks/queries'
import { Button, ConfirmDialog, Modal } from './ui'
import type { Experience } from '../lib/types'


interface ExperienceDetailModalProps {
  experience: Experience
  onClose: () => void
}

export function ExperienceDetailModal({
  experience,
  onClose,
}: ExperienceDetailModalProps) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const helpfulMutation = useHelpfulExperience()
  const deleteMutation = useDeleteExperience()

  const verdictMeta = VERDICT_META[experience.verdict]
  const difficultyMeta = DIFFICULTY_META[experience.difficulty]
  const driveMeta = DRIVE_TYPE_META[experience.driveType]

  const handleHelpful = () => {
    helpfulMutation.mutate(experience.id)
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(experience.id)
    onClose()
  }

  const handleCopySummary = async () => {
    const text = `${experience.title}\nCompany: ${experience.companyName} (${experience.role})\nVerdict: ${experience.verdict}\n\nQuestions Asked:\n${experience.questionsAsked ?? 'N/A'}\n\nTips:\n${experience.tips ?? 'N/A'}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Modal
        title={experience.title}
        subtitle={`${experience.companyName} • ${experience.role}`}
        onClose={onClose}
        size="xl"
      >
        <div className="space-y-6">
          {/* Header Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${verdictMeta.badge}`}
            >
              {verdictMeta.label}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${difficultyMeta.badge}`}
            >
              Difficulty: {difficultyMeta.label}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${driveMeta.badge}`}
            >
              {driveMeta.label}
            </span>

            {experience.ctc && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800">
                💰 {experience.ctc}
              </span>
            )}

            {experience.location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <MapPin size={12} />
                {experience.location}
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 ml-auto">
              <Calendar size={12} />
              {formatDate(experience.createdAt)}
            </span>
          </div>

          {/* Author Badge */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-sm shadow-sm">
                {experience.isAnonymous ? (
                  <Shield size={16} />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  {experience.authorName}
                  {experience.isAuthor && (
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                      Author
                    </span>
                  )}
                </p>
                {experience.authorBatch && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {experience.authorBatch}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleHelpful}
                disabled={helpfulMutation.isPending}
                className="gap-1.5 text-xs font-semibold hover:border-indigo-300 dark:hover:border-indigo-600"
              >
                <ThumbsUp size={13} className="text-indigo-600 dark:text-indigo-400" />
                <span>Helpful ({experience.helpfulCount})</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySummary}
                className="text-xs gap-1"
                title="Copy highlights to clipboard"
              >
                <Copy size={13} />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          {/* TL;DR Summary */}
          {experience.summary && (
            <div className="rounded-xl border border-indigo-100/80 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
                <Zap size={13} /> Overview & Summary
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {experience.summary}
              </p>
            </div>
          )}

          {/* Rounds Details */}
          {experience.roundsDetails && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-indigo-500" />
                Rounds Breakdown
              </h3>
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                <p className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                  {experience.roundsDetails}
                </p>
              </div>
            </div>
          )}

          {/* Specific Questions Asked */}
          {experience.questionsAsked && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-amber-500" />
                Key Questions & Topics Asked
              </h3>
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                <p className="text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono text-[11px]">
                  {experience.questionsAsked}
                </p>
              </div>
            </div>
          )}

          {/* Topics / Tags */}
          {experience.topics && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Core Topics Covered
              </p>
              <div className="flex flex-wrap gap-1.5">
                {experience.topics.split(',').map((tag, idx) => {
                  const clean = tag.trim()
                  if (!clean) return null
                  return (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/80"
                    >
                      #{clean}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tips for Juniors */}
          {experience.tips && (
            <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <Lightbulb size={14} className="text-emerald-600 dark:text-emerald-400" />
                Preparation Advice & Tips
              </p>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {experience.tips}
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-800">
            {experience.isAuthor ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="gap-1 text-xs"
              >
                <Trash2 size={13} />
                <span>Delete My Post</span>
              </Button>
            ) : (
              <div />
            )}

            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Interview Experience"
          message="Are you sure you want to delete this experience post? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}
