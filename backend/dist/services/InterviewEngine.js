"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewEngine = void 0;
const SessionManager_1 = require("./SessionManager");
const ConversationMemory_1 = require("../memory/ConversationMemory");
const CandidateAnalyzer_1 = require("../engine/CandidateAnalyzer");
const ResponseEvaluator_1 = require("../engine/ResponseEvaluator");
const QuestionGenerator_1 = require("../engine/QuestionGenerator");
const CurriculumNavigator_1 = require("../engine/CurriculumNavigator");
const InterviewStateManager_1 = require("../engine/InterviewStateManager");
const StateMachine_1 = require("../engine/StateMachine");
const DifficultyEngine_1 = require("./DifficultyEngine");
const FeedbackEngine_1 = require("./FeedbackEngine");
const logger_1 = require("../utils/logger");
class InterviewEngine {
    sessionManager;
    candidateAnalyzer;
    responseEvaluator;
    questionGenerator;
    curriculumNavigator;
    difficultyEngine;
    feedbackEngine;
    constructor(sessionManager = SessionManager_1.SessionManager.getInstance(), candidateAnalyzer = new CandidateAnalyzer_1.CandidateAnalyzer(), responseEvaluator = new ResponseEvaluator_1.ResponseEvaluator(), questionGenerator = new QuestionGenerator_1.QuestionGenerator(), curriculumNavigator = new CurriculumNavigator_1.CurriculumNavigator(), difficultyEngine = new DifficultyEngine_1.DifficultyEngine(), feedbackEngine = new FeedbackEngine_1.FeedbackEngine()) {
        this.sessionManager = sessionManager;
        this.candidateAnalyzer = candidateAnalyzer;
        this.responseEvaluator = responseEvaluator;
        this.questionGenerator = questionGenerator;
        this.curriculumNavigator = curriculumNavigator;
        this.difficultyEngine = difficultyEngine;
        this.feedbackEngine = feedbackEngine;
    }
    async processTurn(req) {
        const startTime = Date.now();
        const sessionId = req.sessionId;
        let llmCallCount = 0; // Instrument LLM call counter per turn (Max 2 for candidate turns, 0 for greeting)
        // ─── 1. Session Setup & Context Recovery ───────────────────────────────
        let session = this.sessionManager.getSession(sessionId);
        if (!session && 'candidate' in req) {
            session = this.sessionManager.createSession(sessionId, req.candidate);
        }
        if (!session) {
            throw new Error(`Session '${sessionId}' not found. Please initialize a session with a candidate profile first.`);
        }
        // Initialize memory on first turn
        if (!session.metadata.memory) {
            const memory = new ConversationMemory_1.ConversationMemory();
            const initialDifficulty = this.difficultyEngine.calculateInitialDifficulty(session.candidate);
            memory.setDifficulty(initialDifficulty);
            session.metadata.memory = memory;
        }
        const memory = session.metadata.memory;
        // Restore InterviewStateManager from persisted session metadata
        let stateManager;
        if (session.metadata.stateManagerData) {
            stateManager = InterviewStateManager_1.InterviewStateManager.restore(session.metadata.stateManagerData);
        }
        else {
            stateManager = new InterviewStateManager_1.InterviewStateManager(StateMachine_1.InterviewState.GREETING);
        }
        // Active curriculum day from session metadata
        let currentDay = session.metadata.currentDay;
        if (!currentDay) {
            currentDay = this.curriculumNavigator.getInitialDay(session.candidate);
            session.metadata.currentDay = currentDay;
        }
        const topicBefore = `Day ${currentDay.day}: ${currentDay.title}`;
        const askedQuestions = memory.getAskedQuestions();
        const lastQuestionRecord = askedQuestions.length > 0 ? askedQuestions[askedQuestions.length - 1] : undefined;
        const lastQuestionText = lastQuestionRecord?.text;
        const incomingMessage = 'message' in req ? req.message : undefined;
        // ── Prompt 26 Rule 4: Repeat-Question Intent Recognition ──
        const isRepeatIntent = (msg) => {
            if (!msg)
                return false;
            const lower = msg.trim().toLowerCase();
            return (lower === 'repeat' ||
                lower === 'repeat please' ||
                lower === 'please repeat' ||
                lower === 'can you repeat' ||
                lower === 'could you repeat' ||
                lower === 'say again' ||
                lower === 'previous question' ||
                lower === 'what was the question' ||
                lower === 'pardon');
        };
        if (incomingMessage && isRepeatIntent(incomingMessage) && lastQuestionText) {
            logger_1.Logger.info(`[INTENT] Repeat-question requested by candidate — resending last interviewer question.`);
            const latencyMs = Date.now() - startTime;
            return {
                reply: lastQuestionText,
                done: false,
                questionCount: memory.getQuestionCount(),
                visitedDaysCount: memory.getVisitedDays().length,
                difficulty: memory.getDifficulty(),
                currentState: stateManager.getState(),
                currentDayTitle: topicBefore,
                llmCallCount: 0
            };
        }
        // ─── 2. Evaluate Candidate Response & Execute State Transitions ─────────
        let evaluation;
        let transitionReason = 'Session initialization / greeting';
        let isConsecutiveInvalidAdvance = false;
        if (incomingMessage && incomingMessage.trim().length > 0) {
            const previousAnswer = memory.getLastCandidateAnswer();
            memory.recordAnswer(incomingMessage);
            const recentContext = memory.getRecentContext(3);
            // LLM Call #1: Candidate Answer Evaluation
            llmCallCount++;
            evaluation = await this.responseEvaluator.evaluateResponse(incomingMessage, currentDay, lastQuestionText, recentContext, previousAnswer);
            memory.recordEvaluation(evaluation, currentDay.day);
            // Update Difficulty Scalar
            const updatedDifficulty = this.difficultyEngine.updateDifficulty(memory.getDifficulty(), evaluation);
            memory.setDifficulty(updatedDifficulty);
            // Advance State Machine Deterministically
            const decision = stateManager.processEvaluation(evaluation, currentDay.day);
            transitionReason = decision.reason;
            isConsecutiveInvalidAdvance = decision.isConsecutiveInvalidAdvance || false;
            // Record conversation turn for context window
            if (lastQuestionText) {
                memory.recordConversationTurn(lastQuestionText, incomingMessage, currentDay.day, currentDay.title);
            }
            // Advance Topic Day ONLY IF LLM explicitly returned 'advance' OR retry/follow-up limit reached
            if (decision.shouldAdvanceTopic) {
                const nextDay = this.curriculumNavigator.getNextTargetDay(session.candidate, memory.getVisitedDays());
                if (nextDay && nextDay.day !== currentDay.day) {
                    currentDay = nextDay;
                    session.metadata.currentDay = currentDay;
                }
            }
        }
        const topicAfter = `Day ${currentDay.day}: ${currentDay.title}`;
        const currentState = stateManager.getState();
        const currentRetryCount = stateManager.getRetryCount(currentDay.day);
        const currentFollowUpCount = stateManager.getFollowUpCount(currentDay.day);
        // ─── 3. Check Interview Completion Criteria ──────────────────────────────
        const isCoverageMet = this.curriculumNavigator.isCoverageComplete(memory.getVisitedDays(), memory.getQuestionCount());
        if (isCoverageMet || evaluation?.next_action === 'terminate') {
            stateManager.completeInterview();
            // Final summary feedback — 1 LLM call or deterministic fallback
            llmCallCount++;
            const feedback = await this.feedbackEngine.generateFeedback(session.candidate, memory);
            session.metadata.feedback = feedback;
            const candidateName = session.candidate.member.name;
            const visitedCount = memory.getVisitedDays().length;
            const questionCount = memory.getQuestionCount();
            const completionReply = `Thank you, ${candidateName}. That concludes our adaptive technical interview covering ${visitedCount} curriculum topic${visitedCount !== 1 ? 's' : ''} across ${questionCount} evaluated question${questionCount !== 1 ? 's' : ''}. Your performance report is ready for review.`;
            const updatedMessages = [
                ...session.messages,
                ...(incomingMessage ? [{ role: 'candidate', content: incomingMessage, timestamp: new Date() }] : []),
                { role: 'interviewer', content: completionReply, timestamp: new Date() }
            ];
            session.metadata.stateManagerData = stateManager.serialize();
            session.metadata.state = stateManager.getState();
            this.sessionManager.updateSession(sessionId, {
                messages: updatedMessages,
                metadata: session.metadata
            });
            const latencyMs = Date.now() - startTime;
            logger_1.Logger.info(`[METRIC] Session ${sessionId} COMPLETED | LLM Calls: ${llmCallCount} | Latency: ${latencyMs}ms`);
            return {
                reply: completionReply,
                done: true,
                feedback,
                questionCount: memory.getQuestionCount(),
                visitedDaysCount: memory.getVisitedDays().length,
                difficulty: memory.getDifficulty(),
                currentState: stateManager.getState(),
                currentDayTitle: topicAfter,
                llmCallCount
            };
        }
        // ─── 4. Generate Grounded Interviewer Question ───────────────────────────
        let questionText = '';
        // OPTIMIZATION: Turn 0 (Session Init / Greeting) uses cached template — 0 LLM calls!
        if (!incomingMessage || currentState === StateMachine_1.InterviewState.GREETING) {
            const toolsText = currentDay.tools.slice(0, 2).join(' and ');
            questionText = `Welcome, ${session.candidate.member.name}. Let's begin our technical interview focusing on Day ${currentDay.day}: ${currentDay.title}. To start, walk me through how you used ${toolsText} in your project.`;
        }
        else {
            // LLM Call #2: Question Generation for Turn 1..N
            llmCallCount++;
            const recentContextForQuestion = memory.getRecentContext(3);
            questionText = await this.questionGenerator.generateQuestion({
                candidate: session.candidate,
                currentDay,
                currentState,
                evaluation,
                askedQuestions: memory.getAskedQuestions(),
                lastCandidateAnswer: incomingMessage,
                recentConversationContext: recentContextForQuestion,
                difficulty: memory.getDifficulty(),
                retryCount: currentRetryCount,
                followUpCount: currentFollowUpCount,
                isConsecutiveInvalidAdvance
            });
        }
        // ─── 5. Record Question & Prepare Next Listening State ───────────────────
        memory.recordQuestion(currentDay.day, currentDay.objectives[0] || currentDay.title, questionText);
        stateManager.prepareNextListeningState();
        session.metadata.stateManagerData = stateManager.serialize();
        session.metadata.state = stateManager.getState();
        // ─── 6. Save Updated Session ─────────────────────────────────────────────
        const updatedMessages = [
            ...session.messages,
            ...(incomingMessage ? [{ role: 'candidate', content: incomingMessage, timestamp: new Date() }] : []),
            { role: 'interviewer', content: questionText, timestamp: new Date() }
        ];
        this.sessionManager.updateSession(sessionId, {
            messages: updatedMessages,
            metadata: session.metadata
        });
        const latencyMs = Date.now() - startTime;
        // Instrumentation Metric Log: verify exactly <=2 LLM calls per candidate turn and 0 for greeting
        logger_1.Logger.info(`[METRIC] Session ${sessionId} Turn ${memory.getQuestionCount()} completed | LLM Calls: ${llmCallCount} (max 2) | Latency: ${latencyMs}ms`);
        // ─── 7. Return response with real metrics ────────────────────────────────
        return {
            reply: questionText,
            done: false,
            questionCount: memory.getQuestionCount(),
            visitedDaysCount: memory.getVisitedDays().length,
            difficulty: memory.getDifficulty(),
            currentState: stateManager.getState(),
            currentDayTitle: topicAfter,
            llmCallCount
        };
    }
}
exports.InterviewEngine = InterviewEngine;
