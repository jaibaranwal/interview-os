"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewEngine = void 0;
const SessionManager_1 = require("./SessionManager");
const CandidateAnalyzer_1 = require("../engine/CandidateAnalyzer");
const InterviewPlanner_1 = require("./InterviewPlanner");
const ConversationMemory_1 = require("../memory/ConversationMemory");
const StateMachine_1 = require("../engine/StateMachine");
const ResponseEvaluator_1 = require("../engine/ResponseEvaluator");
const PromptBuilder_1 = require("./PromptBuilder");
const LLMClient_1 = require("./LLMClient");
const CurriculumLoader_1 = require("../data/CurriculumLoader");
const DifficultyEngine_1 = require("./DifficultyEngine");
const FeedbackEngine_1 = require("./FeedbackEngine");
const logger_1 = require("../utils/logger");
class InterviewEngine {
    sessionManager;
    candidateAnalyzer;
    interviewPlanner;
    promptBuilder;
    responseEvaluator;
    difficultyEngine;
    feedbackEngine;
    llmClient;
    curriculumLoader;
    constructor(sessionManager = SessionManager_1.SessionManager.getInstance(), candidateAnalyzer = new CandidateAnalyzer_1.CandidateAnalyzer(), interviewPlanner = new InterviewPlanner_1.InterviewPlanner(), promptBuilder = new PromptBuilder_1.PromptBuilder(), responseEvaluator = new ResponseEvaluator_1.ResponseEvaluator(), difficultyEngine = new DifficultyEngine_1.DifficultyEngine(), feedbackEngine = new FeedbackEngine_1.FeedbackEngine(), llmClient = new LLMClient_1.LLMClient(), curriculumLoader = CurriculumLoader_1.CurriculumLoader.getInstance()) {
        this.sessionManager = sessionManager;
        this.candidateAnalyzer = candidateAnalyzer;
        this.interviewPlanner = interviewPlanner;
        this.promptBuilder = promptBuilder;
        this.responseEvaluator = responseEvaluator;
        this.difficultyEngine = difficultyEngine;
        this.feedbackEngine = feedbackEngine;
        this.llmClient = llmClient;
        this.curriculumLoader = curriculumLoader;
    }
    async processTurn(request) {
        const startTime = Date.now();
        const { sessionId } = request;
        const isStartRequest = 'candidate' in request && !!request.candidate;
        const incomingMessage = 'message' in request ? request.message : undefined;
        let session;
        let memory;
        let stateMachine;
        // 1 & 2. Load or Create Session
        if (!this.sessionManager.hasSession(sessionId)) {
            if (!isStartRequest) {
                throw new Error(`Session '${sessionId}' not found. Initial start payload with candidate profile required.`);
            }
            const candidate = request.candidate;
            session = this.sessionManager.createSession(sessionId, candidate);
            memory = new ConversationMemory_1.ConversationMemory();
            stateMachine = new StateMachine_1.StateMachine(StateMachine_1.InterviewState.GREETING);
            const analysis = this.candidateAnalyzer.analyzeProfile(candidate);
            const plan = this.interviewPlanner.createPlan(candidate);
            const initialDifficulty = this.difficultyEngine.calculateInitialDifficulty(candidate);
            memory.setDifficulty(initialDifficulty);
            // Select initial target day
            const initialDay = this.interviewPlanner.selectNextTargetDay(candidate, []);
            session.metadata = {
                memory,
                stateMachine,
                analysis,
                plan,
                currentDay: initialDay
            };
            logger_1.Logger.info(`Orchestrated Turn 1 (GREETING) for session '${sessionId}' [Candidate: ${candidate.member.name}]`);
        }
        else {
            session = this.sessionManager.getSession(sessionId);
            memory = session.metadata.memory;
            stateMachine = session.metadata.stateMachine;
        }
        // Check if session already completed
        if (stateMachine.isComplete()) {
            const feedback = session.metadata.feedback;
            return {
                reply: "This interview has been completed. Thank you for participating!",
                done: true,
                feedback
            };
        }
        const analysis = session.metadata.analysis;
        const plan = session.metadata.plan;
        // Active curriculum day from session metadata
        let currentDay = session.metadata.currentDay;
        if (!currentDay) {
            currentDay = this.interviewPlanner.selectNextTargetDay(session.candidate, memory.getVisitedDays());
            session.metadata.currentDay = currentDay;
        }
        const topicBefore = `Day ${currentDay.day}: ${currentDay.title}`;
        const previousQuestions = memory.getAskedQuestions();
        const lastQuestionText = previousQuestions.length > 0 ? previousQuestions[previousQuestions.length - 1].text : undefined;
        // 3. Evaluate Candidate Response & Transition Decision
        let evaluation;
        let currentState = stateMachine.getState();
        let transitionReason = 'Turn initialization / greeting';
        if (incomingMessage && incomingMessage.trim().length > 0) {
            memory.recordAnswer(incomingMessage);
            // LLM Evaluation against currentDay
            evaluation = await this.responseEvaluator.evaluateResponse(incomingMessage, currentDay, lastQuestionText);
            memory.recordEvaluation(evaluation, currentDay.day);
            // Update Difficulty
            const updatedDifficulty = this.difficultyEngine.updateDifficulty(memory.getDifficulty(), evaluation);
            memory.setDifficulty(updatedDifficulty);
            // Advance State Machine
            if (currentState === StateMachine_1.InterviewState.LISTENING) {
                stateMachine.transitionTo(StateMachine_1.InterviewState.EVALUATING);
                currentState = stateMachine.getState();
            }
            const retryCount = memory.getRetryCountForDay(currentDay.day);
            if (currentState === StateMachine_1.InterviewState.EVALUATING) {
                if (evaluation.next_action === 'retry') {
                    if (retryCount < 3) {
                        stateMachine.transitionTo(StateMachine_1.InterviewState.HINT);
                        transitionReason = `Evaluation score ${evaluation.score}/100 (${evaluation.correctness}) requested retry. Retry count: ${retryCount}/3. RETAINING TOPIC.`;
                    }
                    else {
                        stateMachine.transitionTo(StateMachine_1.InterviewState.TOPIC_SWITCH);
                        transitionReason = `Evaluation score ${evaluation.score}/100 requested retry, but retry limit (3) reached. FORCING TOPIC ADVANCE.`;
                    }
                }
                else if (evaluation.next_action === 'follow_up') {
                    stateMachine.transitionTo(StateMachine_1.InterviewState.FOLLOW_UP);
                    transitionReason = `Evaluation score ${evaluation.score}/100 (${evaluation.correctness}) requested follow-up on missing concepts. RETAINING TOPIC.`;
                }
                else {
                    stateMachine.transitionTo(StateMachine_1.InterviewState.TOPIC_SWITCH);
                    transitionReason = `Evaluation score ${evaluation.score}/100 (${evaluation.correctness}) passed threshold. ADVANCING TOPIC.`;
                }
                currentState = stateMachine.getState();
            }
            // STRICT CURRICULUM PROGRESSION RULE:
            // Topic advances ONLY IF evaluation explicitly returned next_action == "advance" OR retryCount >= 3
            const shouldAdvanceTopic = evaluation.next_action === 'advance' || retryCount >= 3;
            if (shouldAdvanceTopic) {
                const nextDay = this.interviewPlanner.selectNextTargetDay(session.candidate, memory.getVisitedDays());
                if (nextDay && nextDay.day !== currentDay.day) {
                    currentDay = nextDay;
                    session.metadata.currentDay = currentDay;
                }
            }
        }
        const topicAfter = `Day ${currentDay.day}: ${currentDay.title}`;
        // 4. Check Completion Criteria (>= 8 questions AND >= 4 distinct days)
        const isCoverageMet = this.interviewPlanner.hasSufficientCoverage(memory.getVisitedDays(), memory.getQuestionCount());
        if (isCoverageMet) {
            if (stateMachine.canTransitionTo(StateMachine_1.InterviewState.FINAL_EVALUATION)) {
                stateMachine.transitionTo(StateMachine_1.InterviewState.FINAL_EVALUATION);
            }
            if (stateMachine.canTransitionTo(StateMachine_1.InterviewState.COMPLETED)) {
                stateMachine.transitionTo(StateMachine_1.InterviewState.COMPLETED);
            }
            const feedback = await this.feedbackEngine.generateFeedback(session.candidate, memory);
            session.metadata.feedback = feedback;
            const completionReply = `Thank you ${session.candidate.member.name}. That concludes our adaptive technical interview session covering ${memory.getVisitedDays().length} cohort days across ${memory.getQuestionCount()} evaluated questions. Here is your detailed performance report.`;
            const updatedMessages = [
                ...session.messages,
                ...(incomingMessage ? [{ role: 'candidate', content: incomingMessage, timestamp: new Date() }] : []),
                { role: 'interviewer', content: completionReply, timestamp: new Date() }
            ];
            this.sessionManager.updateSession(sessionId, {
                messages: updatedMessages,
                metadata: session.metadata
            });
            return {
                reply: completionReply,
                done: true,
                feedback
            };
        }
        // 5. Generate System Prompt & LLM Question
        const retryCountForPrompt = memory.getRetryCountForDay(currentDay.day);
        const systemPrompt = this.promptBuilder.buildSystemPrompt({
            candidate: session.candidate,
            analysis,
            plan,
            currentState,
            currentDay,
            questionCount: memory.getQuestionCount(),
            visitedDays: memory.getVisitedDays(),
            difficulty: memory.getDifficulty(),
            askedQuestions: memory.getAskedQuestions().map((q) => q.text),
            previousAnswer: incomingMessage,
            evaluation,
            retryCount: retryCountForPrompt
        });
        const llmReply = await this.llmClient.generate(systemPrompt, incomingMessage || '');
        // Log explicit LLM-Driven Audit Trace
        console.log('==============================');
        console.log(`CURRENT DAY: ${topicBefore}`);
        console.log(`CURRENT STATE: ${currentState}`);
        console.log(`USER ANSWER: "${incomingMessage || '(Initial Turn / Greeting)'}"`);
        console.log(`LLM RAW RESPONSE: ${evaluation?.raw_reasoning || '(Greeting Generation)'}`);
        console.log('PARSED JSON:', evaluation ? JSON.stringify({
            score: evaluation.score,
            confidence: evaluation.confidence,
            correctness: evaluation.correctness,
            detected_concepts: evaluation.detected_concepts,
            missing_concepts: evaluation.missing_concepts,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            next_action: evaluation.next_action
        }, null, 2) : 'N/A (Greeting)');
        console.log(`NEXT ACTION: ${evaluation?.next_action || 'N/A'}`);
        console.log(`GENERATED QUESTION: "${llmReply}"`);
        console.log('==============================\n');
        // 6. Record Question in Memory
        if (currentDay && currentState !== StateMachine_1.InterviewState.GREETING) {
            memory.recordQuestion(currentDay.day, currentDay.objectives[0] || currentDay.title, llmReply);
        }
        // 7. Transition StateMachine to LISTENING
        if (currentState === StateMachine_1.InterviewState.GREETING) {
            stateMachine.transitionTo(StateMachine_1.InterviewState.PLANNING);
            stateMachine.transitionTo(StateMachine_1.InterviewState.QUESTION);
            stateMachine.transitionTo(StateMachine_1.InterviewState.LISTENING);
        }
        else if (currentState === StateMachine_1.InterviewState.HINT) {
            stateMachine.transitionTo(StateMachine_1.InterviewState.QUESTION);
            stateMachine.transitionTo(StateMachine_1.InterviewState.LISTENING);
        }
        else if (currentState === StateMachine_1.InterviewState.FOLLOW_UP) {
            stateMachine.transitionTo(StateMachine_1.InterviewState.QUESTION);
            stateMachine.transitionTo(StateMachine_1.InterviewState.LISTENING);
        }
        else if (currentState === StateMachine_1.InterviewState.TOPIC_SWITCH) {
            stateMachine.transitionTo(StateMachine_1.InterviewState.PLANNING);
            stateMachine.transitionTo(StateMachine_1.InterviewState.QUESTION);
            stateMachine.transitionTo(StateMachine_1.InterviewState.LISTENING);
        }
        else if (currentState === StateMachine_1.InterviewState.PLANNING) {
            stateMachine.transitionTo(StateMachine_1.InterviewState.QUESTION);
            stateMachine.transitionTo(StateMachine_1.InterviewState.LISTENING);
        }
        else if (currentState === StateMachine_1.InterviewState.QUESTION) {
            stateMachine.transitionTo(StateMachine_1.InterviewState.LISTENING);
        }
        // 8. Save Session
        const updatedMessages = [
            ...session.messages,
            ...(incomingMessage ? [{ role: 'candidate', content: incomingMessage, timestamp: new Date() }] : []),
            { role: 'interviewer', content: llmReply, timestamp: new Date() }
        ];
        this.sessionManager.updateSession(sessionId, {
            messages: updatedMessages,
            metadata: session.metadata
        });
        const latency = Date.now() - startTime;
        // Detailed Audit Terminal Log Output
        console.log('\n==================== AUDITED INTERVIEW TURN ====================');
        console.log(`Session ID: ${sessionId}`);
        console.log(`Candidate: ${session.candidate.member.name} (${session.candidate.member.jobRole})`);
        console.log(`Current Topic BEFORE: ${topicBefore}`);
        console.log(`Current Topic AFTER:  ${topicAfter}`);
        console.log(`Transition Reason:    ${transitionReason}`);
        if (incomingMessage) {
            console.log(`Incoming Response:    "${incomingMessage}"`);
        }
        if (evaluation) {
            console.log('\n--- LLM EVALUATION ---');
            console.log(`Score: ${evaluation.score}/100 | Confidence: ${evaluation.confidence}/100 | Correctness: ${evaluation.correctness}`);
            console.log(`Next Action Decision: ${evaluation.next_action} (Retry Count: ${retryCountForPrompt}/3)`);
            console.log(`Detected Concepts:    ${evaluation.detected_concepts.join(', ') || 'None'}`);
            console.log(`Missing Concepts:     ${evaluation.missing_concepts.join(', ') || 'None'}`);
        }
        console.log('\n--- GENERATED QUESTION ---');
        console.log(`"${llmReply}"`);
        console.log(`\nLatency: ${latency}ms | Questions Asked: ${memory.getQuestionCount()}/8 | Visited Days: ${memory.getVisitedDays().length}/4`);
        console.log('=================================================================\n');
        return {
            reply: llmReply,
            done: false
        };
    }
}
exports.InterviewEngine = InterviewEngine;
