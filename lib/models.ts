import { z } from 'zod'

// Enums
export const UserRole = {
  RECRUITER: 'RECRUITER',
  INTERVIEWER: 'INTERVIEWER', 
  HIRING_MANAGER: 'HIRING_MANAGER',
  VIEWER: 'VIEWER'
} as const

export const CandidateStatus = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING', 
  INTERVIEW: 'INTERVIEW',
  PASSED: 'PASSED',
  REJECTED: 'REJECTED',
  OFFER: 'OFFER'
} as const

export const CandidateLevel = {
  Junior: 'Junior',
  Mid: 'Mid', 
  Senior: 'Senior'
} as const

export const LiveCodeVerdict = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  ON_HOLD: 'ON_HOLD'
} as const

// Zod schemas for validation
export const UserSchema = z.object({
  _id: z.string().optional(),
  clerkId: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum([UserRole.RECRUITER, UserRole.INTERVIEWER, UserRole.HIRING_MANAGER, UserRole.VIEWER]),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deactivatedAt: z.date().optional().nullable(),
  lastLoginAt: z.date().optional().nullable(),
  invitedBy: z.string().optional().nullable(), // User ID who invited this user
  invitedAt: z.date().optional().nullable(),
})

export const CandidateSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  project: z.string().optional().nullable(),
  interviewerId: z.string().optional().nullable(),
  interviewSchedule: z.string().datetime().optional().nullable(),
  professionalExperience: z.string().optional().nullable(),
  mainLanguage: z.string().optional().nullable(),
  database: z.string().optional().nullable(),
  cloud: z.string().optional().nullable(),
  anotherTech: z.array(z.string()).default([]),
  liveCodeResult: z.string().optional().nullable(),
  status: z.enum([
    CandidateStatus.APPLIED,
    CandidateStatus.SCREENING,
    CandidateStatus.INTERVIEW, 
    CandidateStatus.PASSED,
    CandidateStatus.REJECTED,
    CandidateStatus.OFFER
  ]).default(CandidateStatus.APPLIED),
  level: z.enum([CandidateLevel.Junior, CandidateLevel.Mid, CandidateLevel.Senior]).optional().nullable(),
  mirror: z.string().optional().nullable(),
  liveCodeVerdict: z.enum([LiveCodeVerdict.PASS, LiveCodeVerdict.FAIL, LiveCodeVerdict.ON_HOLD]).optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().optional().nullable()
})

export const NoteSchema = z.object({
  _id: z.string().optional(),
  candidateId: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  body: z.string().min(1, "Note body is required"),
  createdAt: z.date().optional()
})

export const AuditSchema = z.object({
  _id: z.string().optional(),
  entityType: z.string(),
  entityId: z.string(),
  action: z.string(),
  diff: z.record(z.string(), z.any()).optional(),
  actorId: z.string(),
  actorName: z.string(),
  createdAt: z.date().optional()
})

// CSV import schema
export const CandidateCSVSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.string().min(1, "Role is required"),
  project: z.string().optional(),
  interviewer: z.string().optional(),
  interview_schedule: z.string().optional(),
  professional_experience: z.string().optional(),
  main_language: z.string().optional(),
  database: z.string().optional(),
  cloud: z.string().optional(),
  another_tech: z.string().optional(),
  live_code_result: z.string().optional(),
  status: z.string().optional(),
  level: z.string().optional(),
  mirror: z.string().optional()
})

// Types
export type User = z.infer<typeof UserSchema>
export type Candidate = z.infer<typeof CandidateSchema>
export type Note = z.infer<typeof NoteSchema>
export type Audit = z.infer<typeof AuditSchema>
export type CandidateCSV = z.infer<typeof CandidateCSVSchema>

export type UserRoleType = keyof typeof UserRole
export type CandidateStatusType = keyof typeof CandidateStatus
export type CandidateLevelType = keyof typeof CandidateLevel
export type LiveCodeVerdictType = keyof typeof LiveCodeVerdict
