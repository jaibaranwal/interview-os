import { CandidateProfile, CurriculumDay } from '../types';

export interface IInterviewPlanner {
  selectNextTargetDay(candidate: CandidateProfile, visitedDays: number[]): CurriculumDay;
  hasSufficientCoverage(visitedDays: number[], questionCount: number): boolean;
}

export class InterviewPlanner implements IInterviewPlanner {
  constructor() {
    // TODO: Inject CurriculumLoader dependency
  }

  public selectNextTargetDay(candidate: CandidateProfile, visitedDays: number[]): CurriculumDay {
    // TODO: Future implementation to determine next curriculum day target
    throw new Error("Not implemented");
  }

  public hasSufficientCoverage(visitedDays: number[], questionCount: number): boolean {
    // TODO: Future implementation to verify min 4 days & min 8 questions criteria
    throw new Error("Not implemented");
  }
}
