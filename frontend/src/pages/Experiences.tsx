import { useMemo, useState } from 'react'
import {
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  ThumbsUp,
  User,
} from 'lucide-react'
import {
  DIFFICULTIES,
  DIFFICULTY_META,
  DRIVE_TYPES,
  DRIVE_TYPE_META,
  VERDICTS,
  VERDICT_META,
} from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import { useExperiences, useHelpfulExperience } from '../hooks/queries'

import { ExperienceDetailModal } from '../components/ExperienceDetailModal'
import { ExperienceModal } from '../components/ExperienceModal'
import { Button, EmptyState, ErrorNote, Input, LoadingState, Select } from '../components/ui'
import type { Difficulty, DriveType, Experience, ExperienceFilters, Verdict } from '../lib/types'


export default function Experiences() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [selectedDriveType, setSelectedDriveType] = useState<DriveType | undefined>(undefined)
  const [selectedVerdict, setSelectedVerdict] = useState<Verdict | undefined>(undefined)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'latest' | 'helpful'>('latest')

  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [activeExperience, setActiveExperience] = useState<Experience | null>(null)

  const filters = useMemo<ExperienceFilters>(() => {
    return {
      query: searchQuery.trim() || undefined,
      company: selectedCompany || undefined,
      driveType: selectedDriveType,
      verdict: selectedVerdict,
      difficulty: selectedDifficulty,
      sortBy,
    }
  }, [searchQuery, selectedCompany, selectedDriveType, selectedVerdict, selectedDifficulty, sortBy])

  const { data: experiences = [], isLoading, error, refetch } = useExperiences(filters)
  const helpfulMutation = useHelpfulExperience()

  // Collect distinct company names for quick filter pills
  const availableCompanies = useMemo(() => {
    const set = new Set<string>()
    experiences.forEach((e) => {
      if (e.companyName) set.add(e.companyName)
    })
    return Array.from(set).sort()
  }, [experiences])

  // Stats calculation
  const totalCount = experiences.length
  const selectedCount = experiences.filter((e) => e.verdict === 'SELECTED').length

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedCompany ||
      selectedDriveType ||
      selectedVerdict ||
      selectedDifficulty ||
      sortBy !== 'latest',
  )

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCompany('')
    setSelectedDriveType(undefined)
    setSelectedVerdict(undefined)
    setSelectedDifficulty(undefined)
    setSortBy('latest')
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Hero / Header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 md:p-10 text-white shadow-xl shadow-slate-950/20 border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-400/30 backdrop-blur-sm">
              <Sparkles size={14} className="text-indigo-300" />
              <span>Campus Placement Vault</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Real Interview Experiences &amp; Question Vault
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              Learn from the actual questions, test patterns, and round breakdowns shared by
              seniors and peers across on-campus &amp; off-campus drives.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShareModalOpen(true)}
              className="gap-2 shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all text-sm font-bold"
            >
              <Plus size={18} />
              <span>Share Your Experience</span>
            </Button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
          <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <BookOpen size={14} /> Total Archives
            </div>
            <p className="mt-1 text-2xl font-black text-white">{totalCount}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={14} /> Offers / Selected
            </div>
            <p className="mt-1 text-2xl font-black text-white">{selectedCount}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
              <Building2 size={14} /> Companies
            </div>
            <p className="mt-1 text-2xl font-black text-white">{availableCompanies.length || '12+'}</p>
          </div>

          <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-semibold">
              <Shield size={14} /> Privacy First
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-300">100% Anonymous Options</p>
          </div>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Bar & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role, question (e.g. 'Amazon', 'LRU Cache', 'DBMS')..."
              className="pl-10 h-10 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-40 sm:w-44">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'helpful')}
                className="h-10 text-xs font-medium"
              >
                <option value="latest">⏱️ Latest First</option>
                <option value="helpful">🔥 Most Helpful</option>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Pills: Verdict, Drive Type, Difficulty */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {/* Verdict Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
              Verdict:
            </span>
            <button
              onClick={() => setSelectedVerdict(undefined)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                selectedVerdict === undefined
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Outcomes
            </button>
            {VERDICTS.map((v) => {
              const active = selectedVerdict === v
              return (
                <button
                  key={v}
                  onClick={() => setSelectedVerdict(active ? undefined : v)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {VERDICT_META[v].iconLabel}
                </button>
              )
            })}
          </div>

          {/* Drive Type & Difficulty */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                Drive:
              </span>
              <button
                onClick={() => setSelectedDriveType(undefined)}
                className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-all ${
                  selectedDriveType === undefined
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {DRIVE_TYPES.map((dt) => {
                const active = selectedDriveType === dt
                return (
                  <button
                    key={dt}
                    onClick={() => setSelectedDriveType(active ? undefined : dt)}
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-medium transition-all ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {DRIVE_TYPE_META[dt].label}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                Difficulty:
              </span>
              <button
                onClick={() => setSelectedDifficulty(undefined)}
                className={`rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-all ${
                  selectedDifficulty === undefined
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All
              </button>
              {DIFFICULTIES.map((d) => {
                const active = selectedDifficulty === d
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(active ? undefined : d)}
                    className={`rounded-lg px-2.5 py-0.5 text-xs font-medium transition-all ${
                      active
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {DIFFICULTY_META[d].label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Feed */}
      {error && <ErrorNote message="Failed to load experiences. Please try again." />}

      {isLoading ? (
        <LoadingState message="Loading community experiences..." />
      ) : experiences.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={24} />}
          title={hasActiveFilters ? 'No experiences match your filters' : 'No interview experiences yet'}
          description={
            hasActiveFilters
              ? 'Try resetting your search query or loosening your filter criteria.'
              : 'Be the first to share an interview experience from your recent placement drive!'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setShareModalOpen(true)}>
                Share the First Experience 🚀
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {experiences.map((exp: Experience) => {
            const verdictMeta = VERDICT_META[exp.verdict]
            const difficultyMeta = DIFFICULTY_META[exp.difficulty]
            const driveMeta = DRIVE_TYPE_META[exp.driveType]

            return (
              <div
                key={exp.id}
                onClick={() => setActiveExperience(exp)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md cursor-pointer"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Company, Verdict, Date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {exp.companyName}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          • {exp.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${verdictMeta.badge}`}
                        >
                          {verdictMeta.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${driveMeta.badge}`}
                        >
                          {driveMeta.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${difficultyMeta.badge}`}
                        >
                          {difficultyMeta.label}
                        </span>
                        {exp.ctc && (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full ring-1 ring-emerald-200 dark:ring-emerald-800">
                            {exp.ctc}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                      {formatDate(exp.createdAt)}
                    </span>
                  </div>

                  {/* Title Headline */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {exp.title}
                  </h3>

                  {/* Summary / Excerpt */}
                  {exp.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {exp.summary}
                    </p>
                  )}

                  {/* Questions Excerpt */}
                  {exp.questionsAsked && (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                        <HelpCircle size={11} className="text-amber-500" />
                        Questions Preview:
                      </p>
                      <p className="text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-2">
                        {exp.questionsAsked}
                      </p>
                    </div>
                  )}

                  {/* Topics Tags */}
                  {exp.topics && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {exp.topics
                        .split(',')
                        .slice(0, 4)
                        .map((tag: string, idx: number) => {
                          const clean = tag.trim()
                          if (!clean) return null
                          return (
                            <span
                              key={idx}
                              className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                            >
                              #{clean}
                            </span>
                          )
                        })}
                    </div>
                  )}
                </div>


                {/* Card Footer: Author Attribution & Actions */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {exp.isAnonymous ? <Shield size={12} /> : <User size={12} />}
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {exp.authorName}
                      {exp.authorBatch ? ` • ${exp.authorBatch}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        helpfulMutation.mutate(exp.id)
                      }}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition-all',
                        exp.hasLiked
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 ring-1 ring-indigo-300 dark:ring-indigo-700'
                          : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                      )}
                      title={exp.hasLiked ? 'You liked this (Click to undo)' : 'Mark as helpful'}
                    >
                      <ThumbsUp
                        size={13}
                        className={cn(
                          exp.hasLiked
                            ? 'fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400'
                            : 'text-indigo-500',
                        )}
                      />
                      <span>{exp.helpfulCount}</span>
                    </button>


                    <span className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                      Read full <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {shareModalOpen && (
        <ExperienceModal
          onClose={() => {
            setShareModalOpen(false)
            refetch()
          }}
        />
      )}

      {activeExperience && (
        <ExperienceDetailModal
          experience={activeExperience}
          onClose={() => setActiveExperience(null)}
        />
      )}
    </div>
  )
}
