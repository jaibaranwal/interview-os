"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnInterviewSchema = exports.startInterviewSchema = void 0;
const zod_1 = require("zod");
// Future responsibility: Zod schema validators for incoming request payloads and outgoing response JSON
exports.startInterviewSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    candidate: zod_1.z.object({
        member: zod_1.z.object({
            id: zod_1.z.string(),
            name: zod_1.z.string(),
            jobRole: zod_1.z.string(),
            yearsExperience: zod_1.z.number(),
            education: zod_1.z.string(),
            status: zod_1.z.string()
        }),
        missions: zod_1.z.array(zod_1.z.any()),
        signals: zod_1.z.object({
            commitDays: zod_1.z.number(),
            missionsCompleted: zod_1.z.number(),
            missionsFirstTry: zod_1.z.number()
        })
    })
});
exports.turnInterviewSchema = zod_1.z.object({
    sessionId: zod_1.z.string().min(1),
    message: zod_1.z.string()
});
