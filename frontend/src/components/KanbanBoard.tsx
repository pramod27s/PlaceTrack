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
import { CircleCheckBig, IndianRupee, MapPin, MoveRight, Layers } from 'lucide-react'
import { useUpdateCompanyStage } from '../hooks/queries'
import { useToast } from '../store/toast'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn, formatDate, initials } from '../lib/format'
import type { Company, Stage } from '../lib/types'

interface KanbanBoardProps {
  companies: Company[]
  onCardClick: (company: Company) => void
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/20 text-xs font-bold text-indigo-700 ring-1 ring-indigo-500/20">
            {initials(company.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 tracking-tight">{company.name}</p>
            {company.role && (
              <p className="truncate text-xs text-slate-500 font-medium">{company.role}</p>
            )}
          </div>
        </div>
        {company.registeredOnSuperset && (
          <span
            title="Registered on Superset"
            className="flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20"
          >
            <CircleCheckBig size={12} className="text-emerald-600" />
            <span className="hidden xl:inline">Superset</span>
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 font-medium">
        {company.ctc && (
          <span className="inline-flex items-center gap-0.5 font-semibold text-slate-800 bg-slate-100/80 px-2 py-0.5 rounded-md">
            <IndianRupee size={11} className="text-slate-500" />
            {company.ctc}
          </span>
        )}
        {company.location && (
          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
            <MapPin size={12} className="text-slate-400" />
            {company.location}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Layers size={12} />
          {company.roundCount} {company.roundCount === 1 ? 'round' : 'rounds'}
        </span>
        {company.stage === 'PPT' ? (
          <span>Pre-placement talk</span>
        ) : (
          <span>Applied {formatDate(company.appliedOn)}</span>
        )}
      </div>
    </>
  )
})

const KanbanCard = memo(function KanbanCard({
  company,
  onSelect,
  onMove,
}: {
  company: Company
  onSelect: (company: Company) => void
  onMove: (company: Company, stage: Stage) => void
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
        'group cursor-grab rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-sm transition-all duration-150',
        'hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing',
        isDragging && 'opacity-30 scale-95',
      )}
    >
      <CardBody company={company} />
      <label
        className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 text-xs font-medium text-slate-500 sm:hidden"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <MoveRight size={14} className="shrink-0 text-indigo-500" />
        <span className="sr-only">Move {company.name} to stage</span>
        <select
          aria-label={`Move ${company.name} to stage`}
          value={company.stage}
          onChange={(event) => onMove(company, event.target.value as Stage)}
          className="min-w-0 flex-1 cursor-pointer bg-transparent py-1 text-xs font-semibold text-slate-600 outline-none"
        >
          {STAGE_ORDER.map((stage) => (
            <option key={stage} value={stage}>
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
}: {
  stage: Stage
  companies: Company[]
  onCardClick: (company: Company) => void
  onMove: (company: Company, stage: Stage) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = STAGE_META[stage]

  return (
    <div ref={setNodeRef} className="flex min-w-0 flex-col">
      {/* Column Header */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full ring-2 ring-white shadow-sm', meta.dot)} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{meta.label}</span>
        </div>
        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">
          {companies.length}
        </span>
      </div>

      {/* Droppable Container */}
      <div
        className={cn(
          'min-h-[14rem] space-y-2.5 rounded-2xl p-2.5 transition-all duration-200',
          isOver
            ? 'border-2 border-dashed border-indigo-400 bg-indigo-50/80 ring-4 ring-indigo-500/10'
            : 'border border-slate-200/60 bg-slate-100/60',
        )}
      >
        {companies.map((company) => (
          <KanbanCard
            key={company.id}
            company={company}
            onSelect={onCardClick}
            onMove={onMove}
          />
        ))}
        {companies.length === 0 && (
          <div className="flex min-h-[10rem] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/40 px-4 text-center text-xs font-medium text-slate-400">
            <span>Drop company here</span>
          </div>
        )}
      </div>
    </div>
  )
})

export function KanbanBoard({ companies, onCardClick }: KanbanBoardProps) {
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            companies={byStage[stage]}
            onCardClick={onCardClick}
            onMove={handleMove}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCompany && (
          <div className="w-80 rotate-2 cursor-grabbing rounded-xl border border-indigo-400 bg-white p-3.5 shadow-2xl shadow-indigo-950/20 ring-2 ring-indigo-500/20">
            <CardBody company={activeCompany} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
