"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewController = void 0;
const InterviewEngine_1 = require("../services/InterviewEngine");
const interview_validator_1 = require("../validators/interview.validator");
const logger_1 = require("../utils/logger");
class InterviewController {
    interviewEngine;
    constructor(interviewEngine = new InterviewEngine_1.InterviewEngine()) {
        this.interviewEngine = interviewEngine;
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
        try {
            // 2. Delegate to InterviewEngine orchestrator
            const response = await this.interviewEngine.processTurn(parseResult.data);
            res.status(200).json(response);
        }
        catch (err) {
            logger_1.Logger.error(`InterviewController error on session '${req.body?.sessionId}':`, err.message);
            res.status(400).json({
                error: 'Bad Request',
                details: err.message
            });
        }
    };
}
exports.InterviewController = InterviewController;
