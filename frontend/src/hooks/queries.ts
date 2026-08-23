import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toDateTimeLocal } from '../lib/format'
import type {
  AnalyticsOverview,
  Company,
  CompanyInput,
  JournalEntry,
  JournalInput,
  Round,
  RoundInput,
  RoundStatus,
  Stage,
} from '../lib/types'

/** Centralised query keys so invalidation stays consistent. */
export const qk = {
  companies: ['companies'] as const,
  company: (id: number) => ['company', id] as const,
  companyRounds: (id: number) => ['company-rounds', id] as const,
  rounds: ['rounds'] as const,
  upcoming: ['rounds', 'upcoming'] as const,
  roundJournals: (roundId: number) => ['journal', 'round', roundId] as const,
  journalAll: ['journal-all'] as const,
  analytics: ['analytics'] as const,
}

// ---------------------------------------------------------------- Companies

export function useCompanies() {
  return useQuery({
    queryKey: qk.companies,
    queryFn: async ({ signal }) => (await api.get<Company[]>('/companies', { signal })).data,
  })
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: qk.company(id),
    queryFn: async ({ signal }) =>
      (await api.get<Company>(`/companies/${id}`, { signal })).data,
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
  const latestStageByCompany = useRef(new Map<number, Stage>())
  return useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: Stage }) =>
      (await api.patch<Company>(`/companies/${id}/stage`, { stage })).data,
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: qk.companies })
      latestStageByCompany.current.set(id, stage)
      const previous = qc.getQueryData<Company[]>(qk.companies)
      if (previous) {
        qc.setQueryData<Company[]>(
          qk.companies,
          previous.map((c) => (c.id === id ? { ...c, stage } : c)),
        )
      }
      return { previous }
    },
    // Use the server's confirmed Company as the new authoritative cache value
    // for that one row — no refetch race, and rapid back-to-back drags don't
    // get squashed by a stale GET.
    onSuccess: (data, { id, stage }) => {
      if (latestStageByCompany.current.get(id) !== stage) return
      qc.setQueryData<Company[]>(qk.companies, (prev) =>
        prev ? prev.map((c) => (c.id === id ? data : c)) : prev,
      )
      qc.setQueryData(qk.company(id), data)
    },
    onError: (_err, { id, stage }, context) => {
      if (latestStageByCompany.current.get(id) !== stage) return
      if (context?.previous) qc.setQueryData(qk.companies, context.previous)
    },
    onSettled: (_data, _error, { id, stage }) => {
      if (latestStageByCompany.current.get(id) === stage) {
        latestStageByCompany.current.delete(id)
      }
      // Only refresh analytics. The companies cache is already up-to-date via
      // onMutate's optimistic update and onSuccess's authoritative replace,
      // so re-fetching here would just create the snap-back race.
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

export function useUpdateRoundStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ round, status }: { round: Round; status: RoundStatus }) => {
      const input: RoundInput = {
        type: round.type,
        title: round.title ?? '',
        scheduledAt: toDateTimeLocal(round.scheduledAt),
        durationMinutes: round.durationMinutes,
        mode: round.mode,
        meetingLink: round.meetingLink ?? '',
        location: round.location ?? '',
        status: status,
      }
      return (await api.put<Round>(`/rounds/${round.id}`, input)).data
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

export function useRoundJournals(roundId: number) {
  return useQuery({
    queryKey: qk.roundJournals(roundId),
    queryFn: async () =>
      (await api.get<JournalEntry[]>(`/rounds/${roundId}/journal`)).data,
    enabled: Number.isFinite(roundId),
  })
}

export function useAllJournal() {
  return useQuery({
    queryKey: qk.journalAll,
    queryFn: async () => (await api.get<JournalEntry[]>('/journal')).data,
  })
}

function invalidateJournalData(qc: ReturnType<typeof useQueryClient>, roundId?: number) {
  if (roundId !== undefined) {
    qc.invalidateQueries({ queryKey: qk.roundJournals(roundId) })
  } else {
    qc.invalidateQueries({ queryKey: ['journal', 'round'] })
  }
  qc.invalidateQueries({ queryKey: qk.journalAll })
  qc.invalidateQueries({ queryKey: ['company-rounds'] })
  qc.invalidateQueries({ queryKey: qk.rounds })
  qc.invalidateQueries({ queryKey: qk.upcoming })
  qc.invalidateQueries({ queryKey: qk.analytics })
}

export function useCreateJournal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ roundId, input }: { roundId: number; input: JournalInput }) =>
      (await api.post<JournalEntry>(`/rounds/${roundId}/journal`, input)).data,
    onSuccess: (_data, { roundId }) => invalidateJournalData(qc, roundId),
  })
}

export function useUpdateJournal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      entryId,
      input,
    }: {
      entryId: number
      roundId: number
      input: JournalInput
    }) => (await api.put<JournalEntry>(`/journal/${entryId}`, input)).data,
    onSuccess: (_data, { roundId }) => invalidateJournalData(qc, roundId),
  })
}

export function useDeleteJournal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ entryId }: { entryId: number; roundId: number }) => {
      await api.delete(`/journal/${entryId}`)
    },
    onSuccess: (_data, { roundId }) => invalidateJournalData(qc, roundId),
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
