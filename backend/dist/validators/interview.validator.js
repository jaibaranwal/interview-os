"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interviewRequestSchema = exports.turnInterviewSchema = exports.startInterviewSchema = exports.candidateProfileSchema = exports.candidateSignalsSchema = exports.candidateMissionSchema = exports.candidateMemberSchema = void 0;
const zod_1 = require("zod");
exports.candidateMemberSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    jobRole: zod_1.z.string(),
    yearsExperience: zod_1.z.number(),
    education: zod_1.z.string(),
    status: zod_1.z.string()
});
exports.candidateMissionSchema = zod_1.z.object({
    day: zod_1.z.number(),
    title: zod_1.z.string(),
    passed: zod_1.z.boolean().optional(),
    attempts: zod_1.z.number().optional(),
    skipped: zod_1.z.boolean().optional()
});
exports.candidateSignalsSchema = zod_1.z.object({
    commitDays: zod_1.z.number(),
    missionsCompleted: zod_1.z.number(),
    missionsFirstTry: zod_1.z.number()
});
exports.candidateProfileSchema = zod_1.z.object({
    member: exports.candidateMemberSchema,
    missions: zod_1.z.array(exports.candidateMissionSchema),
    signals: exports.candidateSignalsSchema
});
// Schema for Turn 1 Start Session
exports.startInterviewSchema = zod_1.z.object({
    sessionId: zod_1.z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
    candidate: exports.candidateProfileSchema
});
// Schema for Continuation Turns
exports.turnInterviewSchema = zod_1.z.object({
    sessionId: zod_1.z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
    message: zod_1.z.string().optional()
});
// Union / Flexible Request Schema
exports.interviewRequestSchema = zod_1.z.object({
    sessionId: zod_1.z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
    candidate: exports.candidateProfileSchema.optional(),
    message: zod_1.z.string().optional()
});
