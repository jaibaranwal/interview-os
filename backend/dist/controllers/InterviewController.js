"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = void 0;
const SessionManager_1 = require("../services/SessionManager");
const interview_validator_1 = require("../validators/interview.validator");
const logger_1 = require("../utils/logger");
class InterviewController {
    sessionManager;
    constructor(sessionManager = SessionManager_1.SessionManager.getInstance()) {
        this.sessionManager = sessionManager;
    }
    handleInterview = async (req, res) => {
        // 1. Validate payload with Zod
        const parseResult = interview_validator_1.interviewRequestSchema.safeParse(req.body);
        if (!parseResult.success) {
            const errorMsg = parseResult.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            res.status(400).json({
                error: 'Bad Request',
                details: errorMsg
            });
            return;
        }
        const { sessionId, candidate, message } = parseResult.data;
        // 2. Check session existence
        if (!this.sessionManager.hasSession(sessionId)) {
            // New Session Initialization
            if (!candidate) {
                res.status(400).json({
                    error: 'Bad Request',
                    details: "New session initialization requires a valid 'candidate' profile object."
                });
                return;
            }
            // Create session
            const session = this.sessionManager.createSession(sessionId, candidate);
            logger_1.Logger.info(`Initialized new session '${sessionId}' for candidate '${candidate.member.name}' (${candidate.member.id}).`);
            res.status(200).json({
                reply: 'Interview initialized successfully.',
                done: false
            });
            return;
        }
        // Existing Session Turn
        const existingSession = this.sessionManager.getSession(sessionId);
        if (message) {
            const updatedMessages = [
                ...existingSession.messages,
                { role: 'candidate', content: message, timestamp: new Date() }
            ];
            this.sessionManager.updateSession(sessionId, { messages: updatedMessages });
            logger_1.Logger.info(`Updated session '${sessionId}' with candidate message (${message.length} chars).`);
        }
        res.status(200).json({
            reply: 'Session found.',
            done: false
        });
    };
}
exports.InterviewController = InterviewController;
