import { z } from 'zod';

export const candidateMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  jobRole: z.string().min(1).max(100),
  yearsExperience: z.number().min(0).max(60),
  education: z.string().max(200),
  status: z.string()
});

export const candidateMissionSchema = z.object({
  day: z.number().int().min(1).max(100),
  title: z.string().max(200),
  passed: z.boolean().optional(),
  attempts: z.number().optional(),
  skipped: z.boolean().optional()
});

export const candidateSignalsSchema = z.object({
  commitDays: z.number().min(0),
  missionsCompleted: z.number().min(0),
  missionsFirstTry: z.number().min(0)
});

export const candidateProfileSchema = z.object({
  member: candidateMemberSchema,
  missions: z.array(candidateMissionSchema),
  signals: candidateSignalsSchema
});

// Schema for Turn 1 Start Session
export const startInterviewSchema = z.object({
  sessionId: z.string({ required_error: 'sessionId is required' }).min(1, 'sessionId cannot be empty'),
  candidate: candidateProfileSchema
});

// Schema for Continuation Turns
export const turnInterviewSchema = z.object({
  sessionId: z.string({ required_error: 'sessionId is required' }).min(1, 'sessionId cannot be empty'),
  // Message is optional to allow session init without a user message
  // Max 4000 chars — prevents DoS via pasted articles / prompt injection
  message: z.string().max(4000, 'Message exceeds 4000 character limit').optional()
});

// Union / Flexible Request Schema
export const interviewRequestSchema = z.object({
  sessionId: z.string({ required_error: 'sessionId is required' }).min(1, 'sessionId cannot be empty'),
  candidate: candidateProfileSchema.optional(),
  message: z.string().max(4000, 'Message exceeds 4000 character limit').optional()
});
