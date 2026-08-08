// Future responsibility: Finite State Machine managing 10 interview states and state transitions
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
  private currentState: InterviewState = InterviewState.GREETING;

  public getState(): InterviewState {
    return this.currentState;
  }
}
