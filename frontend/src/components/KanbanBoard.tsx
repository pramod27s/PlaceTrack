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
import { CircleCheckBig, MapPin, MoveRight } from 'lucide-react'
import { useUpdateCompanyStage } from '../hooks/queries'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn, formatDate } from '../lib/format'
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
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">{company.name}</p>
        {company.registeredOnSuperset && (
          <span title="Registered on Superset">
            <CircleCheckBig size={15} className="shrink-0 text-emerald-500" />
          </span>
        )}
      </div>
      {company.role && (
        <p className="mt-0.5 truncate text-xs text-slate-500">{company.role}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
        {company.ctc && <span className="font-medium text-slate-500">{company.ctc}</span>}
        {company.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {company.location}
          </span>
        )}
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
        <span>
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
  // Only animate color/border on hover — leaving `transition` (all properties)
  // here causes dnd-kit's per-frame transform updates to fight a CSS transition
  // and produces visible drag lag.
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
        'cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors',
        'hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:cursor-grabbing',
        isDragging && 'opacity-40',
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
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
        <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {companies.length}
        </span>
      </div>
      <div
        className={cn(
          'min-h-[11rem] space-y-2 rounded-lg border-2 border-dashed p-2 transition-colors',
          isOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-transparent bg-slate-100/70',
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
          <div className="flex min-h-[9rem] items-center justify-center rounded-md border border-dashed border-slate-200 bg-white/45 px-4 text-center text-xs font-medium text-slate-400">
            Drag cards here
          </div>
        )}
      </div>
    </div>
  )
})

export function KanbanBoard({ companies, onCardClick }: KanbanBoardProps) {
  const updateStage = useUpdateCompanyStage()
  const [activeId, setActiveId] = useState<number | null>(null)

  // A small drag threshold lets a plain click still open the company.
  // On touch screens, a short hold distinguishes dragging from page scrolling.
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
        updateStage.mutate({ id: company.id, stage: targetStage })
      }
    },
    [companies, updateStage],
  )

  const handleDragCancel = useCallback(() => setActiveId(null), [])

  const handleMove = useCallback(
    (company: Company, stage: Stage) => {
      if (company.stage !== stage) updateStage.mutate({ id: company.id, stage })
    },
    [updateStage],
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
          <div className="w-80 rotate-2 cursor-grabbing rounded-lg border border-indigo-300 bg-white p-3 shadow-xl">
            <CardBody company={activeCompany} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
