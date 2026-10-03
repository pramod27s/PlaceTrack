import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CircleCheckBig, Plus, Search, Trophy, X } from 'lucide-react'
import { useCompanies } from '../hooks/queries'
import { KanbanBoard } from '../components/KanbanBoard'
import { CompanyModal } from '../components/CompanyModal'
import { ExperienceModal } from '../components/ExperienceModal'
import { Button, EmptyState, ErrorNote, FilterChip, Input } from '../components/ui'
import type { Company, Verdict } from '../lib/types'

function PipelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading pipeline">
      {/* Top Header Card Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-3.5 w-64 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="h-7 w-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-7 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-9 w-full sm:w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Columns Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((col) => (
          <div
            key={col}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 p-3 space-y-3"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="h-5 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-6 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Skeleton Cards */}
            <div className="space-y-2.5">
              <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-2.5 w-1/2 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800/60" />
                  <div className="h-4 w-16 rounded bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-3.5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type FilterType = 'all' | 'active' | 'superset' | 'interview' | 'offer'

export default function Pipeline() {
  const navigate = useNavigate()
  const { data: companies, isLoading, isError, refetch } = useCompanies()
  const [modalOpen, setModalOpen] = useState(false)
  const [shareCompany, setShareCompany] = useState<Company | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const handleCardClick = useCallback(
    (company: { id: number }) => navigate(`/companies/${company.id}`),
    [navigate],
  )


  const filteredCompanies = useMemo(() => {
    if (!companies) return []
    let list: Company[] = companies

    // Filter type
    if (activeFilter === 'active') {
      list = list.filter((c) => c.stage !== 'REJECTED' && c.stage !== 'OFFER')
    } else if (activeFilter === 'superset') {
      list = list.filter((c) => c.registeredOnSuperset)
    } else if (activeFilter === 'interview') {
      list = list.filter((c) => c.stage === 'TECH' || c.stage === 'HR' || c.stage === 'GD')
    } else if (activeFilter === 'offer') {
      list = list.filter((c) => c.stage === 'OFFER')
    }

    // Search query
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.role && c.role.toLowerCase().includes(q)) ||
          (c.location && c.location.toLowerCase().includes(q)) ||
          (c.ctc && c.ctc.toLowerCase().includes(q)),
      )
    }

    return list
  }, [companies, activeFilter, searchQuery])

  if (isLoading) return <PipelineSkeleton />
  if (isError || !companies) {
    return <ErrorNote message="Couldn't load your pipeline." onRetry={() => refetch()} />
  }

  const totalCount = companies.length
  const activeCount = companies.filter((c) => c.stage !== 'REJECTED' && c.stage !== 'OFFER').length
  const supersetCount = companies.filter((c) => c.registeredOnSuperset).length
  const interviewCount = companies.filter((c) => c.stage === 'TECH' || c.stage === 'HR' || c.stage === 'GD').length
  const offerCount = companies.filter((c) => c.stage === 'OFFER').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Placement pipeline</h2>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">
              {filteredCompanies.length} of {totalCount}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Drag cards between stages, or search and filter below.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {/* Search and filters */}
      {totalCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter companies">
            <FilterChip selected={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
              All <span className="tabular-nums opacity-70">{totalCount}</span>
            </FilterChip>
            <FilterChip selected={activeFilter === 'active'} onClick={() => setActiveFilter('active')}>
              Active <span className="tabular-nums opacity-70">{activeCount}</span>
            </FilterChip>
            <FilterChip selected={activeFilter === 'superset'} onClick={() => setActiveFilter('superset')}>
              <CircleCheckBig size={13} aria-hidden="true" />
              Superset <span className="tabular-nums opacity-70">{supersetCount}</span>
            </FilterChip>
            <FilterChip selected={activeFilter === 'interview'} onClick={() => setActiveFilter('interview')}>
              Interviewing <span className="tabular-nums opacity-70">{interviewCount}</span>
            </FilterChip>
            {offerCount > 0 && (
              <FilterChip selected={activeFilter === 'offer'} onClick={() => setActiveFilter('offer')}>
                <Trophy size={13} aria-hidden="true" />
                Offers <span className="tabular-nums opacity-70">{offerCount}</span>
              </FilterChip>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
            />
            <Input
              className="pl-9 pr-8"
              placeholder="Search company, role, CTC…"
              aria-label="Search companies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Board View */}
      {totalCount === 0 ? (
        <EmptyState
          icon={<Building2 size={24} />}
          title="No companies in your pipeline"
          description="Add the first company you've applied to and start organizing your placement season."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Add your first company
            </Button>
          }
        />
      ) : filteredCompanies.length === 0 ? (
        <EmptyState
          icon={<Search size={24} />}
          title="No matching companies"
          description={`No applications match your active filter and search "${searchQuery}".`}
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('all')
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <KanbanBoard
          companies={filteredCompanies}
          onCardClick={handleCardClick}
          onShareExperience={setShareCompany}
        />
      )}

      <CompanyModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {shareCompany && (
        <ExperienceModal
          initialData={{
            companyName: shareCompany.name,
            role: shareCompany.role || 'Software Engineer',
            ctc: shareCompany.ctc || '',
            location: shareCompany.location || '',
            verdict:
              shareCompany.stage === 'OFFER'
                ? ('SELECTED' as Verdict)
                : shareCompany.stage === 'REJECTED'
                  ? ('REJECTED' as Verdict)
                  : ('IN_PROGRESS' as Verdict),
            title: `${shareCompany.name} ${shareCompany.role || 'Interview'} Experience`,
            summary:
              shareCompany.stage === 'OFFER'
                ? `Received an offer from ${shareCompany.name}.`
                : `Interview experience and learnings from ${shareCompany.name}.`,
            tips: shareCompany.researchNotes
              ? `Prep notes: ${shareCompany.researchNotes}`
              : '',
            anonymous: true,
          }}
          onClose={() => setShareCompany(null)}
        />
      )}
    </div>
  )
}

