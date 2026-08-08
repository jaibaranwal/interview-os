import { FeedbackObject } from '../types';

export interface IFeedbackEngine {
  generateFeedback(sessionMemory: any): Promise<FeedbackObject>;
}

export class FeedbackEngine implements IFeedbackEngine {
  constructor() {
    // TODO: Inject LLM provider SDK and PromptBuilder
  }

  public async generateFeedback(sessionMemory: any): Promise<FeedbackObject> {
    // TODO: Future implementation to compile schema-valid summary, strengths, gaps, next steps
    throw new Error("Not implemented");
  }
}
