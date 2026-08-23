import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'
import { useCompanies } from '../hooks/queries'
import { KanbanBoard } from '../components/KanbanBoard'
import { CompanyModal } from '../components/CompanyModal'
import { Button, EmptyState, ErrorNote, LoadingState } from '../components/ui'

export default function Pipeline() {
  const navigate = useNavigate()
  const { data: companies, isLoading, isError } = useCompanies()
  const [modalOpen, setModalOpen] = useState(false)

  const handleCardClick = useCallback(
    (company: { id: number }) => navigate(`/companies/${company.id}`),
    [navigate],
  )

  if (isLoading) return <LoadingState label="Loading your pipeline…" />
  if (isError || !companies) return <ErrorNote message="Couldn't load your pipeline. Please retry." />

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Placement Pipeline</h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">
              {companies.length} {companies.length === 1 ? 'company' : 'companies'}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Drag cards across stages to update your application progress in real-time.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {companies.length === 0 ? (
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
      ) : (
        <KanbanBoard companies={companies} onCardClick={handleCardClick} />
      )}

      <CompanyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
