export enum InterviewState {
  GREETING = 'GREETING',
  PLANNING = 'PLANNING',
  QUESTION = 'QUESTION',
  LISTENING = 'LISTENING',
  EVALUATING = 'EVALUATING',
  FOLLOW_UP = 'FOLLOW_UP',
  HINT = 'HINT',
  TOPIC_SWITCH = 'TOPIC_SWITCH',
  FINAL_EVALUATION = 'FINAL_EVALUATION',
  COMPLETED = 'COMPLETED'
}

export class StateMachine {
  private currentState: InterviewState;

  constructor(initialState: InterviewState = InterviewState.GREETING) {
    this.currentState = initialState;
  }

  public getState(): InterviewState {
    return this.currentState;
  }

  public canTransitionTo(nextState: InterviewState): boolean {
    switch (this.currentState) {
      case InterviewState.GREETING:
        return nextState === InterviewState.PLANNING;

      case InterviewState.PLANNING:
        return nextState === InterviewState.QUESTION;

      case InterviewState.QUESTION:
        return nextState === InterviewState.LISTENING;

      case InterviewState.LISTENING:
        return nextState === InterviewState.EVALUATING;

      case InterviewState.EVALUATING:
        return [
          InterviewState.FOLLOW_UP,
          InterviewState.HINT,
          InterviewState.TOPIC_SWITCH,
          InterviewState.FINAL_EVALUATION
        ].includes(nextState);

      case InterviewState.FOLLOW_UP:
        return nextState === InterviewState.QUESTION || nextState === InterviewState.FINAL_EVALUATION;

      case InterviewState.HINT:
        return nextState === InterviewState.QUESTION || nextState === InterviewState.TOPIC_SWITCH || nextState === InterviewState.FINAL_EVALUATION;

      case InterviewState.TOPIC_SWITCH:
        return nextState === InterviewState.PLANNING || nextState === InterviewState.FINAL_EVALUATION;

      case InterviewState.FINAL_EVALUATION:
        return nextState === InterviewState.COMPLETED;

      case InterviewState.COMPLETED:
        return false; // Terminal state

      default:
        return false;
    }
  }

  public transitionTo(nextState: InterviewState): InterviewState {
    if (!this.canTransitionTo(nextState)) {
      throw new Error(`Invalid state transition from '${this.currentState}' to '${nextState}'.`);
    }
    this.currentState = nextState;
    return this.currentState;
  }

  public isComplete(): boolean {
    return this.currentState === InterviewState.COMPLETED;
  }
}
