// Shared API types — these mirror the backend DTOs exactly.

export type Stage =
  | 'PPT'
  | 'APPLIED'
  | 'OA'
  | 'SHORTLISTED'
  | 'GD'
  | 'TECH'
  | 'HR'
  | 'OFFER'
  | 'REJECTED'

export type RoundType = 'PPT' | 'OA' | 'GD' | 'TECHNICAL' | 'HR' | 'OTHER'
export type RoundMode = 'ONLINE' | 'OFFLINE'
export type RoundStatus = 'SCHEDULED' | 'COMPLETED' | 'CLEARED' | 'FAILED' | 'CANCELLED'

export interface User {
  id: number
  fullName: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Company {
  id: number
  name: string
  role: string | null
  ctc: string | null
  location: string | null
  jdLink: string | null
  stage: Stage
  appliedOn: string | null
  registeredOnSuperset: boolean
  researchNotes: string | null
  resumeVersion: string | null
  roundCount: number
  createdAt: string
  updatedAt: string
}

export interface RoundConflict {
  roundId: number
  companyName: string
  type: RoundType
  scheduledAt: string
}

export interface Round {
  id: number
  companyId: number
  companyName: string
  type: RoundType
  title: string | null
  scheduledAt: string
  durationMinutes: number
  mode: RoundMode
  meetingLink: string | null
  location: string | null
  status: RoundStatus
  hasJournal: boolean
  addedToCalendar: boolean
  conflicts: RoundConflict[]
  createdAt: string
}

export interface JournalEntry {
  id: number
  roundId: number
  companyId: number
  companyName: string
  roundType: RoundType
  roundScheduledAt: string
  title: string | null
  questionsAsked: string | null
  topics: string | null
  whatWentWell: string | null
  whatFlopped: string | null
  resources: string | null
  rating: number | null
  isShared: boolean
  createdAt: string
  updatedAt: string
}


export type DriveType = 'ON_CAMPUS' | 'OFF_CAMPUS' | 'POOL_CAMPUS' | 'REFERRAL'
export type Verdict = 'SELECTED' | 'REJECTED' | 'WAITLISTED' | 'IN_PROGRESS'
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface Experience {
  id: number
  authorName: string
  authorBatch: string | null
  isAnonymous: boolean
  isAuthor: boolean
  hasLiked: boolean
  companyName: string

  role: string
  ctc: string | null
  location: string | null
  driveType: DriveType
  verdict: Verdict
  difficulty: Difficulty
  title: string
  summary: string | null
  roundsDetails: string | null
  questionsAsked: string | null
  topics: string | null
  tips: string | null
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

export interface ExperienceFilters {
  query?: string
  company?: string
  driveType?: DriveType
  verdict?: Verdict
  difficulty?: Difficulty
  sortBy?: 'latest' | 'helpful'
}

// ---- Request payloads -----------------------------------------------------

export interface CompanyInput {
  name: string
  role: string
  ctc: string
  location: string
  jdLink: string
  stage: Stage
  appliedOn: string | null
  registeredOnSuperset: boolean
  researchNotes: string
  resumeVersion: string
}

export interface RoundInput {
  type: RoundType
  title: string
  scheduledAt: string
  durationMinutes: number
  mode: RoundMode
  meetingLink: string
  location: string
  status: RoundStatus
}

export interface JournalInput {
  title: string
  questionsAsked: string
  topics: string
  whatWentWell: string
  whatFlopped: string
  resources: string
  rating: number | null
}

export interface ExperienceInput {
  companyName: string
  role: string
  ctc?: string
  location?: string
  driveType: DriveType
  verdict: Verdict
  difficulty: Difficulty
  title: string
  summary?: string
  roundsDetails?: string
  questionsAsked?: string
  topics?: string
  tips?: string
  authorBatch?: string
  anonymous: boolean
  journalEntryId?: number
}


