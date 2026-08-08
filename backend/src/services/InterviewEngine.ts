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

    // 1 & 2. Load or Create Session
    if (!this.sessionManager.hasSession(sessionId)) {
      if (!isStartRequest) {
        throw new Error(`Session '${sessionId}' not found. Initial start payload with candidate profile required.`);
      }

      const candidate = (request as any).candidate as CandidateProfile;
      session = this.sessionManager.createSession(sessionId, candidate);

      memory = new ConversationMemory();
      stateMachine = new StateMachine(InterviewState.GREETING);

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

    // Active curriculum day from session metadata
    let currentDay = session.metadata.currentDay as any;
    if (!currentDay) {
      currentDay = this.interviewPlanner.selectNextTargetDay(session.candidate, memory.getVisitedDays())!;
      session.metadata.currentDay = currentDay;
    }

    const topicBefore = `Day ${currentDay.day}: ${currentDay.title}`;
    const previousQuestions = memory.getAskedQuestions();
    const lastQuestionText = previousQuestions.length > 0 ? previousQuestions[previousQuestions.length - 1].text : undefined;

    // 3. Evaluate Candidate Response & Transition Decision
    let evaluation: LLMEvaluationResult | undefined;
    let currentState = stateMachine.getState();
    let transitionReason = 'Turn initialization / greeting';

    if (incomingMessage && incomingMessage.trim().length > 0) {
      memory.recordAnswer(incomingMessage);

      // LLM Evaluation against currentDay
      evaluation = await this.responseEvaluator.evaluateResponse(
        incomingMessage,
        currentDay,
        lastQuestionText
      );

      memory.recordEvaluation(evaluation, currentDay.day);

      // Update Difficulty
      const updatedDifficulty = this.difficultyEngine.updateDifficulty(
        memory.getDifficulty(),
        evaluation
      );
      memory.setDifficulty(updatedDifficulty);

      // Advance State Machine
      if (currentState === InterviewState.LISTENING) {
        stateMachine.transitionTo(InterviewState.EVALUATING);
        currentState = stateMachine.getState();
      }

      const retryCount = memory.getRetryCountForDay(currentDay.day);

      if (currentState === InterviewState.EVALUATING) {
        if (evaluation.next_action === 'retry') {
          if (retryCount < 3) {
            stateMachine.transitionTo(InterviewState.HINT);
            transitionReason = `Evaluation score ${evaluation.score}/100 (${evaluation.correctness}) requested retry. Retry count: ${retryCount}/3. RETAINING TOPIC.`;
          } else {
            stateMachine.transitionTo(InterviewState.TOPIC_SWITCH);
            transitionReason = `Evaluation score ${evaluation.score}/100 requested retry, but retry limit (3) reached. FORCING TOPIC ADVANCE.`;
          }
        } else if (evaluation.next_action === 'follow_up') {
          stateMachine.transitionTo(InterviewState.FOLLOW_UP);
          transitionReason = `Evaluation score ${evaluation.score}/100 (${evaluation.correctness}) requested follow-up on missing concepts. RETAINING TOPIC.`;
        } else {
          stateMachine.transitionTo(InterviewState.TOPIC_SWITCH);
          transitionReason = `Evaluation score ${evaluation.score}/100 (${evaluation.correctness}) passed threshold. ADVANCING TOPIC.`;
        }
        currentState = stateMachine.getState();
      }

      // STRICT CURRICULUM PROGRESSION RULE:
      // Topic advances ONLY IF evaluation explicitly returned next_action == "advance" OR retryCount >= 3
      const shouldAdvanceTopic = evaluation.next_action === 'advance' || retryCount >= 3;

      if (shouldAdvanceTopic) {
        const nextDay = this.interviewPlanner.selectNextTargetDay(
          session.candidate,
          memory.getVisitedDays()
        );
        if (nextDay && nextDay.day !== currentDay.day) {
          currentDay = nextDay;
          session.metadata.currentDay = currentDay;
        }
      }
    }

    const topicAfter = `Day ${currentDay.day}: ${currentDay.title}`;

    // 4. Check Completion Criteria (>= 8 questions AND >= 4 distinct days)
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

    // 6. Record Question in Memory
    if (currentDay && currentState !== InterviewState.GREETING) {
      memory.recordQuestion(
        currentDay.day,
        currentDay.objectives[0] || currentDay.title,
        llmReply
      );
    }

    // 7. Transition StateMachine to LISTENING
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

    // 8. Save Session
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
