import { z } from 'zod';

// Future responsibility: Zod schema validators for incoming request payloads and outgoing response JSON
export const startInterviewSchema = z.object({
  sessionId: z.string().min(1),
  candidate: z.object({
    member: z.object({
      id: z.string(),
      name: z.string(),
      jobRole: z.string(),
      yearsExperience: z.number(),
      education: z.string(),
      status: z.string()
    }),
    missions: z.array(z.any()),
    signals: z.object({
      commitDays: z.number(),
      missionsCompleted: z.number(),
      missionsFirstTry: z.number()
    })
  })
});

export const turnInterviewSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string()
});
