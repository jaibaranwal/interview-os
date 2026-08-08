"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewRequestSchema = exports.turnInterviewSchema = exports.startInterviewSchema = exports.candidateProfileSchema = exports.candidateSignalsSchema = exports.candidateMissionSchema = exports.candidateMemberSchema = void 0;
const zod_1 = require("zod");
exports.candidateMemberSchema = zod_1.z.object({
    id: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1).max(100),
    jobRole: zod_1.z.string().min(1).max(100),
    yearsExperience: zod_1.z.number().min(0).max(60),
    education: zod_1.z.string().max(200),
    status: zod_1.z.string()
});
exports.candidateMissionSchema = zod_1.z.object({
    day: zod_1.z.number().int().min(1).max(100),
    title: zod_1.z.string().max(200),
    passed: zod_1.z.boolean().optional(),
    attempts: zod_1.z.number().optional(),
    skipped: zod_1.z.boolean().optional()
});
exports.candidateSignalsSchema = zod_1.z.object({
    commitDays: zod_1.z.number().min(0),
    missionsCompleted: zod_1.z.number().min(0),
    missionsFirstTry: zod_1.z.number().min(0)
});
exports.candidateProfileSchema = zod_1.z.object({
    member: exports.candidateMemberSchema,
    missions: zod_1.z.array(exports.candidateMissionSchema),
    signals: exports.candidateSignalsSchema
});
// Schema for Turn 1 Start Session
exports.startInterviewSchema = zod_1.z.object({
    sessionId: zod_1.z.string({ required_error: 'sessionId is required' }).min(1, 'sessionId cannot be empty'),
    candidate: exports.candidateProfileSchema
});
// Schema for Continuation Turns
exports.turnInterviewSchema = zod_1.z.object({
    sessionId: zod_1.z.string({ required_error: 'sessionId is required' }).min(1, 'sessionId cannot be empty'),
    // Message is optional to allow session init without a user message
    // Max 4000 chars — prevents DoS via pasted articles / prompt injection
    message: zod_1.z.string().max(4000, 'Message exceeds 4000 character limit').optional()
});
// Union / Flexible Request Schema
exports.interviewRequestSchema = zod_1.z.object({
    sessionId: zod_1.z.string({ required_error: 'sessionId is required' }).min(1, 'sessionId cannot be empty'),
    candidate: exports.candidateProfileSchema.optional(),
    message: zod_1.z.string().max(4000, 'Message exceeds 4000 character limit').optional()
});
