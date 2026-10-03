import { memo, useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { CollisionDetection, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CircleCheckBig, IndianRupee, MapPin, MoveRight, Layers, Sparkles } from 'lucide-react'
import { useUpdateCompanyStage } from '../hooks/queries'
import { useToast } from '../store/toast'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn, formatDate, initials } from '../lib/format'
import type { Company, Stage } from '../lib/types'

interface KanbanBoardProps {
  companies: Company[]
  onCardClick: (company: Company) => void
  onShareExperience?: (company: Company) => void
}

const stageSet = new Set<Stage>(STAGE_ORDER)

const isStage = (value: unknown): value is Stage =>
  typeof value === 'string' && stageSet.has(value as Stage)

const columnCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args)
}

/** The visual content of a company card, shared by the board and the drag overlay. */
const CardBody = memo(function CardBody({ company }: { company: Company }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {initials(company.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{company.name}</p>
            {company.role && (
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{company.role}</p>
            )}
          </div>
        </div>
        {company.registeredOnSuperset && (
          <span title="Registered on Superset" className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
            <CircleCheckBig size={14} aria-hidden="true" />
            <span className="sr-only">Registered on Superset</span>
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
        {company.ctc && (
          <span className="inline-flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-200">
            <IndianRupee size={11} aria-hidden="true" />
            {company.ctc}
          </span>
        )}
        {company.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" />
            {company.location}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 text-2xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1 tabular-nums">
          <Layers size={12} aria-hidden="true" />
          {company.roundCount} {company.roundCount === 1 ? 'round' : 'rounds'}
        </span>
        <span className="tabular-nums">Applied {formatDate(company.appliedOn)}</span>
      </div>
    </>
  )
})

const KanbanCard = memo(function KanbanCard({
  company,
  onSelect,
  onMove,
  onShareExperience,
}: {
  company: Company
  onSelect: (company: Company) => void
  onMove: (company: Company, stage: Stage) => void
  onShareExperience?: (company: Company) => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(company.id),
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(company)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(company)
      }}
      className={cn(
        'group cursor-grab rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition-colors',
        'hover:border-slate-300 dark:hover:border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <CardBody company={company} />

      {/* Share-experience shortcut once a company reaches a final stage */}
      {(company.stage === 'OFFER' || company.stage === 'REJECTED') && (
        <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onShareExperience?.(company)
            }}
            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Sparkles size={12} aria-hidden="true" className="text-slate-500 dark:text-slate-400" />
            Share your experience
          </button>
        </div>
      )}

      <label
        className="mt-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 text-xs text-slate-500 dark:text-slate-400"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <MoveRight size={14} className="shrink-0" aria-hidden="true" />
        <span className="sr-only">Move {company.name} to stage</span>
        <select
          aria-label={`Move ${company.name} to stage`}
          value={company.stage}
          onChange={(event) => onMove(company, event.target.value as Stage)}
          className="min-w-0 flex-1 cursor-pointer rounded bg-transparent py-1 text-xs font-medium text-slate-600 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {STAGE_ORDER.map((stage) => (
            <option key={stage} value={stage} className="dark:bg-slate-900 dark:text-slate-100">
              {stage === company.stage ? `Current: ${STAGE_META[stage].short}` : `Move to ${STAGE_META[stage].short}`}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
})


const KanbanColumn = memo(function KanbanColumn({
  stage,
  companies,
  onCardClick,
  onMove,
  onShareExperience,
}: {
  stage: Stage
  companies: Company[]
  onCardClick: (company: Company) => void
  onMove: (company: Company, stage: Stage) => void
  onShareExperience?: (company: Company) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = STAGE_META[stage]

  return (
    <div
      ref={setNodeRef}
      role="listitem"
      aria-label={`${meta.label}, ${companies.length} ${companies.length === 1 ? 'company' : 'companies'}`}
      className="flex min-w-0 flex-col"
    >
      {/* Column Header */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', meta.dot)} aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{meta.label}</span>
        </div>
        <span className="rounded-full bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
          {companies.length}
        </span>
      </div>

      {/* Droppable container */}
      <div
        className={cn(
          'min-h-[14rem] space-y-2 rounded-xl border p-2 transition-colors',
          isOver
            ? 'border-dashed border-indigo-400 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30'
            : 'border-slate-200/70 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40',
        )}
      >
        {companies.map((company) => (
          <KanbanCard
            key={company.id}
            company={company}
            onSelect={onCardClick}
            onMove={onMove}
            onShareExperience={onShareExperience}
          />
        ))}
        {companies.length === 0 && (
          <div className="flex min-h-[10rem] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>No companies in this stage</span>
          </div>
        )}
      </div>
    </div>
  )
})

export function KanbanBoard({ companies, onCardClick, onShareExperience }: KanbanBoardProps) {
  const updateStage = useUpdateCompanyStage()
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  )

  const byStage = useMemo(() => {
    const groups: Record<Stage, Company[]> = {
      APPLIED: [],
      PPT: [],
      OA: [],
      SHORTLISTED: [],
      GD: [],
      TECH: [],
      HR: [],
      OFFER: [],
      REJECTED: [],
    }
    for (const company of companies) groups[company.stage].push(company)
    return groups
  }, [companies])

  const activeCompany = useMemo(
    () => companies.find((c) => c.id === activeId) ?? null,
    [companies, activeId],
  )

  const showToast = useToast((s) => s.showToast)

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(Number(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return
      const company = companies.find((c) => c.id === Number(active.id))
      const targetStage = over.id
      if (!isStage(targetStage)) return
      if (company && company.stage !== targetStage) {
        const prevStage = company.stage
        updateStage.mutate({ id: company.id, stage: targetStage })
        showToast({
          title: 'Stage updated',
          message: `Moved ${company.name} to ${STAGE_META[targetStage].label}.`,
          type: 'success',
          action: {
            label: 'Undo',
            onClick: () => updateStage.mutate({ id: company.id, stage: prevStage }),
          },
        })
      }
    },
    [companies, updateStage, showToast],
  )

  const handleDragCancel = useCallback(() => setActiveId(null), [])

  const handleMove = useCallback(
    (company: Company, stage: Stage) => {
      if (company.stage !== stage) {
        const prevStage = company.stage
        updateStage.mutate({ id: company.id, stage })
        showToast({
          title: 'Stage updated',
          message: `Moved ${company.name} to ${STAGE_META[stage].label}.`,
          type: 'success',
          action: {
            label: 'Undo',
            onClick: () => updateStage.mutate({ id: company.id, stage: prevStage }),
          },
        })
      }
    },
    [updateStage, showToast],
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={columnCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
        role="list"
        aria-label="Pipeline stages"
      >
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            companies={byStage[stage]}
            onCardClick={onCardClick}
            onMove={handleMove}
            onShareExperience={onShareExperience}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCompany && (
          <div className="w-80 rotate-1 cursor-grabbing rounded-lg border border-indigo-400 dark:border-indigo-500 bg-white dark:bg-slate-900 p-3.5 shadow-xl shadow-slate-900/15">
            <CardBody company={activeCompany} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

