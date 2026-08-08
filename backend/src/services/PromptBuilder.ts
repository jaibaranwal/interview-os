import { CandidateProfile, CurriculumDay } from '../types';

export interface IPromptBuilder {
  buildGreetingPrompt(candidate: CandidateProfile): string;
  buildQuestionPrompt(candidate: CandidateProfile, day: CurriculumDay, difficulty: number): string;
  buildFollowUpPrompt(previousAnswer: string, contextClaim: string): string;
  buildFeedbackPrompt(conversationHistory: any[]): string;
}

export class PromptBuilder implements IPromptBuilder {
  constructor() {
    // TODO: Inject system prompt templates configuration
  }

  public buildGreetingPrompt(candidate: CandidateProfile): string {
    // TODO: Future implementation to generate personalized greeting prompt
    throw new Error("Not implemented");
  }

  public buildQuestionPrompt(candidate: CandidateProfile, day: CurriculumDay, difficulty: number): string {
    // TODO: Future implementation to synthesize objective-grounded question prompt
    throw new Error("Not implemented");
  }

  public buildFollowUpPrompt(previousAnswer: string, contextClaim: string): string {
    // TODO: Future implementation to construct targeted probe prompt
    throw new Error("Not implemented");
  }

  public buildFeedbackPrompt(conversationHistory: any[]): string {
    // TODO: Future implementation to construct final feedback evaluation prompt
    throw new Error("Not implemented");
  }
}
