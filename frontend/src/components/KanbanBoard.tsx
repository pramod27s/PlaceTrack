import { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { CircleCheckBig, MapPin } from 'lucide-react'
import { useUpdateCompanyStage } from '../hooks/queries'
import { STAGE_META, STAGE_ORDER } from '../lib/constants'
import { cn, formatDate } from '../lib/format'
import type { Company, Stage } from '../lib/types'

interface KanbanBoardProps {
  companies: Company[]
  onCardClick: (company: Company) => void
}

/** The visual content of a company card, shared by the board and the drag overlay. */
function CardBody({ company }: { company: Company }) {
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
        <span>Applied {formatDate(company.appliedOn)}</span>
      </div>
    </>
  )
}

function KanbanCard({
  company,
  onClick,
}: {
  company: Company
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(company.id),
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        'cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition',
        'hover:border-indigo-300 hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-40',
      )}
    >
      <CardBody company={company} />
    </div>
  )
}

function KanbanColumn({
  stage,
  companies,
  onCardClick,
}: {
  stage: Stage
  companies: Company[]
  onCardClick: (company: Company) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = STAGE_META[stage]

  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
        <span className="text-sm font-semibold text-slate-700">{meta.label}</span>
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {companies.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'min-h-[11rem] space-y-2 rounded-lg border-2 border-dashed p-2 transition',
          isOver
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-transparent bg-slate-100/70',
        )}
      >
        {companies.map((company) => (
          <KanbanCard
            key={company.id}
            company={company}
            onClick={() => onCardClick(company)}
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
}

export function KanbanBoard({ companies, onCardClick }: KanbanBoardProps) {
  const updateStage = useUpdateCompanyStage()
  const [activeId, setActiveId] = useState<number | null>(null)

  // A small drag threshold lets a plain click still open the company.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const byStage = useMemo(() => {
    const groups: Record<Stage, Company[]> = {
      APPLIED: [],
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

  const activeCompany = companies.find((c) => c.id === activeId) ?? null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const company = companies.find((c) => c.id === Number(active.id))
    const targetStage = over.id as Stage
    if (company && company.stage !== targetStage) {
      updateStage.mutate({ id: company.id, stage: targetStage })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            companies={byStage[stage]}
            onCardClick={onCardClick}
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
