import { z } from 'zod';

export const candidateMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  jobRole: z.string(),
  yearsExperience: z.number(),
  education: z.string(),
  status: z.string()
});

export const candidateMissionSchema = z.object({
  day: z.number(),
  title: z.string(),
  passed: z.boolean().optional(),
  attempts: z.number().optional(),
  skipped: z.boolean().optional()
});

export const candidateSignalsSchema = z.object({
  commitDays: z.number(),
  missionsCompleted: z.number(),
  missionsFirstTry: z.number()
});

export const candidateProfileSchema = z.object({
  member: candidateMemberSchema,
  missions: z.array(candidateMissionSchema),
  signals: candidateSignalsSchema
});

// Schema for Turn 1 Start Session
export const startInterviewSchema = z.object({
  sessionId: z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
  candidate: candidateProfileSchema
});

// Schema for Continuation Turns
export const turnInterviewSchema = z.object({
  sessionId: z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
  message: z.string().optional()
});

// Union / Flexible Request Schema
export const interviewRequestSchema = z.object({
  sessionId: z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
  candidate: candidateProfileSchema.optional(),
  message: z.string().optional()
});
