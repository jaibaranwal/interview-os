import { InterviewRequest, InterviewResponse, CandidateProfile, FeedbackObject, LLMEvaluationResult } from '../types';
import { SessionManager, SessionData } from './SessionManager';
import { CandidateAnalyzer, CandidateAnalysisResult } from '../engine/CandidateAnalyzer';
import { InterviewPlanner, InterviewPlan } from './InterviewPlanner';
import { ConversationMemory } from '../memory/ConversationMemory';
import { StateMachine, InterviewState } from '../engine/StateMachine';
import { ResponseEvaluator } from '../engine/ResponseEvaluator';
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
    const startTime = Date.now();
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

    // Active Target Curriculum Day before turn evaluation
    let currentTargetDay = this.interviewPlanner.selectNextTargetDay(
      session.candidate,
      memory.getVisitedDays()
    );

    const previousQuestions = memory.getAskedQuestions();
    const lastQuestionText = previousQuestions.length > 0 ? previousQuestions[previousQuestions.length - 1].text : undefined;

    // 5. Evaluate Candidate Response & State Decision
    let evaluation: LLMEvaluationResult | undefined;
    let currentState = stateMachine.getState();
    let currentDayNum = currentTargetDay ? currentTargetDay.day : 7;
    let currentRetryCount = memory.getRetryCountForDay(currentDayNum);

    if (incomingMessage && incomingMessage.trim().length > 0) {
      memory.recordAnswer(incomingMessage);

      // Run LLM Evaluation Engine
      evaluation = await this.responseEvaluator.evaluateResponse(
        incomingMessage,
        currentTargetDay,
        lastQuestionText
      );

      // Record Evaluation in Memory
      memory.recordEvaluation(evaluation, currentDayNum);

      // Update Difficulty
      const updatedDifficulty = this.difficultyEngine.updateDifficulty(
        memory.getDifficulty(),
        evaluation
      );
      memory.setDifficulty(updatedDifficulty);

      // State Transitions based on LLM Evaluation & Retry Count
      if (currentState === InterviewState.LISTENING) {
        stateMachine.transitionTo(InterviewState.EVALUATING);
        currentState = stateMachine.getState();
      }

      currentRetryCount = memory.getRetryCountForDay(currentDayNum);

      if (currentState === InterviewState.EVALUATING) {
        if (evaluation.next_action === 'retry') {
          if (currentRetryCount < 3) {
            stateMachine.transitionTo(InterviewState.HINT);
          } else {
            // Max retries reached: force topic switch
            stateMachine.transitionTo(InterviewState.TOPIC_SWITCH);
          }
        } else if (evaluation.next_action === 'follow_up') {
          stateMachine.transitionTo(InterviewState.FOLLOW_UP);
        } else {
          // Advance (score >= 70 or satisfactory answer)
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

    // Determine target day for turn (Retain current day if retry, else select next)
    if (evaluation?.next_action === 'retry' && currentRetryCount < 3) {
      // Retain current target day! Do NOT advance curriculum day!
    } else {
      currentTargetDay = this.interviewPlanner.selectNextTargetDay(
        session.candidate,
        memory.getVisitedDays()
      );
    }

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
      evaluation,
      retryCount: currentRetryCount
    });

    // 7 & 8. Call LLM to Generate Next Question
    const llmReply = await this.llmClient.generate(systemPrompt, incomingMessage || '');

    // 10. Record Question in Memory
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

    const latency = Date.now() - startTime;

    // Structured Backend Terminal Logging
    console.log('\n==================== INTERVIEW TURN ====================');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Candidate: ${session.candidate.member.name} (${session.candidate.member.jobRole})`);
    console.log(`Current State: ${stateMachine.getState()} | Difficulty: ${memory.getDifficulty().toFixed(1)}/5.0`);
    console.log(`Target Day: Day ${currentTargetDay?.day || 7} (${currentTargetDay?.title})`);
    if (incomingMessage) {
      console.log(`Incoming Response: "${incomingMessage}"`);
    }
    if (evaluation) {
      console.log('\n--- LLM EVALUATION ---');
      console.log(`Score: ${evaluation.score} / 100 | Confidence: ${evaluation.confidence} / 100`);
      console.log(`Correctness: ${evaluation.correctness}`);
      console.log(`Detected Concepts: ${evaluation.detected_concepts.join(', ') || 'None'}`);
      console.log(`Missing Concepts: ${evaluation.missing_concepts.join(', ') || 'None'}`);
      console.log(`Next Action Decision: ${evaluation.next_action} (Retry Count: ${currentRetryCount}/3)`);
    }
    console.log('\n--- GENERATED QUESTION ---');
    console.log(`"${llmReply}"`);
    console.log(`\nLatency: ${latency}ms | Questions Asked: ${memory.getQuestionCount()}/8 | Visited Days: ${memory.getVisitedDays().length}/4`);
    console.log('========================================================\n');

    // 13. Return Response
    return {
      reply: llmReply,
      done: false
    };
  }
}
