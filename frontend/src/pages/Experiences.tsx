import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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
import { Badge, Button, EmptyState, ErrorNote, FilterChip, Input, Select, Skeleton } from '../components/ui'
import type { Difficulty, DriveType, Experience, ExperienceFilters, Verdict } from '../lib/types'

function Stat({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">{children}</div>
    </div>
  )
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
      <span className="mr-1 w-16 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      {children}
    </div>
  )
}

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

  // Collect distinct company names for the stats row
  const availableCompanies = useMemo(() => {
    const set = new Set<string>()
    experiences.forEach((e) => {
      if (e.companyName) set.add(e.companyName)
    })
    return Array.from(set).sort()
  }, [experiences])

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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              Interview experiences
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Real questions, test patterns and round-by-round breakdowns shared by seniors and peers from
              on-campus and off-campus drives.
            </p>
          </div>
          <Button onClick={() => setShareModalOpen(true)} className="shrink-0">
            <Plus size={16} aria-hidden="true" />
            Share your experience
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-4">
          <Stat icon={<BookOpen size={14} />} label="Experiences">
            {totalCount}
          </Stat>
          <Stat icon={<CheckCircle2 size={14} />} label="Offers">
            {selectedCount}
          </Stat>
          <Stat icon={<Building2 size={14} />} label="Companies">
            {availableCompanies.length}
          </Stat>
          <Stat icon={<Shield size={14} />} label="Posting">
            <span className="text-sm font-medium">Anonymous option</span>
          </Stat>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, role or question, e.g. Amazon, LRU cache, DBMS"
              aria-label="Search experiences"
              className="h-10 pl-9 pr-14"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
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
                aria-label="Sort experiences"
                className="h-10"
              >
                <option value="latest">Newest first</option>
                <option value="helpful">Most helpful</option>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="shrink-0">
                <RotateCcw size={13} aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <FilterRow label="Outcome">
            <FilterChip selected={selectedVerdict === undefined} onClick={() => setSelectedVerdict(undefined)}>
              All
            </FilterChip>
            {VERDICTS.map((v) => {
              const active = selectedVerdict === v
              return (
                <FilterChip key={v} selected={active} onClick={() => setSelectedVerdict(active ? undefined : v)}>
                  {VERDICT_META[v].iconLabel}
                </FilterChip>
              )
            })}
          </FilterRow>

          <FilterRow label="Drive">
            <FilterChip selected={selectedDriveType === undefined} onClick={() => setSelectedDriveType(undefined)}>
              All
            </FilterChip>
            {DRIVE_TYPES.map((dt) => {
              const active = selectedDriveType === dt
              return (
                <FilterChip key={dt} selected={active} onClick={() => setSelectedDriveType(active ? undefined : dt)}>
                  {DRIVE_TYPE_META[dt].label}
                </FilterChip>
              )
            })}
          </FilterRow>

          <FilterRow label="Difficulty">
            <FilterChip selected={selectedDifficulty === undefined} onClick={() => setSelectedDifficulty(undefined)}>
              All
            </FilterChip>
            {DIFFICULTIES.map((d) => {
              const active = selectedDifficulty === d
              return (
                <FilterChip key={d} selected={active} onClick={() => setSelectedDifficulty(active ? undefined : d)}>
                  {DIFFICULTY_META[d].label}
                </FilterChip>
              )
            })}
          </FilterRow>
        </div>
      </div>

      {/* Feed */}
      {error && <ErrorNote message="Couldn't load experiences." onRetry={() => refetch()} />}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-busy="true" aria-label="Loading experiences">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} />}
          title={hasActiveFilters ? 'No experiences match your filters' : 'No experiences yet'}
          description={
            hasActiveFilters
              ? 'Try a different search or remove some filters.'
              : 'Be the first to share an interview experience from a recent drive.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset filters
              </Button>
            ) : (
              <Button onClick={() => setShareModalOpen(true)}>Share an experience</Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {experiences.map((exp: Experience) => {
            const verdictMeta = VERDICT_META[exp.verdict]
            const difficultyMeta = DIFFICULTY_META[exp.difficulty]
            const driveMeta = DRIVE_TYPE_META[exp.driveType]

            return (
              <div
                key={exp.id}
                role="button"
                tabIndex={0}
                aria-label={`Read ${exp.title}`}
                onClick={() => setActiveExperience(exp)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setActiveExperience(exp)
                  }
                }}
                className="group flex cursor-pointer flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="space-y-3">
                  {/* Company, role, date */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <p className="truncate">
                        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{exp.companyName}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400"> · {exp.role}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className={verdictMeta.badge}>{verdictMeta.label}</Badge>
                        <Badge className={driveMeta.badge}>{driveMeta.label}</Badge>
                        <Badge className={difficultyMeta.badge}>{difficultyMeta.label}</Badge>
                        {exp.ctc && (
                          <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{exp.ctc}</Badge>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      {formatDate(exp.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">{exp.title}</h3>

                  {exp.summary && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{exp.summary}</p>
                  )}

                  {exp.questionsAsked && (
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                      <p className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        <HelpCircle size={12} aria-hidden="true" />
                        Questions asked
                      </p>
                      <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">{exp.questionsAsked}</p>
                    </div>
                  )}

                  {exp.topics && (
                    <div className="flex flex-wrap gap-1">
                      {exp.topics
                        .split(',')
                        .slice(0, 4)
                        .map((tag: string, idx: number) => {
                          const clean = tag.trim()
                          if (!clean) return null
                          return (
                            <span
                              key={idx}
                              className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400"
                            >
                              {clean}
                            </span>
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* Author and actions */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {exp.isAnonymous ? <Shield size={12} aria-hidden="true" /> : <User size={12} aria-hidden="true" />}
                    </div>
                    <span className="truncate text-xs text-slate-600 dark:text-slate-400">
                      {exp.authorName}
                      {exp.authorBatch ? ` · ${exp.authorBatch}` : ''}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        helpfulMutation.mutate(exp.id)
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      aria-pressed={exp.hasLiked}
                      aria-label={`Mark as helpful (${exp.helpfulCount})`}
                      className={cn(
                        'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium tabular-nums transition-colors',
                        exp.hasLiked
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
                      )}
                    >
                      <ThumbsUp size={13} aria-hidden="true" className={cn(exp.hasLiked && 'fill-current')} />
                      {exp.helpfulCount}
                    </button>

                    <span className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      Read <ChevronRight size={14} aria-hidden="true" />
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
