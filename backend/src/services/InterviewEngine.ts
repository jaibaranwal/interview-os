import { InterviewRequest, InterviewResponse, CandidateProfile, FeedbackObject } from '../types';
import { SessionManager, SessionData } from './SessionManager';
import { CandidateAnalyzer, CandidateAnalysisResult } from '../engine/CandidateAnalyzer';
import { InterviewPlanner, InterviewPlan } from './InterviewPlanner';
import { ConversationMemory } from '../memory/ConversationMemory';
import { StateMachine, InterviewState } from '../engine/StateMachine';
import { ResponseEvaluator, ResponseEvaluationResult } from '../engine/ResponseEvaluator';
import { PromptBuilder } from './PromptBuilder';
import { LLMClient, ILLMClient } from './LLMClient';
import { CurriculumLoader } from '../data/CurriculumLoader';
import { DifficultyEngine } from './DifficultyEngine';
import { FeedbackEngine } from './FeedbackEngine';
import { Logger } from '../utils/logger';

export interface IInterviewEngine {
  processTurn(request: InterviewRequest): Promise<InterviewResponse>;
}

export class InterviewEngine implements IInterviewEngine {
  private sessionManager: SessionManager;
  private candidateAnalyzer: CandidateAnalyzer;
  private interviewPlanner: InterviewPlanner;
  private promptBuilder: PromptBuilder;
  private responseEvaluator: ResponseEvaluator;
  private difficultyEngine: DifficultyEngine;
  private feedbackEngine: FeedbackEngine;
  private llmClient: ILLMClient;
  private curriculumLoader: CurriculumLoader;

  constructor(
    sessionManager: SessionManager = SessionManager.getInstance(),
    candidateAnalyzer: CandidateAnalyzer = new CandidateAnalyzer(),
    interviewPlanner: InterviewPlanner = new InterviewPlanner(),
    promptBuilder: PromptBuilder = new PromptBuilder(),
    responseEvaluator: ResponseEvaluator = new ResponseEvaluator(),
    difficultyEngine: DifficultyEngine = new DifficultyEngine(),
    feedbackEngine: FeedbackEngine = new FeedbackEngine(),
    llmClient: ILLMClient = new LLMClient(),
    curriculumLoader: CurriculumLoader = CurriculumLoader.getInstance()
  ) {
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

  public async processTurn(request: InterviewRequest): Promise<InterviewResponse> {
    const { sessionId } = request;
    const isStartRequest = 'candidate' in request && !!request.candidate;
    const incomingMessage = 'message' in request ? request.message : undefined;

    let session: SessionData;
    let memory: ConversationMemory;
    let stateMachine: StateMachine;

    // 1 & 2. Load or Create Session and Memory
    if (!this.sessionManager.hasSession(sessionId)) {
      if (!isStartRequest) {
        throw new Error(`Session '${sessionId}' not found. Initial start payload with candidate profile required.`);
      }

      const candidate = (request as any).candidate as CandidateProfile;
      session = this.sessionManager.createSession(sessionId, candidate);

      memory = new ConversationMemory();
      stateMachine = new StateMachine(InterviewState.GREETING);

      // 3 & 4. Run CandidateAnalyzer & Generate InterviewPlan
      const analysis = this.candidateAnalyzer.analyzeProfile(candidate);
      const plan = this.interviewPlanner.createPlan(candidate);
      const initialDifficulty = this.difficultyEngine.calculateInitialDifficulty(candidate);
      memory.setDifficulty(initialDifficulty);

      session.metadata = {
        memory,
        stateMachine,
        analysis,
        plan
      };

      Logger.info(`Orchestrated Turn 1 (GREETING) for session '${sessionId}' [Candidate: ${candidate.member.name}]`);
    } else {
      session = this.sessionManager.getSession(sessionId)!;
      memory = session.metadata.memory as ConversationMemory;
      stateMachine = session.metadata.stateMachine as StateMachine;
    }

    // Check if session already completed
    if (stateMachine.isComplete()) {
      const feedback = session.metadata.feedback as FeedbackObject;
      return {
        reply: "This interview has been completed. Thank you for participating!",
        done: true,
        feedback
      };
    }

    const analysis = session.metadata.analysis as CandidateAnalysisResult;
    const plan = session.metadata.plan as InterviewPlan;

    // 5. Read current state & Evaluate candidate message (for turn 2+)
    let responseEvaluation: ResponseEvaluationResult | undefined;
    let currentState = stateMachine.getState();

    if (incomingMessage && incomingMessage.trim().length > 0) {
      responseEvaluation = this.responseEvaluator.evaluateResponse(incomingMessage);
      memory.recordAnswer(incomingMessage);

      // Update difficulty
      const updatedDifficulty = this.difficultyEngine.updateDifficulty(
        memory.getDifficulty(),
        responseEvaluation
      );
      memory.setDifficulty(updatedDifficulty);

      // Track strengths / weaknesses
      if (responseEvaluation.quality === 'EXEMPLARY') {
        memory.recordStrength(`Demonstrated mastery in recent technical responses.`);
      } else if (responseEvaluation.isUncertain) {
        memory.recordWeakness(`Exhibited uncertainty during concept probing.`);
      }

      // Advance state from LISTENING to EVALUATING
      if (currentState === InterviewState.LISTENING) {
        stateMachine.transitionTo(InterviewState.EVALUATING);
        currentState = stateMachine.getState();
      }

      // Check state transitions based on response quality
      if (currentState === InterviewState.EVALUATING) {
        if (responseEvaluation.isUncertain || responseEvaluation.quality === 'POOR') {
          stateMachine.transitionTo(InterviewState.HINT);
        } else if (responseEvaluation.quality === 'ADEQUATE' && responseEvaluation.isShort) {
          stateMachine.transitionTo(InterviewState.FOLLOW_UP);
        } else {
          stateMachine.transitionTo(InterviewState.TOPIC_SWITCH);
        }
        currentState = stateMachine.getState();
      }
    }

    // Check if Interview Completion Criteria Met (>= 8 questions AND >= 4 distinct days)
    const isCoverageMet = this.interviewPlanner.hasSufficientCoverage(
      memory.getVisitedDays(),
      memory.getQuestionCount()
    );

    if (isCoverageMet) {
      // Transition through FINAL_EVALUATION to COMPLETED
      if (stateMachine.canTransitionTo(InterviewState.FINAL_EVALUATION)) {
        stateMachine.transitionTo(InterviewState.FINAL_EVALUATION);
      }
      if (stateMachine.canTransitionTo(InterviewState.COMPLETED)) {
        stateMachine.transitionTo(InterviewState.COMPLETED);
      }

      const feedback = await this.feedbackEngine.generateFeedback(session.candidate, memory);
      session.metadata.feedback = feedback;

      const completionReply = `Thank you ${session.candidate.member.name}. That concludes our adaptive technical interview session covering ${memory.getVisitedDays().length} cohort days across ${memory.getQuestionCount()} evaluated questions. Here is your detailed performance report.`;

      const updatedMessages = [
        ...session.messages,
        ...(incomingMessage ? [{ role: 'candidate' as const, content: incomingMessage, timestamp: new Date() }] : []),
        { role: 'interviewer' as const, content: completionReply, timestamp: new Date() }
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

    // Determine target day for turn
    const currentTargetDay = this.interviewPlanner.selectNextTargetDay(
      session.candidate,
      memory.getVisitedDays()
    );

    // 6. Call PromptBuilder
    const systemPrompt = this.promptBuilder.buildSystemPrompt({
      candidate: session.candidate,
      analysis,
      plan,
      currentState,
      currentDay: currentTargetDay,
      questionCount: memory.getQuestionCount(),
      visitedDays: memory.getVisitedDays(),
      difficulty: memory.getDifficulty(),
      askedQuestions: memory.getAskedQuestions().map((q) => q.text),
      previousAnswer: incomingMessage,
      responseEvaluation
    });

    // 7 & 8. Call LLM
    const llmReply = await this.llmClient.generate(systemPrompt, incomingMessage || '');

    // 10. Update ConversationMemory & Record Question
    if (currentTargetDay && currentState !== InterviewState.GREETING) {
      memory.recordQuestion(
        currentTargetDay.day,
        currentTargetDay.objectives[0] || currentTargetDay.title,
        llmReply
      );
    }

    // 11. Cleanly advance StateMachine to LISTENING for the next candidate turn
    if (currentState === InterviewState.GREETING) {
      stateMachine.transitionTo(InterviewState.PLANNING);
      stateMachine.transitionTo(InterviewState.QUESTION);
      stateMachine.transitionTo(InterviewState.LISTENING);
    } else if (currentState === InterviewState.HINT) {
      stateMachine.transitionTo(InterviewState.QUESTION);
      stateMachine.transitionTo(InterviewState.LISTENING);
    } else if (currentState === InterviewState.FOLLOW_UP) {
      stateMachine.transitionTo(InterviewState.QUESTION);
      stateMachine.transitionTo(InterviewState.LISTENING);
    } else if (currentState === InterviewState.TOPIC_SWITCH) {
      stateMachine.transitionTo(InterviewState.PLANNING);
      stateMachine.transitionTo(InterviewState.QUESTION);
      stateMachine.transitionTo(InterviewState.LISTENING);
    } else if (currentState === InterviewState.PLANNING) {
      stateMachine.transitionTo(InterviewState.QUESTION);
      stateMachine.transitionTo(InterviewState.LISTENING);
    } else if (currentState === InterviewState.QUESTION) {
      stateMachine.transitionTo(InterviewState.LISTENING);
    }

    // 12. Save Session
    const updatedMessages = [
      ...session.messages,
      ...(incomingMessage ? [{ role: 'candidate' as const, content: incomingMessage, timestamp: new Date() }] : []),
      { role: 'interviewer' as const, content: llmReply, timestamp: new Date() }
    ];

    this.sessionManager.updateSession(sessionId, {
      messages: updatedMessages,
      metadata: session.metadata
    });

    // 13. Return API Response
    return {
      reply: llmReply,
      done: false
    };
  }
}
