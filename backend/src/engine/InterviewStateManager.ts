import { StateMachine, InterviewState } from './StateMachine';
import { LLMEvaluationResult, NextActionDecision } from '../types';
import { Logger } from '../utils/logger';

export interface StateDecision {
  nextState: InterviewState;
  effectiveAction: NextActionDecision;
  shouldAdvanceTopic: boolean;
  isConsecutiveInvalidAdvance?: boolean;
  retryCount: number;
  followUpCount: number;
  consecutiveInvalidCount: number;
  reason: string;
}

export interface PersistableStateData {
  currentState: InterviewState;
  retryMap: Record<number, number>;
  followUpMap: Record<number, number>;
  consecutiveInvalidCount?: number;
}

export class InterviewStateManager {
  private stateMachine: StateMachine;
  private retryMap: Map<number, number> = new Map<number, number>();
  private followUpMap: Map<number, number> = new Map<number, number>();
  private consecutiveInvalidCount: number = 0;

  private readonly maxRetries: number = 3;
  private readonly maxFollowUps: number = 3;
  private readonly maxConsecutiveInvalid: number = 3;

  constructor(initialState: InterviewState = InterviewState.GREETING) {
    this.stateMachine = new StateMachine(initialState);
  }

  public getState(): InterviewState {
    return this.stateMachine.getState();
  }

  public getRetryCount(day: number): number {
    return this.retryMap.get(day) || 0;
  }

  public getFollowUpCount(day: number): number {
    return this.followUpMap.get(day) || 0;
  }

  public getConsecutiveInvalidCount(): number {
    return this.consecutiveInvalidCount;
  }

  public serialize(): PersistableStateData {
    return {
      currentState: this.stateMachine.getState(),
      retryMap: Object.fromEntries(this.retryMap),
      followUpMap: Object.fromEntries(this.followUpMap),
      consecutiveInvalidCount: this.consecutiveInvalidCount
    };
  }

  public static restore(data: PersistableStateData): InterviewStateManager {
    const mgr = new InterviewStateManager(data.currentState);
    mgr.retryMap = new Map(Object.entries(data.retryMap || {}).map(([k, v]) => [Number(k), v]));
    mgr.followUpMap = new Map(Object.entries(data.followUpMap || {}).map(([k, v]) => [Number(k), v]));
    mgr.consecutiveInvalidCount = data.consecutiveInvalidCount || 0;
    return mgr;
  }

  public processEvaluation(evaluation: LLMEvaluationResult, day: number): StateDecision {
    const currentRetry = this.getRetryCount(day);
    const currentFollowUp = this.getFollowUpCount(day);

    this.safeTransition(InterviewState.EVALUATING);

    // Track consecutive invalid / non-good answers
    const isGoodOrExcellent = evaluation.correctness === 'GOOD' || evaluation.correctness === 'EXCELLENT';

    if (isGoodOrExcellent) {
      this.consecutiveInvalidCount = 0;
    } else {
      this.consecutiveInvalidCount += 1;
    }

    // ── Prompt 25 Rule 3: 3 Consecutive Invalid Answers -> Politely Advance Topic ──
    if (this.consecutiveInvalidCount >= this.maxConsecutiveInvalid) {
      Logger.info(`Consecutive invalid limit (${this.maxConsecutiveInvalid}) reached — forcing polite topic advance.`);
      this.consecutiveInvalidCount = 0;
      this.retryMap.set(day, 0);
      this.followUpMap.set(day, 0);
      this.safeTransition(InterviewState.TOPIC_SWITCH);
      return {
        nextState: InterviewState.TOPIC_SWITCH,
        effectiveAction: 'advance',
        shouldAdvanceTopic: true,
        isConsecutiveInvalidAdvance: true,
        retryCount: currentRetry,
        followUpCount: currentFollowUp,
        consecutiveInvalidCount: 0,
        reason: `3 consecutive invalid/non-technical answers. Advancing topic.`
      };
    }

    // ── RETRY path (gibberish / profanity / uncertain / off-topic / refusal) ──
    if (evaluation.next_action === 'retry') {
      const newRetry = currentRetry + 1;
      this.retryMap.set(day, newRetry);

      if (newRetry < this.maxRetries) {
        this.safeTransition(InterviewState.HINT);
        return {
          nextState: InterviewState.HINT,
          effectiveAction: 'retry',
          shouldAdvanceTopic: false,
          retryCount: newRetry,
          followUpCount: currentFollowUp,
          consecutiveInvalidCount: this.consecutiveInvalidCount,
          reason: `Score ${evaluation.score}/100 (${evaluation.correctness}). Retry ${newRetry}/${this.maxRetries}.`
        };
      } else {
        Logger.info(`Max retries (${this.maxRetries}) reached for Day ${day} — forcing topic advance.`);
        this.retryMap.set(day, 0);
        this.safeTransition(InterviewState.TOPIC_SWITCH);
        return {
          nextState: InterviewState.TOPIC_SWITCH,
          effectiveAction: 'advance',
          shouldAdvanceTopic: true,
          retryCount: newRetry,
          followUpCount: currentFollowUp,
          consecutiveInvalidCount: this.consecutiveInvalidCount,
          reason: `Retry limit reached (${this.maxRetries}). Advancing topic.`
        };
      }
    }

    // ── FOLLOW_UP path (weak / partial answers) ──
    if (evaluation.next_action === 'follow_up') {
      const newFollowUp = currentFollowUp + 1;
      this.followUpMap.set(day, newFollowUp);

      if (newFollowUp <= this.maxFollowUps) {
        this.safeTransition(InterviewState.FOLLOW_UP);
        return {
          nextState: InterviewState.FOLLOW_UP,
          effectiveAction: 'follow_up',
          shouldAdvanceTopic: false,
          retryCount: currentRetry,
          followUpCount: newFollowUp,
          consecutiveInvalidCount: this.consecutiveInvalidCount,
          reason: `Score ${evaluation.score}/100 (${evaluation.correctness}). Follow-up ${newFollowUp}/${this.maxFollowUps}.`
        };
      } else {
        Logger.info(`Max follow-ups (${this.maxFollowUps}) reached for Day ${day} — forcing topic advance.`);
        this.followUpMap.set(day, 0);
        this.safeTransition(InterviewState.TOPIC_SWITCH);
        return {
          nextState: InterviewState.TOPIC_SWITCH,
          effectiveAction: 'advance',
          shouldAdvanceTopic: true,
          retryCount: currentRetry,
          followUpCount: newFollowUp,
          consecutiveInvalidCount: this.consecutiveInvalidCount,
          reason: `Follow-up limit reached (${this.maxFollowUps}). Advancing topic.`
        };
      }
    }

    // ── TERMINATE path ──
    if (evaluation.next_action === 'terminate') {
      this.safeTransition(InterviewState.FINAL_EVALUATION);
      return {
        nextState: InterviewState.FINAL_EVALUATION,
        effectiveAction: 'terminate',
        shouldAdvanceTopic: false,
        retryCount: currentRetry,
        followUpCount: currentFollowUp,
        consecutiveInvalidCount: this.consecutiveInvalidCount,
        reason: 'LLM evaluation requested interview termination.'
      };
    }

    // ── ADVANCE path (good / excellent) ──
    this.retryMap.set(day, 0);
    this.consecutiveInvalidCount = 0;

    // Prompt 29 Issue 2: Progressive Probing — stay within concept for 1 follow-up turn before advancing topic
    if (currentFollowUp === 0) {
      const newFollowUp = 1;
      this.followUpMap.set(day, newFollowUp);
      this.safeTransition(InterviewState.FOLLOW_UP);
      return {
        nextState: InterviewState.FOLLOW_UP,
        effectiveAction: 'follow_up',
        shouldAdvanceTopic: false,
        retryCount: 0,
        followUpCount: newFollowUp,
        consecutiveInvalidCount: 0,
        reason: `Score ${evaluation.score}/100 (${evaluation.correctness}). Probing implementation/trade-offs before topic advance.`
      };
    }

    // Concept probed sufficiently — advance to next topic
    this.followUpMap.set(day, 0);
    this.safeTransition(InterviewState.TOPIC_SWITCH);
    return {
      nextState: InterviewState.TOPIC_SWITCH,
      effectiveAction: 'advance',
      shouldAdvanceTopic: true,
      retryCount: 0,
      followUpCount: 0,
      consecutiveInvalidCount: 0,
      reason: `Score ${evaluation.score}/100 (${evaluation.correctness}). Probed sufficiently — advancing topic.`
    };
  }

  public prepareNextListeningState(): void {
    const state = this.stateMachine.getState();
    if (state === InterviewState.GREETING) {
      this.safeTransition(InterviewState.PLANNING);
      this.safeTransition(InterviewState.QUESTION);
      this.safeTransition(InterviewState.LISTENING);
    } else if ([InterviewState.HINT, InterviewState.FOLLOW_UP, InterviewState.TOPIC_SWITCH].includes(state)) {
      if (state === InterviewState.TOPIC_SWITCH) {
        this.safeTransition(InterviewState.PLANNING);
      }
      this.safeTransition(InterviewState.QUESTION);
      this.safeTransition(InterviewState.LISTENING);
    }
  }

  public completeInterview(): void {
    this.safeTransition(InterviewState.FINAL_EVALUATION);
    this.safeTransition(InterviewState.COMPLETED);
  }

  private safeTransition(nextState: InterviewState): void {
    try {
      if (this.stateMachine.canTransitionTo(nextState)) {
        this.stateMachine.transitionTo(nextState);
      } else {
        Logger.warn(`Skipping invalid state transition: ${this.stateMachine.getState()} → ${nextState}`);
      }
    } catch (err: any) {
      Logger.warn(`State transition error (${this.stateMachine.getState()} → ${nextState}): ${err.message}`);
    }
  }
}
