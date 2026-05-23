import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type {
  AnalyticsOverview,
  Company,
  CompanyInput,
  JournalEntry,
  JournalInput,
  Round,
  RoundInput,
  Stage,
} from '../lib/types'

/** Centralised query keys so invalidation stays consistent. */
export const qk = {
  companies: ['companies'] as const,
  company: (id: number) => ['company', id] as const,
  companyRounds: (id: number) => ['company-rounds', id] as const,
  rounds: ['rounds'] as const,
  upcoming: ['rounds', 'upcoming'] as const,
  journal: (roundId: number) => ['journal', roundId] as const,
  journalAll: ['journal-all'] as const,
  analytics: ['analytics'] as const,
}

// ---------------------------------------------------------------- Companies

export function useCompanies() {
  return useQuery({
    queryKey: qk.companies,
    queryFn: async () => (await api.get<Company[]>('/companies')).data,
  })
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: qk.company(id),
    queryFn: async () => (await api.get<Company>(`/companies/${id}`)).data,
    enabled: Number.isFinite(id),
  })
}

export function useSaveCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id?: number; input: CompanyInput }) => {
      const res = id
        ? await api.put<Company>(`/companies/${id}`, input)
        : await api.post<Company>('/companies', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.companies })
      qc.invalidateQueries({ queryKey: ['company'] })
      qc.invalidateQueries({ queryKey: qk.analytics })
    },
  })
}

/** Optimistic stage move — keeps the Kanban board snappy during drag-and-drop. */
export function useUpdateCompanyStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: Stage }) =>
      (await api.patch<Company>(`/companies/${id}/stage`, { stage })).data,
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: qk.companies })
      const previous = qc.getQueryData<Company[]>(qk.companies)
      if (previous) {
        qc.setQueryData<Company[]>(
          qk.companies,
          previous.map((c) => (c.id === id ? { ...c, stage } : c)),
        )
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(qk.companies, context.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.companies })
      qc.invalidateQueries({ queryKey: qk.analytics })
    },
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/companies/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.companies })
      qc.invalidateQueries({ queryKey: qk.rounds })
      qc.invalidateQueries({ queryKey: qk.upcoming })
      qc.invalidateQueries({ queryKey: qk.analytics })
    },
  })
}

// ------------------------------------------------------------------- Rounds

export function useCompanyRounds(companyId: number) {
  return useQuery({
    queryKey: qk.companyRounds(companyId),
    queryFn: async () =>
      (await api.get<Round[]>(`/companies/${companyId}/rounds`)).data,
    enabled: Number.isFinite(companyId),
  })
}

export function useAllRounds() {
  return useQuery({
    queryKey: qk.rounds,
    queryFn: async () => (await api.get<Round[]>('/rounds')).data,
  })
}

export function useUpcomingRounds() {
  return useQuery({
    queryKey: qk.upcoming,
    queryFn: async () => (await api.get<Round[]>('/rounds/upcoming')).data,
  })
}

function invalidateRoundData(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['company-rounds'] })
  qc.invalidateQueries({ queryKey: qk.rounds })
  qc.invalidateQueries({ queryKey: qk.upcoming })
  qc.invalidateQueries({ queryKey: qk.analytics })
  qc.invalidateQueries({ queryKey: qk.companies })
}

export function useSaveRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      roundId,
      companyId,
      input,
    }: {
      roundId?: number
      companyId?: number
      input: RoundInput
    }) => {
      const res = roundId
        ? await api.put<Round>(`/rounds/${roundId}`, input)
        : await api.post<Round>(`/companies/${companyId}/rounds`, input)
      return res.data
    },
    onSuccess: () => invalidateRoundData(qc),
  })
}

export function useDeleteRound() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (roundId: number) => {
      await api.delete(`/rounds/${roundId}`)
    },
    onSuccess: () => invalidateRoundData(qc),
  })
}

// ------------------------------------------------------------------ Journal

export function useRoundJournal(roundId: number) {
  return useQuery({
    queryKey: qk.journal(roundId),
    queryFn: async () => {
      const res = await api.get<JournalEntry>(`/rounds/${roundId}/journal`)
      // 204 No Content -> no entry written yet.
      return res.status === 204 ? null : res.data
    },
    enabled: Number.isFinite(roundId),
  })
}

export function useAllJournal() {
  return useQuery({
    queryKey: qk.journalAll,
    queryFn: async () => (await api.get<JournalEntry[]>('/journal')).data,
  })
}

export function useSaveJournal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ roundId, input }: { roundId: number; input: JournalInput }) =>
      (await api.put<JournalEntry>(`/rounds/${roundId}/journal`, input)).data,
    onSuccess: (_data, { roundId }) => {
      qc.invalidateQueries({ queryKey: qk.journal(roundId) })
      qc.invalidateQueries({ queryKey: qk.journalAll })
      qc.invalidateQueries({ queryKey: ['company-rounds'] })
      qc.invalidateQueries({ queryKey: qk.rounds })
      qc.invalidateQueries({ queryKey: qk.analytics })
    },
  })
}

// ---------------------------------------------------------------- Analytics

export function useAnalytics() {
  return useQuery({
    queryKey: qk.analytics,
    queryFn: async () =>
      (await api.get<AnalyticsOverview>('/analytics/overview')).data,
  })
}
