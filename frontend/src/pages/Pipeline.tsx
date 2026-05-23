import { useState } from 'react'
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

  if (isLoading) return <LoadingState label="Loading your pipeline…" />
  if (isError || !companies) return <ErrorNote message="Couldn't load your pipeline. Please retry." />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your pipeline</h2>
          <p className="text-sm text-slate-500">
            {companies.length} {companies.length === 1 ? 'company' : 'companies'} · drag a card
            to move it between stages
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add company
        </Button>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={<Building2 size={22} />}
          title="No companies yet"
          description="Add the first company you've applied to and start building your placement pipeline."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Add your first company
            </Button>
          }
        />
      ) : (
        <KanbanBoard
          companies={companies}
          onCardClick={(company) => navigate(`/companies/${company.id}`)}
        />
      )}

      <CompanyModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
