import { InterviewRequest, InterviewResponse } from '../types';

export interface IInterviewEngine {
  processTurn(request: InterviewRequest): Promise<InterviewResponse>;
}

export class InterviewEngine implements IInterviewEngine {
  constructor() {
    // TODO: Inject SessionManager, InterviewPlanner, PromptBuilder, DifficultyEngine, FeedbackEngine
  }

  public async processTurn(request: InterviewRequest): Promise<InterviewResponse> {
    // TODO: Future implementation to orchestrate state machine turn execution
    throw new Error("Not implemented");
  }
}
